// src/database/index.ts
// Refactored PostgreSQL connection with built-in schema migration support

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

// Database schema version tracking
interface SchemaVersion {
  version: number;
  applied_at: Date;
  description: string;
}

// Type interfaces for query results
interface ExistsResult {
  exists: boolean;
}
/*
interface CountResult {
  count: string; // PostgreSQL COUNT returns string
}
*/
interface TableInfo {
  table_name: string;
  table_type: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

/**
 * Initialize database with proper schema migration support
 * Handles both fresh installations and upgrades from existing schemas
 */
export const initDatabase = async (): Promise<void> => {
  logger.info('🚀 Initializing PostgreSQL database with migration support...');
  
  try {
    // Step 1: Create schema version tracking table
    await createSchemaVersionTable();
    
    // Step 2: Get current schema version
    const currentVersion = await getCurrentSchemaVersion();
    logger.info(`📊 Current database schema version: ${currentVersion}`);
    
    // Step 3: Apply migrations based on current version
    await applyMigrations(currentVersion);
    
    // Step 4: Verify the weekly streak system is properly set up
    await verifyWeeklyStreakSystem();
    
    logger.info('✅ PostgreSQL database with weekly streak system initialized successfully');
  } catch (error) {
    logger.error('❌ Error initializing PostgreSQL database:', error);
    throw error;
  }
};

/**
 * Create schema version tracking table
 */
async function createSchemaVersionTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      description TEXT NOT NULL
    )
  `);
}

/**
 * Get current schema version
 */
async function getCurrentSchemaVersion(): Promise<number> {
  try {
    const result = await query<SchemaVersion>(`
      SELECT version FROM schema_versions ORDER BY version DESC LIMIT 1
    `);
    return result.length > 0 ? result[0].version : 0;
  } catch (error) {
    logger.warn('Could not determine current schema version, assuming version 0');
    return 0;
  }
}

/**
 * Apply database migrations based on current version
 */
async function applyMigrations(currentVersion: number): Promise<void> {
  const migrations = [
    {
      version: 1,
      description: 'Create base tables (users, journal_entries, last_prompts, feedback)',
      migration: applyMigration1_BaseTables
    },
    {
      version: 2,
      description: 'Add weekly streak columns to users table',
      migration: applyMigration2_WeeklyStreakColumns
    },
    {
      version: 3,
      description: 'Create points_history table and indices',
      migration: applyMigration3_PointsHistoryAndIndices
    },
    {
      version: 4,
      description: 'Create database views for leaderboard and statistics',
      migration: applyMigration4_DatabaseViews
    }
  ];

  for (const { version, description, migration } of migrations) {
    if (currentVersion < version) {
      logger.info(`📈 Applying migration ${version}: ${description}`);
      
      await transaction(async (client) => {
        // Apply the migration
        await migration(client);
        
        // Record the migration
        await client.query(`
          INSERT INTO schema_versions (version, description) 
          VALUES ($1, $2)
          ON CONFLICT (version) DO NOTHING
        `, [version, description]);
      });
      
      logger.info(`✅ Migration ${version} applied successfully`);
    }
  }
}

/**
 * Migration 1: Create base tables
 */
async function applyMigration1_BaseTables(client: PoolClient): Promise<void> {
  // Create users table with basic columns
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      prompt_count INTEGER NOT NULL DEFAULT 0,
      schedule_day INTEGER NOT NULL DEFAULT 0,
      schedule_hour INTEGER NOT NULL DEFAULT 9,
      schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);

  // Create journal_entries table
  await client.query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      prompt_type VARCHAR(50) NOT NULL,
      response TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Create last_prompts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS last_prompts (
      user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Create feedback table
  await client.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      is_resolved BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);
}

/**
 * Migration 2: Add weekly streak columns to users table
 */
async function applyMigration2_WeeklyStreakColumns(client: PoolClient): Promise<void> {
  // Add weekly streak columns to existing users table
  const weeklyStreakColumns = [
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_entry_week VARCHAR(10)'
  ];

  for (const alterQuery of weeklyStreakColumns) {
    await client.query(alterQuery);
  }
}

/**
 * Migration 3: Create points_history table and database indices
 */
async function applyMigration3_PointsHistoryAndIndices(client: PoolClient): Promise<void> {
  // Create points_history table
  await client.query(`
    CREATE TABLE IF NOT EXISTS points_history (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      points_earned INTEGER NOT NULL,
      reason VARCHAR(100) NOT NULL,
      streak_week INTEGER NOT NULL,
      week_identifier VARCHAR(10) NOT NULL,
      entry_id INTEGER REFERENCES journal_entries(id) ON DELETE SET NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  // Create all database indices
  const indices = [
    // Journal entries indices
    'CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_journal_entries_timestamp ON journal_entries(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_journal_entries_user_timestamp ON journal_entries(user_id, timestamp DESC)',
    
    // Feedback indices
    'CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_feedback_is_resolved ON feedback(is_resolved)',
    
    // Weekly streak system indices (safe to create now that columns exist)
    'CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_points_history_timestamp ON points_history(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_points_history_week ON points_history(week_identifier)',
    'CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak)',
    'CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points)',
    'CREATE INDEX IF NOT EXISTS idx_users_last_entry_week ON users(last_entry_week)'
  ];

  for (const indexQuery of indices) {
    await client.query(indexQuery);
  }
}

/**
 * Migration 4: Create database views
 */
async function applyMigration4_DatabaseViews(client: PoolClient): Promise<void> {
  // Create user leaderboard view
  await client.query(`
    CREATE OR REPLACE VIEW user_leaderboard AS
    SELECT 
      id,
      current_streak,
      longest_streak,
      total_points,
      prompt_count,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, current_streak DESC) as rank
    FROM users
    WHERE total_points > 0
    ORDER BY total_points DESC, current_streak DESC
  `);

  // Create weekly streak statistics view
  await client.query(`
    CREATE OR REPLACE VIEW weekly_streak_stats AS
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN current_streak > 0 THEN 1 END) as active_streaks,
      ROUND(AVG(CASE WHEN current_streak > 0 THEN current_streak END), 2) as avg_active_streak,
      MAX(current_streak) as longest_current_streak,
      MAX(longest_streak) as longest_streak_ever,
      SUM(total_points) as total_points_awarded,
      COUNT(CASE WHEN last_entry_week = to_char(CURRENT_DATE, 'IYYY-"W"IW') THEN 1 END) as entries_this_week
    FROM users
  `);
}

/**
 * Verify the weekly streak system is properly set up
 */
async function verifyWeeklyStreakSystem(): Promise<void> {
  try {
    // Check that all required tables exist
    const tables = ['users', 'points_history', 'journal_entries', 'last_prompts', 'feedback'];
    for (const table of tables) {
      const exists = await query<ExistsResult>(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (!exists[0].exists) {
        throw new Error(`Required table '${table}' does not exist`);
      }
    }
    
    // Check that weekly streak columns exist in users table
    const weeklyColumns = ['current_streak', 'longest_streak', 'total_points', 'last_entry_week'];
    for (const column of weeklyColumns) {
      const exists = await query<ExistsResult>(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = $1
        )
      `, [column]);
      
      if (!exists[0].exists) {
        throw new Error(`Required weekly streak column '${column}' does not exist in users table`);
      }
    }
    
    // Check that views exist
    const views = ['user_leaderboard', 'weekly_streak_stats'];
    for (const view of views) {
      const exists = await query<ExistsResult>(`
        SELECT EXISTS (
          SELECT FROM information_schema.views 
          WHERE table_name = $1
        )
      `, [view]);
      
      if (!exists[0].exists) {
        logger.warn(`View '${view}' does not exist - this might affect some features`);
      }
    }
    
    logger.info('✅ Weekly streak system verification completed');
  } catch (error) {
    logger.error('❌ Weekly streak system verification failed:', error);
    throw error;
  }
}

/**
 * Get database schema information for debugging
 */
export const getSchemaInfo = async () => {
  try {
    const tables = await query<TableInfo>(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const userColumns = await query<ColumnInfo>(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    const schemaVersions = await query<SchemaVersion>(`
      SELECT * FROM schema_versions ORDER BY version DESC
    `);
    
    return {
      tables,
      userColumns,
      schemaVersions
    };
  } catch (error) {
    logger.error('Error getting schema info:', error);
    return null;
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

// Default export object
export default {
  query,
  getClient,
  transaction,
  initDatabase,
  checkDatabaseConnection,
  closePool,
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Closing database pool...');
  await pool.end();
  process.exit(0);
});