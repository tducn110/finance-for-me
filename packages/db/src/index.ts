import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

export const connection = mysql.createPool(connectionString);

export const db = drizzle(connection, { schema, mode: 'default' });
export * from './schema';
export * from 'drizzle-orm';
