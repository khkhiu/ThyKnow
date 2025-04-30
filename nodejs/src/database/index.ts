// src/database/index.ts
// Simplified PostgreSQL connection for Railway

import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

// Log all environment variables to help debug
logger.info('=== Environment Variables ===');
for (const key in process.env) {
  if (key.includes('DATABASE') || key.includes('DB_') || key.includes('RAILWAY')) {
    // Mask any sensitive values
    const value = key.includes('PASSWORD') || key.includes('URL') 
      ? '[MASKED]' 
      : process.env[key];
    logger.info(`${key}: ${value}`);
  }
}
logger.info('===========================');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL environment variable is not set!');
  logger.error('This is required for Railway PostgreSQL connection.');
  logger.error('Please make sure you have added the PostgreSQL plugin to your Railway project.');
}

// Create a single pool instance using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Log database connection attempt
logger.info(`Attempting to connect to PostgreSQL with DATABASE_URL`);
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    logger.info(`Database host is: ${url.hostname}`);
    logger.info(`Database port is: ${url.port}`);
    logger.info(`Database name is: ${url.pathname.substring(1)}`);
  } catch (error) {
    logger.error('Error parsing DATABASE_URL:', error);
  }
}

// Event handlers for the pool
pool.on('connect', () => {
  logger.info('Successfully connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error:', err);
});

// Export a function to get a client from the pool
export const getClient = async (): Promise<PoolClient> => {
  try {
    return await pool.connect();
  } catch (error) {
    logger.error('Error getting PostgreSQL client from pool:', error);
    throw error;
  }
};

// Helper function to execute a query
export const query = async <T>(text: string, params: any[] = []): Promise<T[]> => {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
};

// Helper for executing a transaction
export const transaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Export a function to initialize the database
export const initDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing PostgreSQL database...');
    
    // Schema creation SQL
    const schema = `
      -- Create Users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,         -- Telegram user ID
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        prompt_count INTEGER NOT NULL DEFAULT 0,
        schedule_day INTEGER NOT NULL DEFAULT 1,      -- Default: Monday
        schedule_hour INTEGER NOT NULL DEFAULT 9,     -- Default: 9 AM
        schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE
      );

      -- Create Last Prompt table with one-to-one relationship to User
      CREATE TABLE IF NOT EXISTS last_prompts (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('self_awareness', 'connections')),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Create Journal Entry table
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prompt TEXT NOT NULL,
        prompt_type VARCHAR(20) NOT NULL CHECK (prompt_type IN ('self_awareness', 'connections')),
        response TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Create indices for efficient querying
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_timestamp ON journal_entries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_timestamp ON journal_entries(user_id, timestamp DESC);
    `;
    
    // Execute schema creation
    await query(schema);
    logger.info('PostgreSQL database initialized successfully');
  } catch (error) {
    logger.error('Error initializing PostgreSQL database:', error);
    throw error;
  }
};

// Function to check database connectivity
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const result = await query<{ now: Date }>('SELECT NOW()');
    logger.info(`Database connection successful, server time: ${result[0]?.now}`);
    return true;
  } catch (error) {
    logger.error('Database connection check failed:', error);
    return false;
  }
};

// Export a function to close the pool (useful for graceful shutdown)
export const closePool = async (): Promise<void> => {
  await pool.end();
  logger.info('PostgreSQL connection pool closed');
};

export default {
  query,
  getClient,
  transaction,
  initDatabase,
  checkDatabaseConnection,
  closePool,
};