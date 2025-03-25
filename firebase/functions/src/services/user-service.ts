// firebase/functions/src/services/user-service.ts

import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { JournalEntry, LastPrompt, Prompt, User, SchedulePreference } from '../types';
import { TIMEZONE, WEEKLY_PROMPT } from '../constants';

class UserService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getUser(userId: string): Promise<User | null> {
    const userRef = this.db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return userDoc.data() as User;
  }

  // Get default schedule preference
  private getDefaultSchedulePreference(): SchedulePreference {
    return {
      enabled: true,
      day: WEEKLY_PROMPT.DAY,
      hour: WEEKLY_PROMPT.HOUR,
      timezone: TIMEZONE
    };
  }

  async createOrUpdateUser(userId: string, data: Partial<User> = {}): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create new user with required fields and default schedule preference
      await userRef.set({
        id: userId,
        createdAt: Timestamp.now(),
        promptCount: 0,
        schedulePreference: this.getDefaultSchedulePreference(),
        ...data
      });
    } else if (Object.keys(data).length > 0) {
      // Only update if there's data to update
      await userRef.update(data);
    }
  }

  async updateSchedulePreference(userId: string, preferences: Partial<SchedulePreference>): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create user with default preferences first
      await this.createOrUpdateUser(userId);
    }
    
    // Get current preferences or use defaults
    const currentPrefs = (userDoc.exists && userDoc.data()?.schedulePreference) 
      ? userDoc.data()?.schedulePreference 
      : this.getDefaultSchedulePreference();
    
    // Merge with new preferences
    const updatedPrefs: SchedulePreference = {
      ...currentPrefs,
      ...preferences
    };
    
    // Update the user document
    await userRef.update({
      schedulePreference: updatedPrefs
    });
  }

  async saveLastPrompt(userId: string, prompt: Prompt): Promise<void> {
    const lastPrompt: LastPrompt = {
      text: prompt.text,
      type: prompt.type,
      timestamp: Timestamp.now()
    };
    
    await this.createOrUpdateUser(userId, { lastPrompt });
  }

  async saveResponse(userId: string, entry: JournalEntry): Promise<string> {
    const entryRef = this.db.collection('users').doc(userId).collection('journal').doc();
    
    await entryRef.set(entry);
    
    return entryRef.id;
  }

  async getRecentEntries(userId: string, limit: number = 5): Promise<JournalEntry[]> {
    const entriesRef = this.db.collection('users').doc(userId)
      .collection('journal')
      .orderBy('timestamp', 'desc')
      .limit(limit);
      
    const snapshot = await entriesRef.get();
    const entries: JournalEntry[] = [];
    
    snapshot.forEach(doc => {
      entries.push(doc.data() as JournalEntry);
    });
    
    return entries;
  }

  async getAllUsers(): Promise<User[]> {
    const usersRef = this.db.collection('users');
    const snapshot = await usersRef.get();
    const users: User[] = [];
    
    snapshot.forEach(doc => {
      users.push(doc.data() as User);
    });
    
    return users;
  }

  // New method to find users who should receive prompts at a specific time
  async getUsersDueForPrompt(currentHour: number, currentDay: number): Promise<User[]> {
    const usersRef = this.db.collection('users');
    const snapshot = await usersRef.get();
    const eligibleUsers: User[] = [];
    
    snapshot.forEach(doc => {
      const user = doc.data() as User;
      const prefs = user.schedulePreference;
      
      // Check if the user has enabled weekly prompts and if the current time matches their preferences
      if (prefs?.enabled && prefs.hour === currentHour && prefs.day === currentDay) {
        eligibleUsers.push(user);
      }
    });
    
    return eligibleUsers;
  }
}

export default UserService;