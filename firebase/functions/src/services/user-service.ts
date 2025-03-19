import { Firestore, Timestamp } from 'firebase-admin/firestore';
import { JournalEntry, LastPrompt, Prompt, User } from '../types';

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

  async createOrUpdateUser(userId: string, data: Partial<User> = {}): Promise<void> {
    const userRef = this.db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create new user
      await userRef.set({
        id: userId,
        createdAt: Timestamp.now(),
        promptCount: 0,
        ...data
      });
    } else {
      // Update existing user
      await userRef.update(data);
    }
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
}

export default UserService;