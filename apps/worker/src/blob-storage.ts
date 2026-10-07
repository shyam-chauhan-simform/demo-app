import { BlobServiceClient } from '@azure/storage-blob';

const containerName = process.env.AZURE_STORAGE_CONTAINER ?? 'uploads';
const serviceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING as string,
);
const containerClient = serviceClient.getContainerClient(containerName);

export async function downloadBlob(blobName: string): Promise<Buffer> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.downloadToBuffer();
}
