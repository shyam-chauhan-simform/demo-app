import { createHash } from 'crypto';
import { Job } from 'bullmq';
import { dataSource } from './data-source';
import { FileRecord } from './file.entity';
import { downloadBlob } from './blob-storage';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTextLike(mimeType: string): boolean {
  return mimeType.startsWith('text/') || mimeType === 'application/json';
}

function analyze(buffer: Buffer, mimeType: string) {
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  const result: Record<string, unknown> = {
    sha256,
    sizeBytes: buffer.length,
  };

  if (isTextLike(mimeType)) {
    const text = buffer.toString('utf-8');
    result.lineCount = text.split(/\r\n|\r|\n/).length;
    result.wordCount = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
    result.charCount = text.length;
  }

  return result;
}

export async function processFileJob(job: Job<{ fileId: string }>) {
  const repo = dataSource.getRepository(FileRecord);
  const record = await repo.findOne({ where: { id: job.data.fileId } });
  if (!record) {
    throw new Error(`File record ${job.data.fileId} not found`);
  }

  await repo.update(record.id, { status: 'processing' });

  try {
    const buffer = await downloadBlob(record.blobName);
    // simulate non-trivial work so the "processing" state is visible in the UI
    await sleep(1500 + Math.random() * 1500);
    const result = analyze(buffer, record.mimeType);

    await repo.update(record.id, { status: 'completed', result, error: null });
  } catch (err) {
    await repo.update(record.id, {
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
