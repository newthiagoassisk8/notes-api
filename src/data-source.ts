import 'reflect-metadata';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { Note } from './entity/Note';

dotenv.config();

export const debugOn = () => {
    return Boolean(process.env.APP_DEBUG ?? false);
};

export const getDatabaseUrl = () => {
    // DATABASE_URL=postgres://postgres:postgres@localhost:5432/notesdb
    let dbUrl = process.env.DATABASE_URL || null;

    if (dbUrl) {
        return dbUrl;
    }

    let host = process.env.DB_HOST;
    let port = Number(process.env.DB_PORT || 5432);
    let username = process.env.DB_USER;
    let password = process.env.DB_PASS;
    let database = process.env.DB_NAME || 'notesdb';
    let dbSsl: boolean | string = Boolean(process.env.DB_SSL || false);
    dbSsl = dbSsl ? `?sslmode=require` : '';

    return `postgres://${username}:${password}@${host}:${port}/${database}${dbSsl}`;
};

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: getDatabaseUrl() || undefined,
    entities: [Note],
    migrations: [__dirname + '/migrations/*.{ts,js}'],
    synchronize: debugOn(), // sempre false em produção
    logging: debugOn(),
});
