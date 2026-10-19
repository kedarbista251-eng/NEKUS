import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

export type DrizzleDb = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 20,
  });

  return drizzle(pool, { schema });
}

export * from './schema/index.js';
