import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Note } from './entity/Note';
import * as dotenv from 'dotenv';

dotenv.config();

const hasUrl = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: hasUrl ? process.env.DATABASE_URL : undefined,
  host: hasUrl ? undefined : process.env.DB_HOST,
  port: hasUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: hasUrl ? undefined : process.env.DB_USER,
  password: hasUrl ? undefined : process.env.DB_PASS,
  database: hasUrl ? undefined : process.env.DB_NAME,
  entities: [Note],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // sempre false em produção
  logging: false
});
