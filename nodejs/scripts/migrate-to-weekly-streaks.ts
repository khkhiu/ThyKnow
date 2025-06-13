// File: scripts/migrate-to-weekly-streaks.ts
// Migration script to transition from daily to weekly streak system

import { query, initDatabase } from '../src/database';
import { Points } from '../src/models/Points';
import { logger } from '../src/utils/logger';

interface ExistingUser {
  id: string;
  created_at: Date;
  prompt_count: number;
}

interface ExistingJournalEntry {
  id: number;
  user_id: string;
  timestamp: Date;
}

/**
 * Main migration function
 * Run this once to migrate your existing system to weekly streaks
 */
export async function migrateToWeeklyStreaks(): Promise<void> {
  logger.info('Starting migration to weekly streak system...');
  
  try {
    // Step 1: Add new columns to users table if they don't exist
    await addWeeklyStreakColumns();
    
    // Step 2: Create points_history table
    await createPointsHistoryTable();
    
    // Step 3: Calculate initial weekly streaks for existing users
    await calculateInitialWeeklyStreaks();
    
    // Step 4: Verify migration
    await verifyMigration();
    
    logger.info('✅ Migration to weekly streak system completed successfully!');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Step 1: Add new columns to users table
 */
async function addWeeklyStreakColumns(): Promise<void> {
  logger.info('Adding weekly streak columns to users table...');
  
  const alterQueries = [
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0', 
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_entry_week VARCHAR(10)'
  ];
  
  for (const query_text of alterQueries) {
    await query(query_text);
  }
  
  logger.info('✅ Weekly streak columns added');
}

/**
 * Step 2: Create points_history table
 */
async function createPointsHistoryTable(): Promise<void> {
  logger.info('Creating points_history table...');
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS points_history (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      points_earned INTEGER NOT NULL,
      reason VARCHAR(100) NOT NULL,
      streak_week INTEGER NOT NULL,
      week_identifier VARCHAR(10) NOT NULL,
      entry_id INTEGER REFERENCES journal_entries(id) ON DELETE SET NULL,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `;
  
  await query(createTableQuery);
  
  // Add indices
  const indexQueries = [
    'CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_points_history_timestamp ON points_history(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_points_history_week ON points_history(week_identifier)',
    'CREATE INDEX IF NOT EXISTS idx_users_current_streak ON users(current_streak)',
    'CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points)',
    'CREATE INDEX IF NOT EXISTS idx_users_last_entry_week ON users(last_entry_week)'
  ];
  
  for (const indexQuery of indexQueries) {
    await query(indexQuery);
  }
  
  logger.info('✅ Points history table created with indices');
}

/**
 * Step 3: Calculate initial weekly streaks for existing users
 * This analyzes existing journal entries to determine current streaks
 */
async function calculateInitialWeeklyStreaks(): Promise<void> {
  logger.info('Calculating initial weekly streaks for existing users...');
  
  // Get all existing users
  const users = await query<ExistingUser>(`
    SELECT id, created_at, prompt_count 
    FROM users 
    ORDER BY created_at ASC
  `);
  
  logger.info(`Processing ${users.length} existing users...`);
  
  for (const user of users) {
    try {
      await calculateUserWeeklyStreak(user);
    } catch (error) {
      logger.error(`Error processing user ${user.id}:`, error);
      // Continue with other users
    }
  }
  
  logger.info('✅ Initial weekly streaks calculated');
}

/**
 * Calculate weekly streak for a single user based on their journal entries
 */
async function calculateUserWeeklyStreak(user: ExistingUser): Promise<void> {
  // Get all journal entries for this user, ordered by date
  const entries = await query<ExistingJournalEntry>(`
    SELECT id, user_id, timestamp
    FROM journal_entries
    WHERE user_id = $1
    ORDER BY timestamp ASC
  `, [user.id]);
  
  if (entries.length === 0) {
    // No entries, leave defaults (0 streak, 0 points)
    return;
  }
  
  // Group entries by week
  const entriesByWeek = new Map<string, ExistingJournalEntry[]>();
  
  for (const entry of entries) {
    const weekId = Points.getWeekIdentifier(entry.timestamp);
    if (!entriesByWeek.has(weekId)) {
      entriesByWeek.set(weekId, []);
    }
    entriesByWeek.get(weekId)!.push(entry);
  }
  
  // Calculate streaks
  const weeks = Array.from(entriesByWeek.keys()).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let totalPoints = 0;
  
  // Find the current streak (working backwards from the most recent week)
  const currentWeek = Points.getWeekIdentifier();
  let streakWeeks: string[] = [];
  
  // Check if user has an entry this week or last week to start counting
  if (entriesByWeek.has(currentWeek)) {
    streakWeeks.push(currentWeek);
  }
  
  // Count consecutive weeks backwards
  let checkWeek = entriesByWeek.has(currentWeek) ? 
    Points.getPreviousWeekIdentifier(currentWeek) : 
    Points.getPreviousWeekIdentifier(currentWeek);
  
  while (entriesByWeek.has(checkWeek)) {
    streakWeeks.unshift(checkWeek);
    checkWeek = Points.getPreviousWeekIdentifier(checkWeek);
  }
  
  currentStreak = streakWeeks.length;
  
  // Calculate longest streak by finding the longest consecutive sequence
  let tempStreak = 0;
  let lastWeekNum = -1;
  
  for (const week of weeks) {
    const weekNum = parseInt(week.split('-W')[1]);
    const yearNum = parseInt(week.split('-W')[0]);
    
    // Simple consecutive check (this is approximate and could be improved)
    if (lastWeekNum === -1 || weekNum === lastWeekNum + 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    
    lastWeekNum = weekNum;
  }
  
  // Calculate total points retroactively
  // Give base points for each week with entries
  for (const [weekId, weekEntries] of entriesByWeek) {
    const basePoints = 50; // Base points per week
    const multipleEntryBonus = (weekEntries.length - 1) * 20; // Bonus for multiple entries
    totalPoints += basePoints + multipleEntryBonus;
  }
  
  // Add milestone bonuses for longest streak achieved
  const milestones = [4, 12, 26, 52, 104];
  for (const milestone of milestones) {
    if (longestStreak >= milestone) {
      switch (milestone) {
        case 4: totalPoints += 200; break;
        case 12: totalPoints += 500; break;
        case 26: totalPoints += 1000; break;
        case 52: totalPoints += 2500; break;
        case 104: totalPoints += 5000; break;
      }
    }
  }
  
  // Get the most recent entry week
  const lastEntryWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null;
  
  // Update user with calculated values
  await query(`
    UPDATE users 
    SET 
      current_streak = $1,
      longest_streak = $2,
      total_points = $3,
      last_entry_week = $4
    WHERE id = $5
  `, [currentStreak, longestStreak, totalPoints, lastEntryWeek, user.id]);
  
  logger.debug(`User ${user.id}: ${currentStreak} current, ${longestStreak} longest, ${totalPoints} points`);
}

/**
 * Step 4: Verify migration results
 */
async function verifyMigration(): Promise<void> {
  logger.info('Verifying migration results...');
  
  // Check that new columns exist and have data
  const verificationResults = await query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN current_streak > 0 THEN 1 END) as users_with_streaks,
      COUNT(CASE WHEN total_points > 0 THEN 1 END) as users_with_points,
      AVG(current_streak) as avg_current_streak,
      MAX(longest_streak) as max_longest_streak,
      SUM(total_points) as total_points_awarded
    FROM users
  `);
  
  const stats = verificationResults[0];
  
  logger.info('Migration verification results:');
  logger.info(`📊 Total users: ${stats.total_users}`);
  logger.info(`🔥 Users with active streaks: ${stats.users_with_streaks}`);
  logger.info(`💰 Users with points: ${stats.users_with_points}`);
  logger.info(`📈 Average current streak: ${Math.round(stats.avg_current_streak * 100) / 100} weeks`);
  logger.info(`🏆 Longest streak achieved: ${stats.max_longest_streak} weeks`);
  logger.info(`💎 Total points awarded: ${stats.total_points_awarded}`);
  
  // Check points_history table exists
  const tableExists = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'points_history'
    )
  `);
  
  if (tableExists[0].exists) {
    logger.info('✅ Points history table created successfully');
  } else {
    throw new Error('Points history table was not created');
  }
  
  logger.info('✅ Migration verification completed');
}

/**
 * Rollback function (use with caution!)
 * This removes the weekly streak columns and points_history table
 */
export async function rollbackWeeklyStreakMigration(): Promise<void> {
  logger.warn('⚠️  Rolling back weekly streak migration...');
  
  try {
    // Drop columns (note: this will lose data!)
    await query('ALTER TABLE users DROP COLUMN IF EXISTS current_streak');
    await query('ALTER TABLE users DROP COLUMN IF EXISTS longest_streak');
    await query('ALTER TABLE users DROP COLUMN IF EXISTS total_points');
    await query('ALTER TABLE users DROP COLUMN IF EXISTS last_entry_week');
    
    // Drop points_history table
    await query('DROP TABLE IF EXISTS points_history CASCADE');
    
    logger.info('✅ Rollback completed');
  } catch (error) {
    logger.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToWeeklyStreaks()
    .then(() => {
      logger.info('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}