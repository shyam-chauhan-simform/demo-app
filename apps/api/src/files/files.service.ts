import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { FileRecord } from './file.entity';
import { BlobStorageService } from '../blob-storage/blob-storage.service';

export const FILE_PROCESSING_QUEUE = 'file-processing';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileRecord) private readonly filesRepo: Repository<FileRecord>,
    @InjectQueue(FILE_PROCESSING_QUEUE) private readonly queue: Queue,
    private readonly blobStorage: BlobStorageService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<FileRecord> {
    const blobName = `${randomUUID()}-${file.originalname}`;
    await this.blobStorage.upload(blobName, file.buffer, file.mimetype);

    const record = this.filesRepo.create({
      originalName: file.originalname,
      blobName,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      status: 'pending',
      result: null,
      error: null,
    });
    const saved = await this.filesRepo.save(record);

    await this.queue.add('process', { fileId: saved.id });

    return saved;
  }

  findAll(): Promise<FileRecord[]> {
    return this.filesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FileRecord> {
    const record = await this.filesRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`File ${id} not found`);
    }
    return record;
  }

  async downloadBlob(id: string) {
    const record = await this.findOne(id);
    const response = await this.blobStorage.streamableDownload(record.blobName);
    return { record, body: response.readableStreamBody };
  }
}
