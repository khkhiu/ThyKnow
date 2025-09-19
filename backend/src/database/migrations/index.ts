// src/database/migrations/index.ts
// Centralized migration management

import { logger } from '../../utils/logger';
import { createAppUsageTrackingMigration, migrationInfo as appUsageInfo } from './addAppUsageTracking';

export interface Migration {
  name: string;
  version: string;
  description: string;
  up: () => Promise<any>;
  down: () => Promise<any>;
  isApplied: () => Promise<boolean>;
  info: () => any;
}

/**
 * Migration registry - add new migrations here
 */
export function getMigrations(): Migration[] {
  return [
    {
      name: 'AddAppUsageTracking',
      version: '1.0.0',
      description: 'Add app usage tracking functionality',
      up: async () => createAppUsageTrackingMigration().up(),
      down: async () => createAppUsageTrackingMigration().down(),
      isApplied: async () => createAppUsageTrackingMigration().isApplied(),
      info: () => appUsageInfo
    }
    // Add future migrations here
    // {
    //   name: 'AddNotificationSettings',
    //   version: '1.1.0',
    //   description: 'Add user notification preferences',
    //   up: async () => createNotificationSettingsMigration().up(),
    //   down: async () => createNotificationSettingsMigration().down(),
    //   isApplied: async () => createNotificationSettingsMigration().isApplied(),
    //   info: () => notificationSettingsInfo
    // }
  ];
}

/**
 * Migration manager class
 */
export class MigrationManager {
  private migrations: Migration[];

  constructor() {
    this.migrations = getMigrations();
  }

  /**
   * Get all migrations
   */
  getMigrations(): Migration[] {
    return this.migrations;
  }

  /**
   * Get migration by name
   */
  getMigration(name: string): Migration | undefined {
    return this.migrations.find(m => m.name === name);
  }

  /**
   * Check which migrations have been applied
   */
  async getAppliedMigrations(): Promise<string[]> {
    const applied: string[] = [];
    
    for (const migration of this.migrations) {
      try {
        const isApplied = await migration.isApplied();
        if (isApplied) {
          applied.push(migration.name);
        }
      } catch (error) {
        logger.warn(`Error checking migration ${migration.name}:`, error);
      }
    }
    
    return applied;
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<Migration[]> {
    const pending: Migration[] = [];
    
    for (const migration of this.migrations) {
      try {
        const isApplied = await migration.isApplied();
        if (!isApplied) {
          pending.push(migration);
        }
      } catch (error) {
        logger.warn(`Error checking migration ${migration.name}:`, error);
        // Assume it's pending if we can't check
        pending.push(migration);
      }
    }
    
    return pending;
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations(): Promise<{
    success: boolean;
    results: Array<{ name: string; success: boolean; message: string }>;
  }> {
    const pending = await this.getPendingMigrations();
    const results: Array<{ name: string; success: boolean; message: string }> = [];
    
    logger.info(`Found ${pending.length} pending migrations`);
    
    for (const migration of pending) {
      logger.info(`Running migration: ${migration.name}`);
      
      try {
        const result = await migration.up();
        results.push({
          name: migration.name,
          success: result.success || true,
          message: result.message || 'Migration completed'
        });
        
        logger.info(`Migration ${migration.name} completed successfully`);
      } catch (error: any) {
        const errorMessage = `Migration ${migration.name} failed: ${error.message}`;
        logger.error(errorMessage, error);
        
        results.push({
          name: migration.name,
          success: false,
          message: errorMessage
        });
        
        // Stop on first failure
        break;
      }
    }
    
    const allSuccessful = results.every(r => r.success);
    
    return {
      success: allSuccessful,
      results
    };
  }

  /**
   * Rollback specific migration
   */
  async rollbackMigration(name: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const migration = this.getMigration(name);
    
    if (!migration) {
      return {
        success: false,
        message: `Migration ${name} not found`
      };
    }

    const isApplied = await migration.isApplied();
    if (!isApplied) {
      return {
        success: false,
        message: `Migration ${name} is not applied`
      };
    }

    try {
      logger.info(`Rolling back migration: ${name}`);
      const result = await migration.down();
      
      logger.info(`Migration ${name} rolled back successfully`);
      return {
        success: result.success || true,
        message: result.message || 'Migration rolled back successfully'
      };
    } catch (error: any) {
      const errorMessage = `Rollback of ${name} failed: ${error.message}`;
      logger.error(errorMessage, error);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Get migration status summary
   */
  async getStatus(): Promise<{
    total: number;
    applied: number;
    pending: number;
    appliedMigrations: string[];
    pendingMigrations: string[];
  }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = await this.getPendingMigrations();
    
    return {
      total: this.migrations.length,
      applied: appliedMigrations.length,
      pending: pendingMigrations.length,
      appliedMigrations,
      pendingMigrations: pendingMigrations.map(m => m.name)
    };
  }

  /**
   * Create migrations table for tracking (future enhancement)
   */
  async createMigrationsTable(): Promise<void> {
    const { getClient } = await import('../index');
    const client = await getClient();
    
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          version VARCHAR(50) NOT NULL,
          description TEXT,
          applied_at TIMESTAMP DEFAULT NOW(),
          rollback_sql TEXT
        )
      `);
      
      logger.info('Migrations tracking table created');
    } catch (error) {
      logger.error('Error creating migrations table:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

/**
 * Create migration manager instance
 */
export function createMigrationManager(): MigrationManager {
  return new MigrationManager();
}

/**
 * Export available migrations info
 */
export const availableMigrations = {
  addAppUsageTracking: appUsageInfo
  // Add future migration info here
};