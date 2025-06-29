const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not found, skipping migrations');
    return;
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔗 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Database connection established');
    client.release();
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pgmigrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    console.log(`📁 Found ${files.length} migration files`);

    for (const file of files) {
      // Check if migration already ran
      const result = await pool.query('SELECT * FROM pgmigrations WHERE name = $1', [file]);
      
      if (result.rows.length === 0) {
        console.log(`▶️  Running migration: ${file}`);
        
        // Read and execute migration
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(migrationSQL);
        
        // Record migration as completed
        await pool.query('INSERT INTO pgmigrations (name) VALUES ($1)', [file]);
        
        console.log(`✅ Completed migration: ${file}`);
      } else {
        console.log(`⏭️  Skipping already run migration: ${file}`);
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();