// src/routes/pubSubRoutes.ts
import { Router } from 'express';
import { handlePubSubMessage } from '../controllers/pubSubController';

const router = Router();

/**
 * POST /pubsub/messages
 * Receives and processes Pub/Sub messages
 */
router.post('/messages', handlePubSubMessage);

export default router;