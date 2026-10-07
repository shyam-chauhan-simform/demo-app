export type FileStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FileRecord {
  id: string;
  originalName: string;
  blobName: string;
  mimeType: string;
  sizeBytes: number;
  status: FileStatus;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}
