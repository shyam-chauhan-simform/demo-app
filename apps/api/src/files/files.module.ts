import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { FileRecord } from './file.entity';
import { FilesController } from './files.controller';
import { FilesService, FILE_PROCESSING_QUEUE } from './files.service';
import { BlobStorageService } from '../blob-storage/blob-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileRecord]),
    BullModule.registerQueue({ name: FILE_PROCESSING_QUEUE }),
  ],
  controllers: [FilesController],
  providers: [FilesService, BlobStorageService],
})
export class FilesModule {}
