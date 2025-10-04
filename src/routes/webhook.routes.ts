import { Router } from 'express';
import webhookController from '../controllers/webhook.controller';

const router = Router();

router.post('/zoom', webhookController.handleZoomWebhook);

export default router;
