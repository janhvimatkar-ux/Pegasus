import { Request, Response } from 'express';
import logger from '../utils/logger';
import webhookService from '../services/webhook.service';

const handleZoomWebhook = async (req: Request, res: Response) => {
  const event = req.body;
  const eventId = req.headers['x-zm-request-id'];

  logger.info(`Received Zoom webhook event: ${event.event} with ID: ${eventId}`);

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).send('Missing event ID');
  }

  try {
    await webhookService.processZoomEvent(event, eventId);
    res.status(200).send('Webhook processed successfully');
  } catch (error: any) {
    if (error.message === 'Event already processed') {
      return res.status(200).send('Event already processed');
    }
    logger.error('Error processing Zoom webhook:', error);
    res.status(500).send('Error processing webhook');
  }
};

export default { handleZoomWebhook };
