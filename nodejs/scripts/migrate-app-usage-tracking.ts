// scripts/migrate-app-usage-tracking.ts
// Script to run the app usage tracking migration using TypeScript migration

import { config as dotenvConfig } from 'dotenv';
import { createAppUsageTrackingMigration, migrationInfo } from '../src/database/migrations/addAppUsageTracking';

// Load environment variables
dotenvConfig();

async function runMigration() {
  try {
    console.log('🌟 ThyKnow App Usage Tracking Migration');
    console.log('=====================================\n');
    
    console.log('📋 Migration Info:');
    console.log(`   Name: ${migrationInfo.name}`);
    console.log(`   Version: ${migrationInfo.version}`);
    console.log(`   Description: ${migrationInfo.description}`);
    console.log(`   Date: ${migrationInfo.date}\n`);
    
    // Create migration instance
    const migration = createAppUsageTrackingMigration();
    
    // Check if already applied
    console.log('🔍 Checking migration status...');
    const isApplied = await migration.isApplied();
    
    if (isApplied) {
      console.log('✅ Migration has already been applied!');
      console.log('💡 Use npm run migrate:rollback to rollback if needed');
      
      // Show current status
      await showMigrationStatus();
      return;
    }
    
    console.log('🔄 Running migration...');
    
    // Execute the migration
    const result = await migration.up();
    
    if (result.success) {
      console.log('\n✅ Migration completed successfully!');
      
      if (result.changes.length > 0) {
        console.log('\n📊 Changes applied:');
        result.changes.forEach(change => console.log(`   ✓ ${change}`));
      }
      
      // Verify the migration
      await showMigrationStatus();
      
      console.log('\n🎉 Migration verification complete!');
      console.log('\n📝 Next steps:');
      console.log('   1. Test with: npm run test:bot:frontend-first');
      console.log('   2. Start dev server: npm run dev');
      console.log('   3. Monitor analytics in your app logs');
      
    } else {
      console.error('\n❌ Migration failed!');
      console.error('Error:', result.message);
      
      if (result.errors.length > 0) {
        console.error('\nErrors:');
        result.errors.forEach(error => console.error(`   ✗ ${error}`));
      }
      
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('💥 Migration execution failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL environment variable');
    console.error('   2. Ensure PostgreSQL is running and accessible');
    console.error('   3. Verify the users table exists');
    console.error('   4. Check database permissions');
    process.exit(1);
  }
}

async function showMigrationStatus() {
  const { query } = await import('../src/database');
  
  try {
    console.log('\n🔍 Migration Status:');
    
    // Check columns in users table
    const columnsResult = await query<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string;
    }>(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('last_miniapp_use', 'miniapp_usage_count')
      ORDER BY column_name
    `);
    
    if (columnsResult.length > 0) {
      console.log('   📊 New columns in users table:');
      columnsResult.forEach(row => {
        console.log(`      - ${row.column_name} (${row.data_type}${row.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
      });
    }
    
    // Check bot_command_usage table
    const tableResult = await query<{
      table_name: string;
    }>(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_name = 'bot_command_usage'
    `);
    
    if (tableResult.length > 0) {
      // Get record count
      const countResult = await query<{count: number}>('SELECT COUNT(*) as count FROM bot_command_usage');
      const recordCount = countResult[0]?.count || 0;
      console.log(`   📈 bot_command_usage table: Created (${recordCount} records)`);
    }
    
    // Check indexes
    const indexResult = await query<{
      indexname: string;
      tablename: string;
    }>(`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE tablename IN ('users', 'bot_command_usage')
      AND (indexname LIKE '%miniapp%' OR indexname LIKE '%bot_command%')
      ORDER BY tablename, indexname
    `);
    
    if (indexResult.length > 0) {
      console.log('   🏗️ Performance indexes:');
      indexResult.forEach(row => {
        console.log(`      - ${row.indexname} (${row.tablename})`);
      });
    }
    
    // Show user count for context
    const userCountResult = await query<{count: number}>('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult[0]?.count || 0;
    console.log(`   👥 Total users: ${userCount}`);
    
  } catch (error: any) {
    console.error('   ⚠️ Error checking migration status:', error.message);
  }
}

async function rollbackMigration() {
  try {
    console.log('🔙 Rolling back app usage tracking migration...\n');
    
    const migration = createAppUsageTrackingMigration();
    const result = await migration.down();
    
    if (result.success) {
      console.log('✅ Migration rollback completed successfully!');
      
      if (result.changes.length > 0) {
        console.log('\n📊 Changes reverted:');
        result.changes.forEach(change => console.log(`   ✓ ${change}`));
      }
    } else {
      console.error('❌ Migration rollback failed!');
      console.error('Error:', result.message);
      
      if (result.errors.length > 0) {
        console.error('\nErrors:');
        result.errors.forEach(error => console.error(`   ✗ ${error}`));
      }
      
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('💥 Migration rollback failed:', error);
    process.exit(1);
  }
}

async function checkMigrationStatus() {
  try {
    console.log('🔍 Checking migration status...\n');
    
    const migration = createAppUsageTrackingMigration();
    const isApplied = await migration.isApplied();
    
    console.log(`Migration Status: ${isApplied ? '✅ Applied' : '❌ Not Applied'}`);
    
    if (isApplied) {
      await showMigrationStatus();
    } else {
      console.log('\n💡 Run: npm run migrate to apply the migration');
    }
    
  } catch (error: any) {
    console.error('💥 Status check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'rollback':
      rollbackMigration();
      break;
    case 'status':
      checkMigrationStatus();
      break;
    default:
      runMigration();
      break;
  }
}

export { runMigration, rollbackMigration, checkMigrationStatus };