// scripts/database-utility.ts
// Utility script for database management and troubleshooting

import { query, getSchemaInfo, initDatabase } from '../src/database';
import { logger } from '../src/utils/logger';

interface UtilityOptions {
  command: 'info' | 'init' | 'verify' | 'reset-schema-versions' | 'force-migration';
  version?: number;
}

// Type interfaces for query results
interface ExistsResult {
  exists: boolean;
}

interface CountResult {
  count: string; // PostgreSQL COUNT returns string
}

/**
 * Main utility function
 */
async function runDatabaseUtility(options: UtilityOptions): Promise<void> {
  logger.info(`🔧 Running database utility: ${options.command}`);
  
  try {
    switch (options.command) {
      case 'info':
        await showDatabaseInfo();
        break;
      case 'init':
        await initDatabase();
        break;
      case 'verify':
        await verifyDatabase();
        break;
      case 'reset-schema-versions':
        await resetSchemaVersions();
        break;
      case 'force-migration':
        await forceMigration(options.version);
        break;
      default:
        logger.error(`Unknown command: ${options.command}`);
        showUsage();
    }
  } catch (error) {
    logger.error(`❌ Utility command failed:`, error);
    throw error;
  }
}

/**
 * Show comprehensive database information
 */
async function showDatabaseInfo(): Promise<void> {
  console.log('\n📊 Database Information');
  console.log('========================');
  
  const schemaInfo = await getSchemaInfo();
  
  if (!schemaInfo) {
    console.log('❌ Could not retrieve schema information');
    return;
  }
  
  // Show tables
  console.log('\n📋 Tables:');
  schemaInfo.tables.forEach(table => {
    console.log(`  - ${table.table_name} (${table.table_type})`);
  });
  
  // Show users table columns
  console.log('\n👤 Users Table Columns:');
  schemaInfo.userColumns.forEach(col => {
    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
    const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
    console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
  });
  
  // Show migration history
  console.log('\n🔄 Migration History:');
  if (schemaInfo.schemaVersions.length === 0) {
    console.log('  No migrations recorded (schema_versions table may not exist)');
  } else {
    schemaInfo.schemaVersions.forEach(version => {
      console.log(`  - v${version.version}: ${version.description} (${version.applied_at})`);
    });
  }
  
  // Show current status
  const userCount = await query<CountResult>('SELECT COUNT(*) as count FROM users');
  const entryCount = await query<CountResult>('SELECT COUNT(*) as count FROM journal_entries');
  
  console.log('\n📈 Statistics:');
  console.log(`  - Users: ${userCount[0].count}`);
  console.log(`  - Journal Entries: ${entryCount[0].count}`);
  
  // Check for weekly streak columns
  console.log('\n🎯 Weekly Streak System:');
  const weeklyColumns = ['current_streak', 'longest_streak', 'total_points', 'last_entry_week'];
  
  for (const column of weeklyColumns) {
    const exists = await query<ExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = $1
      )
    `, [column]);
    
    const status = exists[0].exists ? '✅' : '❌';
    console.log(`  ${status} users.${column}`);
  }
}

/**
 * Verify database is properly set up
 */
async function verifyDatabase(): Promise<void> {
  console.log('\n🔍 Database Verification');
  console.log('========================');
  
  const requiredTables = ['users', 'journal_entries', 'last_prompts', 'feedback', 'points_history'];
  const requiredColumns = ['current_streak', 'longest_streak', 'total_points', 'last_entry_week'];
  const requiredViews = ['user_leaderboard', 'weekly_streak_stats'];
  
  // Check tables
  console.log('\n📋 Checking Tables:');
  for (const table of requiredTables) {
    const exists = await query<ExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [table]);
    
    const status = exists[0].exists ? '✅' : '❌';
    console.log(`  ${status} ${table}`);
  }
  
  // Check weekly streak columns
  console.log('\n🎯 Checking Weekly Streak Columns:');
  for (const column of requiredColumns) {
    const exists = await query<ExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = $1
      )
    `, [column]);
    
    const status = exists[0].exists ? '✅' : '❌';
    console.log(`  ${status} users.${column}`);
  }
  
  // Check views
  console.log('\n📊 Checking Views:');
  for (const view of requiredViews) {
    const exists = await query<ExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = $1
      )
    `, [view]);
    
    const status = exists[0].exists ? '✅' : '❌';
    console.log(`  ${status} ${view}`);
  }
  
  // Test basic functionality
  console.log('\n🧪 Testing Basic Functionality:');
  try {
    // Test user query
    await query<CountResult>('SELECT COUNT(*) as count FROM users');
    console.log('  ✅ Users table query');
    
    // Test weekly streak query
    await query('SELECT current_streak, total_points FROM users LIMIT 1');
    console.log('  ✅ Weekly streak columns query');
    
    // Test points history
    await query<CountResult>('SELECT COUNT(*) as count FROM points_history');
    console.log('  ✅ Points history table query');
    
    // Test views
    await query<CountResult>('SELECT COUNT(*) as count FROM user_leaderboard');
    console.log('  ✅ User leaderboard view');
    
    console.log('\n🎉 All verification tests passed!');
  } catch (error) {
    console.log(`\n❌ Verification failed: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Reset schema versions (use with caution)
 */
async function resetSchemaVersions(): Promise<void> {
  console.log('\n⚠️  Resetting Schema Versions');
  console.log('==============================');
  console.log('This will allow migrations to run again.');
  console.log('Use only if you need to re-apply migrations.');
  
  try {
    await query('DELETE FROM schema_versions');
    console.log('✅ Schema versions reset');
    console.log('💡 Run "init" command to apply migrations');
  } catch (error) {
    console.log('❌ Failed to reset schema versions:', (error as Error).message);
    console.log('💡 This might be normal if the schema_versions table doesn\'t exist yet');
  }
}

/**
 * Force apply a specific migration
 */
async function forceMigration(version?: number): Promise<void> {
  if (!version) {
    console.log('❌ Please specify a migration version');
    return;
  }
  
  console.log(`\n🔧 Force applying migration ${version}`);
  console.log('====================================');
  
  // This would require importing the specific migration functions
  // For now, recommend using the init command instead
  console.log('💡 For safety, please use the "init" command instead');
  console.log('   This will apply all necessary migrations automatically');
}

/**
 * Show usage information
 */
function showUsage(): void {
  console.log('\n📚 Database Utility Usage');
  console.log('=========================');
  console.log('');
  console.log('Commands:');
  console.log('  info     - Show database schema information');
  console.log('  init     - Initialize/migrate database');
  console.log('  verify   - Verify database is properly set up');
  console.log('  reset-schema-versions - Reset migration tracking (use with caution)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run db:info');
  console.log('  npm run db:init');
  console.log('  npm run db:verify');
  console.log('');
  console.log('Railway Examples:');
  console.log('  railway run npm run db:info');
  console.log('  railway run npm run db:init');
}

// Parse command line arguments
function parseArgs(): UtilityOptions {
  const args = process.argv.slice(2);
  const command = args[0] as UtilityOptions['command'];
  
  if (!command) {
    showUsage();
    process.exit(1);
  }
  
  const version = args[1] ? parseInt(args[1], 10) : undefined;
  
  return { command, version };
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();
  
  runDatabaseUtility(options)
    .then(() => {
      logger.info('✅ Database utility completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Database utility failed:', error);
      process.exit(1);
    });
}

export { runDatabaseUtility };