/**
 * PostgreSQL Database Configuration
 */

import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ai_storyline',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

// Helper function to execute queries
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`⚠️ Slow query (${duration}ms):`, text.substring(0, 100));
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

// Helper function to get a client from the pool (for transactions)
export function getClient() {
  return pool.connect();
}

// Graceful shutdown
export async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

export default pool;

