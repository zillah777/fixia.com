import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'serviplay_user'}:${process.env.DB_PASSWORD || 'serviplay_pass'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'serviplay_db'}`,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DATABASE_URL?.includes('railway') || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;