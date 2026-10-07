import { useRef, useState } from 'react';
import { uploadFile } from '../api';

interface Props {
  onUploaded: () => void;
}

export function UploadForm({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    try {
      await uploadFile(file);
      if (inputRef.current) inputRef.current.value = '';
      onUploaded();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input ref={inputRef} type="file" required />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading…' : 'Upload'}
      </button>
      {errorMessage && <span className="error">{errorMessage}</span>}
    </form>
  );
}
