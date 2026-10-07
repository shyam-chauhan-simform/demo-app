import 'reflect-metadata';
import { Worker } from 'bullmq';
import { dataSource } from './data-source';
import { processFileJob } from './process-file';

const FILE_PROCESSING_QUEUE = 'file-processing';

async function main() {
  await dataSource.initialize();
  // eslint-disable-next-line no-console
  console.log('Worker connected to Postgres');

  const worker = new Worker(FILE_PROCESSING_QUEUE, processFileJob, {
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 6),
  });

  worker.on('completed', (job) => {
    // eslint-disable-next-line no-console
    console.log(`Job ${job.id} completed (file ${job.data.fileId})`);
  });

  worker.on('failed', (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  // eslint-disable-next-line no-console
  console.log('Worker listening for file-processing jobs');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker failed to start', err);
  process.exit(1);
});
