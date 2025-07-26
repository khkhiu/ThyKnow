// File: scripts/init-database.ts
// Database initialization script for production deployment

import { initDatabase, checkDatabaseConnection } from '../src/database';
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
    
  } catch (error) {
    // ✅ FIX: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Database initialization failed:', errorMessage);
    
    // Additional error details if it's an Error object
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    throw error; // Re-throw to ensure the process exits with error code
  }
}

/**
 * Verify that the database has been properly initialized
 */
async function verifyInitialization(): Promise<void> {
  const { query } = require('../src/database');
  
  try {
    // Check if key tables exist
    const tablesExist = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'prompt_entries', 'weekly_challenges')
    `);
    
    if (tablesExist.length < 3) {
      throw new Error('Not all required tables were created');
    }
    
    console.log('📊 Essential tables verified:', tablesExist.map((t: any) => t.table_name).join(', '));
    
  } catch (error) {
    // ✅ FIX: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Database verification failed:', errorMessage);
    throw error;
  }
}

/**
 * Display database configuration information
 */
function displayDatabaseInfo(): void {
  console.log('🔧 Database Configuration');
  console.log('=========================');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Database URL: ${config.databaseUrl ? 'Set' : 'Not set'}`);
  
  if (config.databaseUrl) {
    try {
      const url = new URL(config.databaseUrl);
      console.log(`  Host: ${url.hostname}`);
      console.log(`  Port: ${url.port || '5432'}`);
      console.log(`  Database: ${url.pathname.slice(1)}`);
      console.log(`  SSL: ${config.nodeEnv === 'production' ? 'Enabled' : 'Disabled'}`);
    } catch (error) {
      // ✅ FIX: Proper error type handling for URL parsing
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  URL format error: ${errorMessage}`);
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
    // ✅ FIX: Proper error type handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('⚠️  Could not create test user:', errorMessage);
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
      // ✅ FIX: Proper error type handling in main execution
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Database initialization script failed:', errorMessage);
      process.exit(1);
    });
}

export { initializeDatabase };