import { useCallback, useEffect, useState } from 'react';
import { fetchFiles } from './api';
import type { FileRecord } from './types';
import { UploadForm } from './components/UploadForm';
import { FileList } from './components/FileList';

export default function App() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchFiles()
      .then(setFiles)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="app">
      <header>
        <h1>File Upload & Processing Demo</h1>
        <p className="subtitle">
          React SPA → NestJS API → Blob Storage + Postgres → Worker (queue)
        </p>
      </header>

      <UploadForm onUploaded={refresh} />
      {error && <p className="error">{error}</p>}
      <FileList files={files} />
    </div>
  );
}
