import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
}

export async function queryDb<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const dbPool = getPool();
  if (!dbPool) {
    return [];
  }
  
  try {
    const result = await dbPool.query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await queryDb<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
