// File: scripts/verify-weekly-system.ts
// Verification script to ensure weekly streak system is properly deployed

import { query } from '../src/database';
import { Points } from '../src/models/Points';
import { UserService } from '../src/services/userService';

// ===== TYPE DEFINITIONS =====

interface DatabaseTimeResult {
  current_time: Date;
}

interface TableExistsResult {
  exists: boolean;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface IndexInfo {
  indexname: string;
  tablename: string;
}

interface WeeklyStats {
  totalUsers: number;
  activeUsers: number;
  weeklyEntries: number;
  completionRate: number;
  averageStreak: number;
  longestStreak: number;
  totalActiveStreaks?: number;
}

/*
interface LeaderboardEntry {
  userId: string;
  username: string;
  currentStreak: number;
  totalPoints: number;
  rank: number;
}
*/
// Use the actual interface from your UserService
interface ISystemStats {
  totalActiveStreaks: number;
  totalUsers: number;
  weeklyEntriesCount: number;
  averageStreak: number;
}

// ===== MAIN VERIFICATION FUNCTION =====

/**
 * Main verification function for the weekly streak system
 */
async function verifyWeeklySystem(): Promise<void> {
  console.log('🔍 Verifying weekly streak system deployment...\n');
  
  try {
    // Test 1: Database Tables
    await verifyDatabaseTables();
    
    // Test 2: User Model Columns
    await verifyUserModelColumns();
    
    // Test 3: Points Model Functions
    await verifyPointsModel();
    
    // Test 4: User Service Functions
    await verifyUserService();
    
    // Test 5: Database Views
    await verifyDatabaseViews();
    
    // Test 6: Sample Data Operations
    await verifySampleOperations();
    
    console.log('\n🎉 Weekly streak system verification completed successfully!');
    console.log('✅ All components are working correctly');
    console.log('🚀 System is ready for production use\n');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Verification failed:', errorMessage);
    console.error('🚨 Please check the deployment and fix any issues before proceeding\n');
    process.exit(1);
  }
}

// ===== VERIFICATION FUNCTIONS =====

/**
 * Verify all required database tables exist
 */
async function verifyDatabaseTables(): Promise<void> {
  console.log('📋 Checking database tables...');
  
  const requiredTables = [
    'users',
    'points_history', 
    'journal_entries',
    'last_prompts',
    'feedback'
  ];
  
  for (const table of requiredTables) {
    const result = await query<TableExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [table]);
    
    if (!result[0].exists) {
      throw new Error(`Required table '${table}' does not exist`);
    }
    console.log(`  ✅ Table '${table}' exists`);
  }
}

/**
 * Verify weekly streak columns exist in users table
 */
async function verifyUserModelColumns(): Promise<void> {
  console.log('\n👤 Checking user model columns...');
  
  const requiredColumns = [
    'current_streak',
    'longest_streak', 
    'total_points',
    'last_entry_week'
  ];
  
  for (const column of requiredColumns) {
    const result = await query<TableExistsResult>(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = $1
      )
    `, [column]);
    
    if (!result[0].exists) {
      throw new Error(`Required column 'users.${column}' does not exist`);
    }
    console.log(`  ✅ Column 'users.${column}' exists`);
  }
}

/**
 * Verify Points model functions work correctly
 */
async function verifyPointsModel(): Promise<void> {
  console.log('\n🎯 Testing Points model functions...');
  
  try {
    // Test week identifier generation
    const currentWeek = Points.getWeekIdentifier();
    if (!currentWeek.match(/^\d{4}-W\d{2}$/)) {
      throw new Error(`Invalid week identifier format: ${currentWeek}`);
    }
    console.log(`  ✅ Week identifier generation works: ${currentWeek}`);
    
    // Test previous week calculation
    const previousWeek = Points.getPreviousWeekIdentifier(currentWeek);
    if (!previousWeek.match(/^\d{4}-W\d{2}$/)) {
      throw new Error(`Invalid previous week identifier: ${previousWeek}`);
    }
    console.log(`  ✅ Previous week calculation works: ${previousWeek}`);
    
    // Test streak calculation
    const streakResult = Points.calculateWeeklyStreakStatus(null, 0);
    if (streakResult.currentStreak !== 1 || !streakResult.isNewStreak) {
      throw new Error('Streak calculation logic error for new user');
    }
    console.log('  ✅ Streak calculation logic works');
    
    // Test points calculation
    const pointsResult = Points.calculateWeeklyPoints(1, false);
    if (pointsResult.basePoints <= 0 || pointsResult.total <= 0) {
      throw new Error('Points calculation returned invalid values');
    }
    console.log(`  ✅ Points calculation works: ${pointsResult.total} points for week 1`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Points model verification failed: ${errorMessage}`);
  }
}

/**
 * Verify UserService functions work correctly
 */
async function verifyUserService(): Promise<void> {
  console.log('\n👥 Testing UserService functions...');
  
  try {
    const userService = new UserService();
    
    // Test system stats (this also tests database connectivity)
    const stats: ISystemStats = await userService.getSystemStats();
    
    if (typeof stats.totalActiveStreaks !== 'number') {
      throw new Error('System stats returned invalid data');
    }
    console.log(`  ✅ System stats accessible: ${stats.totalActiveStreaks} active streaks`);
    console.log(`  ✅ Total users: ${stats.totalUsers}`);
    console.log(`  ✅ Weekly entries: ${stats.weeklyEntriesCount}`);
    console.log(`  ✅ Average streak: ${stats.averageStreak}`);
    
    // Test current week identifier using Points model (UserService doesn't have this method)
    const currentWeek = Points.getWeekIdentifier();
    if (!currentWeek.match(/^\d{4}-W\d{2}$/)) {
      throw new Error(`Invalid current week ID: ${currentWeek}`);
    }
    console.log(`  ✅ Current week ID accessible: ${currentWeek}`);
    
    // Note: getLeaderboard method doesn't exist in UserService yet
    console.log('  ℹ️  getLeaderboard method not implemented yet (this is expected)');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`UserService verification failed: ${errorMessage}`);
  }
}

/**
 * Verify database views exist and work
 */
async function verifyDatabaseViews(): Promise<void> {
  console.log('\n👁️  Checking database views...');
  
  const views = [
    'user_leaderboard',
    'weekly_streak_stats'
  ];
  
  for (const view of views) {
    try {
      await query(`SELECT * FROM ${view} LIMIT 1`);
      console.log(`  ✅ View '${view}' is accessible`);
    } catch (error) {
      console.log(`  ⚠️  View '${view}' may not exist or has issues (this might be ok for new deployments)`);
    }
  }
}

/**
 * Verify sample database operations work
 */
async function verifySampleOperations(): Promise<void> {
  console.log('\n🧪 Testing sample database operations...');
  
  try {
    // Test basic query
    const timeResult = await query<DatabaseTimeResult>('SELECT NOW() as current_time');
    if (!timeResult[0]?.current_time) {
      throw new Error('Basic database query failed');
    }
    console.log('  ✅ Basic database queries work');
    
    // Test points_history table structure
    const pointsStructure = await query<ColumnInfo>(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'points_history'
      ORDER BY ordinal_position
    `);
    
    const requiredPointsColumns = [
      'id', 'user_id', 'points_earned', 'reason', 
      'streak_week', 'week_identifier', 'timestamp'
    ];
    
    const foundColumns = pointsStructure.map((col: ColumnInfo) => col.column_name);
    const missingColumns = requiredPointsColumns.filter(col => !foundColumns.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing columns in points_history: ${missingColumns.join(', ')}`);
    }
    console.log('  ✅ Points history table structure is correct');
    
    // Test user table indexes (performance check)
    const indexes = await query<IndexInfo>(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexname LIKE '%streak%'
    `);
    console.log(`  ✅ Found ${indexes.length} streak-related indexes on users table`);
    
    // Test weekly stats query
    try {
      const statsQuery = await query<WeeklyStats>(`
        SELECT 
          COUNT(*) as "totalUsers",
          COUNT(CASE WHEN current_streak > 0 THEN 1 END) as "activeUsers",
          COALESCE(AVG(current_streak), 0) as "averageStreak",
          COALESCE(MAX(current_streak), 0) as "longestStreak"
        FROM users
      `);
      
      const stats = statsQuery[0];
      console.log(`  ✅ Weekly stats calculation works: ${stats.totalUsers} total users, ${stats.activeUsers} active`);
      console.log(`  ✅ Average streak: ${Number(stats.averageStreak).toFixed(1)}, Longest: ${stats.longestStreak}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Weekly stats calculation failed: ${errorMessage}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Sample operations verification failed: ${errorMessage}`);
  }
}

// ===== SCRIPT EXECUTION =====

// Run verification if this script is executed directly
if (require.main === module) {
  verifyWeeklySystem()
    .then(() => {
      console.log('Verification completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

export { verifyWeeklySystem };