import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { FileRecord } from './file.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'demo',
  password: process.env.POSTGRES_PASSWORD ?? 'demo',
  database: process.env.POSTGRES_DB ?? 'demo',
  entities: [FileRecord],
  synchronize: false,
});
