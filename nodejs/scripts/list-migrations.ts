// scripts/list-migrations.ts
// Script to list all available migrations and their status

import { config as dotenvConfig } from 'dotenv';
import { createMigrationManager, availableMigrations } from '../src/database/migrations';

// Load environment variables
dotenvConfig();

async function listMigrations() {
  try {
    console.log('📋 ThyKnow Available Migrations');
    console.log('==============================\n');
    
    const migrationManager = createMigrationManager();
    const migrations = migrationManager.getMigrations();
    
    if (migrations.length === 0) {
      console.log('📝 No migrations available');
      return;
    }
    
    // Get status for each migration
    console.log('🔍 Checking migration status...\n');
    
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      let isApplied = false;
      let statusError = null;
      
      try {
        isApplied = await migration.isApplied();
      } catch (error: any) {
        statusError = error.message;
      }
      
      const status = statusError 
        ? '❓ Unknown' 
        : isApplied 
          ? '✅ Applied' 
          : '⏳ Pending';
      
      const info = migration.info();
      
      console.log(`${i + 1}. ${migration.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   Version: ${info.version}`);
      console.log(`   Description: ${info.description}`);
      console.log(`   Author: ${info.author || 'Unknown'}`);
      console.log(`   Dependencies: ${info.dependencies ? info.dependencies.join(', ') : 'None'}`);
      
      if (statusError) {
        console.log(`   ⚠️  Status Error: ${statusError}`);
      }
      
      console.log(''); // Empty line for spacing
    }
    
    // Summary
    const status = await migrationManager.getStatus();
    console.log('📊 Summary:');
    console.log(`   Total migrations: ${status.total}`);
    console.log(`   Applied: ${status.applied}`);
    console.log(`   Pending: ${status.pending}`);
    
    if (status.pending > 0) {
      console.log('\n💡 To run pending migrations:');
      console.log('   npm run migrate:all');
    }
    
    if (status.applied > 0) {
      console.log('\n💡 To check database status:');
      console.log('   npm run db:status');
    }
    
  } catch (error: any) {
    console.error('💥 Failed to list migrations:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL environment variable');
    console.error('   2. Ensure PostgreSQL is running and accessible');
    console.error('   3. Verify database permissions');
    process.exit(1);
  }
}

async function showMigrationDetails(migrationName: string) {
  try {
    const migrationManager = createMigrationManager();
    const migration = migrationManager.getMigration(migrationName);
    
    if (!migration) {
      console.error(`❌ Migration '${migrationName}' not found`);
      console.log('\n📋 Available migrations:');
      const migrations = migrationManager.getMigrations();
      migrations.forEach(m => console.log(`   - ${m.name}`));
      process.exit(1);
    }
    
    console.log(`📋 Migration Details: ${migrationName}`);
    console.log('=====================================\n');
    
    const info = migration.info();
    let isApplied = false;
    let statusError = null;
    
    try {
      isApplied = await migration.isApplied();
    } catch (error: any) {
      statusError = error.message;
    }
    
    console.log(`Name: ${migration.name}`);
    console.log(`Version: ${info.version}`);
    console.log(`Description: ${info.description}`);
    console.log(`Author: ${info.author || 'Unknown'}`);
    console.log(`Date: ${info.date || 'Unknown'}`);
    console.log(`Dependencies: ${info.dependencies ? info.dependencies.join(', ') : 'None'}`);
    
    const status = statusError 
      ? '❓ Unknown' 
      : isApplied 
        ? '✅ Applied' 
        : '⏳ Pending';
    
    console.log(`Status: ${status}`);
    
    if (statusError) {
      console.log(`Status Error: ${statusError}`);
    }
    
    console.log('\n💡 Available commands:');
    if (!isApplied && !statusError) {
      console.log(`   npm run migrate                    # Apply this migration`);
    }
    if (isApplied) {
      console.log(`   npm run migrate:rollback          # Rollback this migration`);
    }
    console.log(`   npm run migrate:status             # Check current status`);
    console.log(`   npm run test:bot:frontend-first    # Test after migration`);
    
  } catch (error: any) {
    console.error('💥 Failed to show migration details:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const migrationName = args[1];

// Run if called directly
if (require.main === module) {
  if (command === 'details' && migrationName) {
    showMigrationDetails(migrationName);
  } else if (command === 'details' && !migrationName) {
    console.error('❌ Please specify a migration name');
    console.log('Usage: npm run migrate:list details <migration-name>');
    process.exit(1);
  } else {
    listMigrations();
  }
}

export { listMigrations, showMigrationDetails };