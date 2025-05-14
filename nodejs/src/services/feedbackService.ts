// src/services/feedbackService.ts
import { Feedback, IFeedback } from '../models/Feedback';
import { logger } from '../utils/logger';

export class FeedbackService {
  /**
   * Submit new feedback
   */
  async submitFeedback(userId: string, content: string): Promise<IFeedback> {
    try {
      // Ensure userId is a string
      userId = String(userId);
      
      // Save feedback to database
      const feedback = await Feedback.create({
        userId,
        content,
        timestamp: new Date()
      });
      
      logger.info(`Feedback submitted for user ${userId}`);
      return feedback;
    } catch (error) {
      logger.error(`Error submitting feedback for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get feedback submissions for a user
   */
  async getUserFeedback(userId: string, limit: number = 5): Promise<IFeedback[]> {
    try {
      // Ensure userId is a string
      userId = String(userId);
      
      return await Feedback.findByUserId(userId, limit);
    } catch (error) {
      logger.error(`Error getting feedback for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all feedback submissions (for admin purposes)
   */
  async getAllFeedback(options: {
    isResolved?: boolean,
    limit?: number
  } = {}): Promise<IFeedback[]> {
    try {
      return await Feedback.findAll(options);
    } catch (error) {
      logger.error('Error getting all feedback:', error);
      throw error;
    }
  }
  
  /**
   * Mark feedback as resolved or unresolved
   */
  async markFeedbackResolved(id: number, isResolved: boolean = true): Promise<IFeedback | null> {
    try {
      return await Feedback.markAsResolved(id, isResolved);
    } catch (error) {
      logger.error(`Error marking feedback ${id} as ${isResolved ? 'resolved' : 'unresolved'}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete feedback entry
   */
  async deleteFeedback(id: number): Promise<boolean> {
    try {
      return await Feedback.delete(id);
    } catch (error) {
      logger.error(`Error deleting feedback ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const feedbackService = new FeedbackService();