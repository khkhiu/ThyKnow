// File: scripts/init-database.ts
// Database initialization script for production deployment

import { initDatabase, checkDatabaseConnection } from '../src/database';
import { logger } from '../src/utils/logger';
import config from '../src/config';

/**
 * Initialize database for production deployment
 * This script ensures all tables, indexes, and views are created
 */
async function initializeDatabase(): Promise<void> {
  console.log('🚀 Initializing ThyKnow database with weekly streak system...\n');
  
  try {
    // Step 1: Check database connection
    console.log('🔌 Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      throw new Error('Unable to connect to database. Please check your DATABASE_URL environment variable.');
    }
    console.log('✅ Database connection successful\n');
    
    // Step 2: Initialize database schema
    console.log('📋 Initializing database schema...');
    await initDatabase();
    console.log('✅ Database schema initialized successfully\n');
    
    // Step 3: Verify initialization
    console.log('🔍 Verifying database initialization...');
    await verifyInitialization();
    console.log('✅ Database verification completed\n');
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 ThyKnow with weekly streak system is ready for use\n');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('🚨 Please check your database configuration and try again\n');
    throw error;
  }
}

/**
 * Verify that database initialization was successful
 */
async function verifyInitialization(): Promise<void> {
  const { query } = require('../src/database');
  
  // Check that all required tables exist
  const requiredTables = [
    'users',
    'points_history',
    'journal_entries', 
    'last_prompts',
    'feedback'
  ];
  
  console.log('  Checking required tables...');
  for (const table of requiredTables) {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [table]);
    
    if (!result[0].exists) {
      throw new Error(`Required table '${table}' was not created`);
    }
    console.log(`    ✓ ${table}`);
  }
  
  // Check that weekly streak columns exist
  console.log('  Checking weekly streak columns...');
  const weeklyColumns = [
    'current_streak',
    'longest_streak',
    'total_points', 
    'last_entry_week'
  ];
  
  for (const column of weeklyColumns) {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = $1
      )
    `, [column]);
    
    if (!result[0].exists) {
      throw new Error(`Weekly streak column 'users.${column}' was not created`);
    }
    console.log(`    ✓ users.${column}`);
  }
  
  // Check that key indexes exist
  console.log('  Checking database indexes...');
  const keyIndexes = [
    'idx_points_history_user_id',
    'idx_users_current_streak',
    'idx_journal_entries_user_id'
  ];
  
  for (const indexName of keyIndexes) {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = $1 AND n.nspname = 'public'
      )
    `, [indexName]);
    
    if (!result[0].exists) {
      console.log(`    ⚠️  Index '${indexName}' not found (may impact performance)`);
    } else {
      console.log(`    ✓ ${indexName}`);
    }
  }
}

/**
 * Display database configuration info
 */
function displayDatabaseInfo(): void {
  console.log('📝 Database Configuration:');
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Database URL: ${config.databaseUrl ? 'Set' : 'Not set'}`);
  
  if (config.databaseUrl) {
    try {
      const url = new URL(config.databaseUrl);
      console.log(`  Host: ${url.hostname}`);
      console.log(`  Port: ${url.port || '5432'}`);
      console.log(`  Database: ${url.pathname.slice(1)}`);
      console.log(`  SSL: ${config.nodeEnv === 'production' ? 'Enabled' : 'Disabled'}`);
    } catch {
      console.log(`  URL format: ${config.databaseUrl.substring(0, 20)}...`);
    }
  }
  console.log('');
}

/**
 * Create a test user to verify the system works
 */
async function createTestUserIfNeeded(): Promise<void> {
  const { query } = require('../src/database');
  
  try {
    // Check if any users exist
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    
    if (userCount[0].count === 0) {
      console.log('📝 Creating test user for verification...');
      
      // Create a test user
      await query(`
        INSERT INTO users (
          id, 
          created_at,
          prompt_count,
          schedule_day,
          schedule_hour,
          schedule_enabled,
          current_streak,
          longest_streak,
          total_points,
          last_entry_week
        ) VALUES (
          'test_user_12345',
          NOW(),
          0,
          0,
          10,
          true,
          0,
          0,
          0,
          NULL
        )
        ON CONFLICT (id) DO NOTHING
      `);
      
      console.log('✅ Test user created successfully');
    } else {
      console.log(`📊 Found ${userCount[0].count} existing users`);
    }
  } catch (error) {
    console.log('⚠️  Could not create test user:', error.message);
  }
}

// Run initialization if called directly
if (require.main === module) {
  // Display configuration first
  displayDatabaseInfo();
  
  initializeDatabase()
    .then(async () => {
      await createTestUserIfNeeded();
      console.log('Database initialization script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization script failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };