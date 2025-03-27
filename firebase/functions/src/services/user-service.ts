// src/services/user-service.ts - Fixed Implementation
import { Firestore, Timestamp, Query } from 'firebase-admin/firestore';
import { JournalEntry, LastPrompt, Prompt, User, UserPreferences,SchedulePreference } from '../types';

class UserService {
  private db: Firestore;
  private usersRef;
  private readonly MAX_BATCH_SIZE = 500;

  constructor(db: Firestore) {
    this.db = db;
    this.usersRef = db.collection('users');
  }

  /**
   * Get a user by ID with error handling and default values
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = this.usersRef.doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return userDoc.data() as User;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error fetching user ${userId}:`, error);
      throw new Error(`Failed to get user: ${errorMessage}`);
    }
  }

  /**
   * Create a new user or update an existing user
   */
  async createOrUpdateUser(userId: string, data: Partial<User> = {}): Promise<void> {
    try {
      const userRef = this.usersRef.doc(userId);
      const userDoc = await userRef.get();
      
      const now = Timestamp.now();
      
      if (!userDoc.exists) {
        // Create new user with required fields and defaults
        const newUser: User = {
          id: userId,
          createdAt: now,
          promptCount: 0,
          lastActive: now,
          ...data
        };
        
        await userRef.set(newUser);
        console.log(`Created new user with ID: ${userId}`);
      } else if (Object.keys(data).length > 0) {
        // Update existing user with lastActive timestamp
        await userRef.update({
          ...data,
          lastActive: now
        });
      } else {
        // Just update the lastActive timestamp
        await userRef.update({ lastActive: now });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error creating/updating user ${userId}:`, error);
      throw new Error(`Failed to create/update user: ${errorMessage}`);
    }
  }

  /**
   * Save the last prompt sent to a user
   */
  async saveLastPrompt(userId: string, prompt: Prompt): Promise<void> {
    try {
      const lastPrompt: LastPrompt = {
        text: prompt.text,
        type: prompt.type,
        timestamp: Timestamp.now()
      };
      
      await this.createOrUpdateUser(userId, { lastPrompt });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error saving last prompt for user ${userId}:`, error);
      throw new Error(`Failed to save last prompt: ${errorMessage}`);
    }
  }

  /**
   * Save a user's response to a journal prompt
   */
  async saveResponse(userId: string, entry: JournalEntry): Promise<string> {
    try {
      // Get a reference to the user's journal collection
      const journalRef = this.usersRef.doc(userId).collection('journal');
      
      // Create a new document with a generated ID
      const entryDoc = journalRef.doc();
      
      // Add ID to the entry
      const entryWithId = {
        ...entry,
        id: entryDoc.id
      };
      
      // Save the entry
      await entryDoc.set(entryWithId);
      
      // Update user's lastActive timestamp
      await this.usersRef.doc(userId).update({
        lastActive: Timestamp.now()
      });
      
      return entryDoc.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error saving response for user ${userId}:`, error);
      throw new Error(`Failed to save response: ${errorMessage}`);
    }
  }

  /**
   * Get recent journal entries for a user
   */
  async getRecentEntries(userId: string, limit: number = 5): Promise<JournalEntry[]> {
    try {
      const entriesRef = this.usersRef
        .doc(userId)
        .collection('journal')
        .orderBy('timestamp', 'desc')
        .limit(limit);
        
      const snapshot = await entriesRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const entries: JournalEntry[] = [];
      snapshot.forEach(doc => {
        entries.push(doc.data() as JournalEntry);
      });
      
      return entries;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error getting entries for user ${userId}:`, error);
      throw new Error(`Failed to get journal entries: ${errorMessage}`);
    }
  }

  /**
   * Get all active users (active in the last 90 days)
   */
  async getAllUsers(activeOnly: boolean = false): Promise<User[]> {
    try {
      let query: Query = this.usersRef;
      
      // Optionally filter for active users only (active in last 90 days)
      if (activeOnly) {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        query = query.where('lastActive', '>=', Timestamp.fromDate(ninetyDaysAgo));
      }
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const users: User[] = [];
      snapshot.forEach(doc => {
        users.push(doc.data() as User);
      });
      
      return users;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error getting users:', error);
      throw new Error(`Failed to get users: ${errorMessage}`);
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const userRef = this.usersRef.doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }
      
      const userData = userDoc.data() as User;
      const currentPrefs = userData.preferences || {};
      
      // Merge current preferences with new ones
      const updatedPrefs: UserPreferences = {
        ...currentPrefs,
        ...preferences
      };
      
      await userRef.update({
        preferences: updatedPrefs,
        lastActive: Timestamp.now()
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error updating preferences for user ${userId}:`, error);
      throw new Error(`Failed to update preferences: ${errorMessage}`);
    }
  }

  /**
   * Delete all data for a user (GDPR compliance)
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      const userRef = this.usersRef.doc(userId);
      const journalRef = userRef.collection('journal');
      
      // Delete all journal entries in batches
      const journalSnapshot = await journalRef.get();
      
      if (!journalSnapshot.empty) {
        let batch = this.db.batch();
        let batchCount = 0;
        
        journalSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
          batchCount++;
          
          // Firestore batches are limited to 500 operations
          if (batchCount >= this.MAX_BATCH_SIZE) {
            // Commit the current batch
            batch.commit();
            
            // Reset for a new batch
            batch = this.db.batch();
            batchCount = 0;
          }
        });
        
        // Commit any remaining operations
        if (batchCount > 0) {
          await batch.commit();
        }
      }
      
      // Finally delete the user document
      await userRef.delete();
      
      console.log(`Successfully deleted all data for user ${userId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error deleting user ${userId}:`, error);
      throw new Error(`Failed to delete user data: ${errorMessage}`);
    }
  }
  /**
 * Update user schedule preferences
 */
  async updateSchedulePreference(userId: string, schedulePreference: Partial<SchedulePreference>): Promise<void> {
    try {
      const userRef = this.usersRef.doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }
      
      const userData = userDoc.data() as User;
      const currentSchedule = userData.schedulePreference || {
        enabled: true,
        dayOfWeek: 1, // Monday
        hour: 9,      // 9 AM
        minute: 0
      };
      
      // Merge current schedule with new preferences
      const updatedSchedule: SchedulePreference = {
        ...currentSchedule,
        ...schedulePreference,
        lastUpdated: Timestamp.now()
      };
      
      // Update the user document
      await userRef.update({
        schedulePreference: updatedSchedule,
        lastActive: Timestamp.now()
      });
      
      console.log(`Updated schedule preferences for user ${userId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error updating schedule preferences for user ${userId}:`, error);
      throw new Error(`Failed to update schedule preferences: ${errorMessage}`);
    }
  }

  /**
   * Get users who should receive prompts at a specific day and hour
   */
  async getUsersForScheduledPrompts(dayOfWeek: number, hour: number): Promise<User[]> {
    try {
      const query = this.usersRef.where(
        'schedulePreference.enabled', '==', true
      ).where(
        'schedulePreference.dayOfWeek', '==', dayOfWeek
      ).where(
        'schedulePreference.hour', '==', hour
      );
      
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      const users: User[] = [];
      snapshot.forEach(doc => {
        users.push(doc.data() as User);
      });
      
      return users;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error getting users for scheduled prompts:`, error);
      throw new Error(`Failed to get users for scheduled prompts: ${errorMessage}`);
    }
  }

  /**
   * Migrate old schedule preferences to the new format
   * This is a utility method to help transition to the new data model
   */
  async migrateSchedulePreferences(): Promise<void> {
    try {
      const snapshot = await this.usersRef.get();
      
      if (snapshot.empty) {
        console.log('No users to migrate');
        return;
      }
      
      let migratedCount = 0;
      let batch = this.db.batch();
      let batchCount = 0;
      const MAX_BATCH_SIZE = 500;
      
      for (const doc of snapshot.docs) {
        const userData = doc.data() as User;
        
        // Check if the user has old-style schedulePreference but not new-style preferences.schedule
        if (userData.schedulePreference && (!userData.preferences || !userData.preferences.schedule)) {
          const userRef = this.usersRef.doc(userData.id);
          
          // Initialize preferences if it doesn't exist
          const preferences = userData.preferences || {};
          
          // Move schedulePreference to preferences.schedule
          preferences.schedule = userData.schedulePreference;
          
          batch.update(userRef, {
            preferences: preferences,
            // Note: We're not removing schedulePreference yet to maintain backward compatibility
            // In a future update, we can remove it completely
          });
          
          batchCount++;
          migratedCount++;
          
          if (batchCount >= MAX_BATCH_SIZE) {
            await batch.commit();
            batch = this.db.batch();
            batchCount = 0;
            console.log(`Committed batch of ${MAX_BATCH_SIZE} migrations`);
          }
        }
      }
      
      // Commit any remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`Successfully migrated ${migratedCount} users to new schedule preference format`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error migrating schedule preferences:', error);
      throw new Error(`Failed to migrate schedule preferences: ${errorMessage}`);
    }
  }


}



export default UserService;