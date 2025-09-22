// src/database/migrations/addAppUsageTracking.ts
// Migration: Add app usage tracking to users table and create analytics table

import { PoolClient } from 'pg';
import { getClient, query } from '../index';
import { logger } from '../../utils/logger';

export interface MigrationResult {
  success: boolean;
  message: string;
  changes: string[];
  errors: string[];
}

/**
 * Migration to add app usage tracking functionality
 */
export class AddAppUsageTrackingMigration {

  constructor() {}

  /**
   * Execute the migration
   */
  async up(): Promise<MigrationResult> {
    const client = await getClient();
    const changes: string[] = [];
    const errors: string[] = [];

    try {
      logger.info('🔄 Starting app usage tracking migration...');

      // Start transaction
      await client.query('BEGIN');

      // 1. Add new columns to users table
      await this.addUsersColumns(client, changes, errors);

      // 2. Create bot_command_usage table
      await this.createBotCommandUsageTable(client, changes, errors);

      // 3. Create indexes for performance
      await this.createIndexes(client, changes, errors);

      // 4. Update existing users with default values
      await this.updateExistingUsers(client, changes, errors);

      // 5. Add table comments for documentation
      await this.addTableComments(client, changes, errors);

      // Commit transaction
      await client.query('COMMIT');

      logger.info('✅ App usage tracking migration completed successfully');

      return {
        success: true,
        message: 'App usage tracking migration completed successfully',
        changes,
        errors
      };

    } catch (error: any) {
      // Rollback on error
      await client.query('ROLLBACK');
      
      const errorMessage = `Migration failed: ${error.message}`;
      logger.error(errorMessage, error);
      errors.push(errorMessage);

      return {
        success: false,
        message: errorMessage,
        changes,
        errors
      };
    } finally {
      client.release();
    }
  }

  /**
   * Rollback the migration
   */
  async down(): Promise<MigrationResult> {
    const client = await getClient();
    const changes: string[] = [];
    const errors: string[] = [];

    try {
      logger.info('🔄 Rolling back app usage tracking migration...');

      await client.query('BEGIN');

      // Drop indexes
      const indexQueries = [
        'DROP INDEX IF EXISTS idx_users_last_miniapp_use',
        'DROP INDEX IF EXISTS idx_users_miniapp_usage_count',
        'DROP INDEX IF EXISTS idx_bot_command_usage_user_id',
        'DROP INDEX IF EXISTS idx_bot_command_usage_command',
        'DROP INDEX IF EXISTS idx_bot_command_usage_timestamp',
        'DROP INDEX IF EXISTS idx_bot_command_usage_user_command_time',
        'DROP INDEX IF EXISTS idx_bot_command_usage_unique_per_minute'
      ];

      for (const queryText of indexQueries) {
        try {
          await client.query(queryText);
          changes.push(`Dropped index: ${queryText.split(' ')[4]}`);
        } catch (error: any) {
          logger.warn(`Failed to drop index: ${error.message}`);
        }
      }

      // Drop table
      await client.query('DROP TABLE IF EXISTS bot_command_usage CASCADE');
      changes.push('Dropped table: bot_command_usage');

      // Remove columns from users table
      await client.query('ALTER TABLE users DROP COLUMN IF EXISTS last_miniapp_use');
      await client.query('ALTER TABLE users DROP COLUMN IF EXISTS miniapp_usage_count');
      changes.push('Removed columns from users table');

      await client.query('COMMIT');

      logger.info('✅ App usage tracking migration rollback completed');

      return {
        success: true,
        message: 'Migration rollback completed successfully',
        changes,
        errors
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      
      const errorMessage = `Migration rollback failed: ${error.message}`;
      logger.error(errorMessage, error);
      errors.push(errorMessage);

      return {
        success: false,
        message: errorMessage,
        changes,
        errors
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check if migration has been applied
   */
  async isApplied(): Promise<boolean> {    
    try {
      // Check if the new columns exist in users table
      const columnsResult = await query<{column_name: string}>(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('last_miniapp_use', 'miniapp_usage_count')
      `);

      // Check if bot_command_usage table exists
      const tableResult = await query<{table_name: string}>(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'bot_command_usage'
      `);

      return columnsResult.length === 2 && tableResult.length === 1;

    } catch (error) {
      logger.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Add new columns to users table
   */
  private async addUsersColumns(client: PoolClient, changes: string[], errors: string[]): Promise<void> {
    try {
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_miniapp_use TIMESTAMP,
        ADD COLUMN IF NOT EXISTS miniapp_usage_count INTEGER DEFAULT 0
      `);
      changes.push('Added last_miniapp_use and miniapp_usage_count columns to users table');
    } catch (error: any) {
      const errorMsg = `Failed to add columns to users table: ${error.message}`;
      errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * Create bot_command_usage table
   */
  private async createBotCommandUsageTable(client: PoolClient, changes: string[], errors: string[]): Promise<void> {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS bot_command_usage (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            command VARCHAR(50) NOT NULL,
            timestamp TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      changes.push('Created bot_command_usage table');
    } catch (error: any) {
      const errorMsg = `Failed to create bot_command_usage table: ${error.message}`;
      errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * Create performance indexes
   */
  private async createIndexes(client: PoolClient, changes: string[], errors: string[]): Promise<void> {
    const indexes = [
      {
        name: 'idx_users_last_miniapp_use',
        query: 'CREATE INDEX IF NOT EXISTS idx_users_last_miniapp_use ON users(last_miniapp_use)'
      },
      {
        name: 'idx_users_miniapp_usage_count',
        query: 'CREATE INDEX IF NOT EXISTS idx_users_miniapp_usage_count ON users(miniapp_usage_count)'
      },
      {
        name: 'idx_bot_command_usage_user_id',
        query: 'CREATE INDEX IF NOT EXISTS idx_bot_command_usage_user_id ON bot_command_usage(user_id)'
      },
      {
        name: 'idx_bot_command_usage_command',
        query: 'CREATE INDEX IF NOT EXISTS idx_bot_command_usage_command ON bot_command_usage(command)'
      },
      {
        name: 'idx_bot_command_usage_timestamp',
        query: 'CREATE INDEX IF NOT EXISTS idx_bot_command_usage_timestamp ON bot_command_usage(timestamp)'
      },
      {
        name: 'idx_bot_command_usage_user_command_time',
        query: 'CREATE INDEX IF NOT EXISTS idx_bot_command_usage_user_command_time ON bot_command_usage(user_id, command, timestamp)'
      },
      {
        name: 'idx_bot_command_usage_unique_per_minute',
        query: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_bot_command_usage_unique_per_minute ON bot_command_usage(user_id, command, date_trunc(\'minute\', timestamp))'
      }
    ];

    for (const index of indexes) {
      try {
        await client.query(index.query);
        changes.push(`Created index: ${index.name}`);
      } catch (error: any) {
        const errorMsg = `Failed to create index ${index.name}: ${error.message}`;
        errors.push(errorMsg);
        // Don't throw here, continue with other indexes
        logger.warn(errorMsg);
      }
    }
  }

  /**
   * Update existing users with default values
   */
  private async updateExistingUsers(client: PoolClient, changes: string[], errors: string[]): Promise<void> {
    try {
      const result = await client.query(`
        UPDATE users 
        SET miniapp_usage_count = 0 
        WHERE miniapp_usage_count IS NULL
      `);
      
      if (result.rowCount && result.rowCount > 0) {
        changes.push(`Updated ${result.rowCount} existing users with default miniapp_usage_count`);
      }
    } catch (error: any) {
      const errorMsg = `Failed to update existing users: ${error.message}`;
      errors.push(errorMsg);
      // Don't throw here, this is not critical
      logger.warn(errorMsg);
    }
  }

  /**
   * Add table comments for documentation
   */
  private async addTableComments(client: PoolClient, changes: string[], errors: string[]): Promise<void> {
    const comments = [
      {
        target: 'COLUMN users.last_miniapp_use',
        comment: 'Last time user accessed the miniapp'
      },
      {
        target: 'COLUMN users.miniapp_usage_count',
        comment: 'Total number of times user has accessed miniapp'
      },
      {
        target: 'TABLE bot_command_usage',
        comment: 'Analytics table for tracking bot command usage patterns'
      }
    ];

    for (const comment of comments) {
      try {
        await client.query(`COMMENT ON ${comment.target} IS '${comment.comment}'`);
        changes.push(`Added comment to ${comment.target}`);
      } catch (error: any) {
        const errorMsg = `Failed to add comment to ${comment.target}: ${error.message}`;
        errors.push(errorMsg);
        // Don't throw here, comments are not critical
        logger.warn(errorMsg);
      }
    }
  }

  /**
   * Get migration info
   */
  static getInfo() {
    return {
      name: 'AddAppUsageTracking',
      version: '1.0.0',
      description: 'Add app usage tracking columns and analytics table',
      author: 'ThyKnow Team',
      date: new Date().toISOString(),
      dependencies: ['users table must exist']
    };
  }
}

/**
 * Export migration instance factory
 */
export function createAppUsageTrackingMigration(): AddAppUsageTrackingMigration {
  return new AddAppUsageTrackingMigration();
}

/**
 * Export migration info
 */
export const migrationInfo = AddAppUsageTrackingMigration.getInfo();