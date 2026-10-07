import type { FileRecord } from '../types';
import { downloadUrl } from '../api';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function resultSummary(record: FileRecord): string {
  if (record.status === 'failed') return record.error ?? 'Unknown error';
  if (record.status !== 'completed' || !record.result) return '—';
  const { wordCount, lineCount, sha256 } = record.result as {
    wordCount?: number;
    lineCount?: number;
    sha256?: string;
  };
  const parts: string[] = [];
  if (typeof wordCount === 'number') parts.push(`${wordCount} words`);
  if (typeof lineCount === 'number') parts.push(`${lineCount} lines`);
  if (sha256) parts.push(`sha256 ${sha256.slice(0, 10)}…`);
  return parts.join(' · ') || '—';
}

interface Props {
  files: FileRecord[];
}

export function FileList({ files }: Props) {
  if (files.length === 0) {
    return <p className="empty">No files uploaded yet.</p>;
  }

  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Status</th>
          <th>Result</th>
          <th>Uploaded</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {files.map((f) => (
          <tr key={f.id}>
            <td>{f.originalName}</td>
            <td>{formatBytes(f.sizeBytes)}</td>
            <td>
              <span className={`badge badge-${f.status}`}>{f.status}</span>
            </td>
            <td className="result">{resultSummary(f)}</td>
            <td>{new Date(f.createdAt).toLocaleTimeString()}</td>
            <td>
              {f.status === 'completed' && (
                <a href={downloadUrl(f.id)}>Download</a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
