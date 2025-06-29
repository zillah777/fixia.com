const { Pool } = require('pg');

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL environment variable not found');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('PG') || key.includes('DATABASE')));
    return;
  }
  
  console.log('🔗 DATABASE_URL found, attempting connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();