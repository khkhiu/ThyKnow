// src/controllers/pubSubController.ts
import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { sendWeeklyPromptToUser } from '../services/schedulerService';
import { logger } from '../utils/logger';

interface PubSubMessage {
  message: {
    data: string;
    attributes: Record<string, string>;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

/**
 * Process a Cloud Pub/Sub message
 */
export async function handlePubSubMessage(req: Request, res: Response): Promise<void> {
  try {
    // Verify that request is a Pub/Sub message
    if (!req.body || !req.body.message) {
      logger.error('Invalid Pub/Sub message format');
      res.status(400).send('Bad Request: Invalid Pub/Sub message format');
      return;
    }

    const pubSubMessage: PubSubMessage = req.body;
    
    // Decode the Pub/Sub message data (Base64 encoded)
    let messageData: any = {};
    if (pubSubMessage.message.data) {
      const decoded = Buffer.from(pubSubMessage.message.data, 'base64').toString();
      try {
        messageData = JSON.parse(decoded);
      } catch (e) {
        logger.warn(`Could not parse message data as JSON: ${decoded}`);
        messageData = { rawData: decoded };
      }
    }

    logger.info(`Received Pub/Sub message: ${JSON.stringify(messageData)}`);

    // Process different message types
    if (messageData.action === 'sendPrompts') {
      await processWeeklyPrompts();
    } else if (messageData.action === 'sendPromptToUser' && messageData.userId) {
      await sendWeeklyPromptToUser(messageData.userId);
      logger.info(`Sent prompt to specific user: ${messageData.userId}`);
    } else {
      logger.warn(`Unknown Pub/Sub message action: ${messageData.action}`);
    }

    // Always return success to acknowledge receipt of the message
    res.status(204).send();
  } catch (error) {
    logger.error('Error processing Pub/Sub message:', error);
    // Always acknowledge receipt even in case of error, to prevent redelivery
    res.status(204).send();
  }
}

/**
 * Process weekly prompts for all eligible users
 */
async function processWeeklyPrompts(): Promise<void> {
  try {
    logger.info('Processing weekly prompts for all eligible users');
    
    // Get all users
    const users = await userService.getAllUsers();
    
    // Filter users who should receive prompts based on their preferences
    const usersToSendPrompts = users.filter(user => 
      user.schedulePreference.enabled && 
      user.schedulePreference.day === new Date().getDay()
    );
    
    logger.info(`Sending prompts to ${usersToSendPrompts.length} eligible users`);
    
    // Send prompts to each eligible user
    for (const user of usersToSendPrompts) {
      try {
        await sendWeeklyPromptToUser(String(user.id));
        logger.info(`Successfully sent prompt to user ${user.id}`);
      } catch (error) {
        logger.error(`Error sending prompt to user ${user.id}:`, error);
      }
    }
    
    logger.info('Completed weekly prompt processing');
  } catch (error) {
    logger.error('Error processing weekly prompts:', error);
    throw error;
  }
}