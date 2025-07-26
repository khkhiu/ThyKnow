// scripts/run-all-migrations.ts
// Script to run all pending migrations

import { config as dotenvConfig } from 'dotenv';
import { createMigrationManager } from '../src/database/migrations';

// Load environment variables
dotenvConfig();

async function runAllMigrations() {
  try {
    console.log('🌟 ThyKnow Database Migrations');
    console.log('=============================\n');
    
    const migrationManager = createMigrationManager();
    
    // Get current status
    console.log('🔍 Checking migration status...');
    const status = await migrationManager.getStatus();
    
    console.log(`\n📊 Migration Status:`);
    console.log(`   Total migrations: ${status.total}`);
    console.log(`   Applied: ${status.applied}`);
    console.log(`   Pending: ${status.pending}\n`);
    
    if (status.pending === 0) {
      console.log('✅ All migrations are already applied!');
      
      if (status.appliedMigrations.length > 0) {
        console.log('\n📋 Applied migrations:');
        status.appliedMigrations.forEach(name => {
          console.log(`   ✓ ${name}`);
        });
      }
      
      return;
    }
    
    console.log('📋 Pending migrations:');
    status.pendingMigrations.forEach(name => {
      console.log(`   ⏳ ${name}`);
    });
    
    console.log(`\n🔄 Running ${status.pending} pending migration(s)...\n`);
    
    // Run all pending migrations
    const result = await migrationManager.runPendingMigrations();
    
    if (result.success) {
      console.log('✅ All migrations completed successfully!\n');
      
      console.log('📊 Migration Results:');
      result.results.forEach(res => {
        const status = res.success ? '✅' : '❌';
        console.log(`   ${status} ${res.name}: ${res.message}`);
      });
      
      console.log('\n🎉 Database is now up to date!');
      console.log('\n📝 Next steps:');
      console.log('   1. Test with: npm run test:bot:frontend-first');
      console.log('   2. Start dev server: npm run dev');
      console.log('   3. Monitor with: npm run db:status');
      
    } else {
      console.error('❌ Some migrations failed!\n');
      
      console.error('📊 Migration Results:');
      result.results.forEach(res => {
        const status = res.success ? '✅' : '❌';
        console.error(`   ${status} ${res.name}: ${res.message}`);
      });
      
      console.error('\n🔧 Troubleshooting:');
      console.error('   1. Check database connectivity');
      console.error('   2. Review migration logs above');
      console.error('   3. Consider rolling back failed migrations');
      console.error('   4. Run: npm run migrate:status');
      
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('💥 Migration execution failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL environment variable');
    console.error('   2. Ensure PostgreSQL is running and accessible');
    console.error('   3. Verify database permissions');
    console.error('   4. Check the database logs');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllMigrations();
}

export { runAllMigrations };