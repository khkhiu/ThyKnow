// File: src/database/index.ts (Updated for Weekly Streaks)
// Updated database initialization to include weekly streak system

import { Pool, PoolClient } from 'pg';
import config from '../config';
import { logger } from '../utils/logger';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Generic query function with proper typing
export const query = async <T = any>(text: string, params: any[] = []): Promise<T[]> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms:`, { text, params, rows: res.rowCount });
    return res.rows;
  } catch (error) {
    logger.error(`Database query error:`, { text, params, error });
    throw error;
  }
};

// Get a client from the pool for transactions
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Transaction helper
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

// Initialize database with weekly streak system
export const initDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing PostgreSQL database with weekly streak system...');
    
    const schema = `
      -- Create users table with weekly streak support
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        prompt_count INTEGER NOT NULL DEFAULT 0,
        schedule_day INTEGER NOT NULL DEFAULT 0,
        schedule_hour INTEGER NOT NULL DEFAULT 9,
        schedule_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        total_points INTEGER NOT NULL DEFAULT 0,
        last_entry_week VARCHAR(10)
      );

      -- Create last_prompts table (existing functionality)
      CREATE TABLE IF NOT EXISTS last_prompts (
        user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Create journal_entries table (existing functionality)
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prompt TEXT NOT NULL,
        prompt_type VARCHAR(50) NOT NULL,
        response TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Create feedback table (existing functionality)
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        is_resolved BOOLEAN NOT NULL DEFAULT FALSE
      );

      -- Create points_history table for weekly streak tracking
      CREATE TABLE IF NOT EXISTS points_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points_earned INTEGER NOT NULL,
        reason VARCHAR(100) NOT NULL,
        streak_week INTEGER NOT NULL,
        week_identifier VARCHAR(10) NOT NULL,
        entry_id INTEGER REFERENCES journal_entries(id) ON DELETE SET NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Create indices for efficient querying
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_timestamp ON journal_entries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_timestamp ON journal_entries(user_id, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp);
      CREATE INDEX IF NOT EXISTS idx_feedback_is_resolved ON feedback(is_resolved);
      
      -- Weekly streak system indices
      CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_points_history_timestamp ON points_history(timestamp);
      CREATE INDEX IF NOT EXISTS idx_points_history_week ON points_history(week_identifier);
      CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak);
      CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points);
      CREATE INDEX IF NOT EXISTS idx_users_last_entry_week ON users(last_entry_week);

      -- Create view for weekly leaderboard
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
      ORDER BY total_points DESC, current_streak DESC;

      -- Create view for weekly statistics
      CREATE OR REPLACE VIEW weekly_streak_stats AS
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN current_streak > 0 THEN 1 END) as active_streaks,
        ROUND(AVG(CASE WHEN current_streak > 0 THEN current_streak END), 2) as avg_active_streak,
        MAX(current_streak) as longest_current_streak,
        MAX(longest_streak) as longest_streak_ever,
        SUM(total_points) as total_points_awarded,
        COUNT(CASE WHEN last_entry_week = to_char(CURRENT_DATE, 'IYYY-"W"IW') THEN 1 END) as entries_this_week
      FROM users;
      `;
    
    // Execute schema creation
    await query(schema);
    
    // Verify the weekly streak system is properly set up
    await verifyWeeklyStreakSystem();
    
    logger.info('✅ PostgreSQL database with weekly streak system initialized successfully');
  } catch (error) {
    logger.error('❌ Error initializing PostgreSQL database:', error);
    throw error;
  }
};

// Verify the weekly streak system is properly set up
async function verifyWeeklyStreakSystem(): Promise<void> {
  try {
    // Check that all required tables exist
    const tables = ['users', 'points_history', 'journal_entries', 'last_prompts', 'feedback'];
    for (const table of tables) {
      const exists = await query(`
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
      const exists = await query(`
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
      const exists = await query(`
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

// Get weekly streak system statistics
export const getWeeklySystemStats = async (): Promise<{
  totalUsers: number;
  activeStreaks: number;
  avgActiveStreak: number;
  longestCurrentStreak: number;
  longestStreakEver: number;
  totalPointsAwarded: number;
  entriesThisWeek: number;
}> => {
  try {
    const result = await query<{
      total_users: number;
      active_streaks: number;
      avg_active_streak: number;
      longest_current_streak: number;
      longest_streak_ever: number;
      total_points_awarded: number;
      entries_this_week: number;
    }>('SELECT * FROM weekly_streak_stats');
    
    const stats = result[0];
    return {
      totalUsers: stats.total_users,
      activeStreaks: stats.active_streaks,
      avgActiveStreak: stats.avg_active_streak,
      longestCurrentStreak: stats.longest_current_streak,
      longestStreakEver: stats.longest_streak_ever,
      totalPointsAwarded: stats.total_points_awarded,
      entriesThisWeek: stats.entries_this_week
    };
  } catch (error) {
    logger.error('Error fetching weekly system stats:', error);
    throw error;
  }
};

export default {
  query,
  getClient,
  transaction,
  initDatabase,
  checkDatabaseConnection,
  closePool,
  getWeeklySystemStats,
};