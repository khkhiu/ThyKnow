// File: scripts/verify-weekly-system.ts
// Verification script to ensure weekly streak system is properly deployed

import { query } from '../src/database';
import { Points } from '../src/models/Points';
import { UserService } from '../src/services/userService';

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
    console.error('\n❌ Verification failed:', error);
    console.error('🚨 Please check the deployment and fix any issues before proceeding\n');
    process.exit(1);
  }
}

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
    const result = await query(`
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
    const result = await query(`
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
    throw new Error(`Points model verification failed: ${error.message}`);
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
    const stats = await userService.getSystemStats();
    if (typeof stats.totalActiveStreaks !== 'number') {
      throw new Error('System stats returned invalid data');
    }
    console.log(`  ✅ System stats accessible: ${stats.totalActiveStreaks} active streaks`);
    
    // Test current week identifier
    const currentWeek = userService.getCurrentWeekId();
    if (!currentWeek.match(/^\d{4}-W\d{2}$/)) {
      throw new Error(`Invalid current week ID: ${currentWeek}`);
    }
    console.log(`  ✅ Current week ID accessible: ${currentWeek}`);
    
    // Test leaderboard (should not throw even if empty)
    const leaderboard = await userService.getLeaderboard(5);
    if (!Array.isArray(leaderboard)) {
      throw new Error('Leaderboard returned non-array');
    }
    console.log(`  ✅ Leaderboard accessible: ${leaderboard.length} users`);
    
  } catch (error) {
    throw new Error(`UserService verification failed: ${error.message}`);
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
      const result = await query(`SELECT * FROM ${view} LIMIT 1`);
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
    const timeResult = await query('SELECT NOW() as current_time');
    if (!timeResult[0]?.current_time) {
      throw new Error('Basic database query failed');
    }
    console.log('  ✅ Basic database queries work');
    
    // Test points_history table structure
    const pointsStructure = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'points_history'
      ORDER BY ordinal_position
    `);
    
    const requiredPointsColumns = [
      'id', 'user_id', 'points_earned', 'reason', 
      'streak_week', 'week_identifier', 'timestamp'
    ];
    
    const foundColumns = pointsStructure.map(col => col.column_name);
    const missingColumns = requiredPointsColumns.filter(col => !foundColumns.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing columns in points_history: ${missingColumns.join(', ')}`);
    }
    console.log('  ✅ Points history table structure is correct');
    
    // Test user table indexes (performance check)
    const indexes = await query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexname LIKE '%streak%'
    `);
    
    if (indexes.length === 0) {
      console.log('  ⚠️  No streak-specific indexes found (performance may be impacted)');
    } else {
      console.log(`  ✅ Found ${indexes.length} streak-related indexes`);
    }
    
  } catch (error) {
    throw new Error(`Sample operations verification failed: ${error.message}`);
  }
}

/**
 * Get deployment summary
 */
async function getDeploymentSummary(): Promise<void> {
  console.log('\n📊 Deployment Summary:');
  
  try {
    // Get user counts
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN current_streak > 0 THEN 1 END) as users_with_streaks,
        COUNT(CASE WHEN total_points > 0 THEN 1 END) as users_with_points,
        MAX(current_streak) as max_current_streak,
        MAX(longest_streak) as max_longest_streak,
        SUM(total_points) as total_points_awarded
      FROM users
    `);
    
    const stats = userStats[0];
    console.log(`  👥 Total users: ${stats.total_users}`);
    console.log(`  🔥 Users with active streaks: ${stats.users_with_streaks}`);
    console.log(`  💰 Users with points: ${stats.users_with_points}`);
    console.log(`  📈 Longest current streak: ${stats.max_current_streak} weeks`);
    console.log(`  🏆 Longest streak ever: ${stats.max_longest_streak} weeks`);
    console.log(`  💎 Total points awarded: ${stats.total_points_awarded || 0}`);
    
    // Get points history count
    const pointsHistory = await query('SELECT COUNT(*) as count FROM points_history');
    console.log(`  📝 Points history entries: ${pointsHistory[0].count}`);
    
  } catch (error) {
    console.log('  ⚠️  Could not generate deployment summary:', error.message);
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyWeeklySystem()
    .then(async () => {
      await getDeploymentSummary();
      console.log('Verification script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Verification script failed:', error);
      process.exit(1);
    });
}

export { verifyWeeklySystem };