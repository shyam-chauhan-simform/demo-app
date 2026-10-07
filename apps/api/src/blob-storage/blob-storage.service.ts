import { Injectable, OnModuleInit } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class BlobStorageService implements OnModuleInit {
  private containerClient: ContainerClient;

  async onModuleInit() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER ?? 'uploads';
    const serviceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = serviceClient.getContainerClient(containerName);
    await this.containerClient.createIfNotExists();
  }

  async upload(blobName: string, buffer: Buffer, mimeType: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });
  }

  async download(blobName: string): Promise<Buffer> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.downloadToBuffer();
  }

  streamableDownload(blobName: string) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.download();
  }
}
