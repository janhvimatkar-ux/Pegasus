const webhookService = require('../services/webhookService');
const logger = require('../utils/logger');

/**
 * Handle incoming Zoom webhook
 */
async function handleZoomWebhook(req, res) {
  const startTime = Date.now();

  try {
    // Get signature and timestamp from headers
    const signature = req.headers['x-zm-signature'];
    const timestamp = req.headers['x-zm-request-timestamp'];
    const payload = req.body;

    logger.info('Zoom webhook received', {
      event: payload.event,
      hasSignature: !!signature,
      hasTimestamp: !!timestamp
    });

    // Verify webhook signature
    if (signature && timestamp) {
      const isValid = webhookService.verifySignature(signature, payload, timestamp);
      
      if (!isValid) {
        logger.warn('Webhook signature verification failed');
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }
    }

    // Handle URL validation (Zoom sends this when setting up webhook)
    if (payload.event === 'endpoint.url_validation') {
      logger.info('Handling endpoint URL validation');
      
      const plainToken = payload.payload?.plainToken;
      const encryptedToken = webhookService.encryptToken(plainToken);
      
      return res.json({
        plainToken,
        encryptedToken
      });
    }

    // Process webhook
    const result = await webhookService.processWebhook(payload);

    logger.info('Webhook processed successfully', {
      event: payload.event,
      eventId: result.eventId,
      duration: `${Date.now() - startTime}ms`
    });

    res.json({
      success: true,
      message: 'Webhook processed',
      eventId: result.eventId,
      duplicate: result.duplicate || false
    });

  } catch (error) {
    logger.logError(error, {
      controller: 'webhookController',
      method: 'handleZoomWebhook',
      event: req.body?.event
    });

    logger.logRequest(req, 500, Date.now() - startTime);

    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
}

/**
 * Get webhook events (for monitoring)
 */
function getWebhookEvents(req, res) {
  try {
    const { status, eventType, limit = 50 } = req.query;

    const events = webhookService.getEvents({
      status,
      eventType
    }).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: events.map(e => e.toJSON()),
      count: events.length,
      filters: { status, eventType }
    });

  } catch (error) {
    logger.logError(error, {
      controller: 'webhookController',
      method: 'getWebhookEvents'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get webhook events',
      message: error.message
    });
  }
}

/**
 * Get specific webhook event
 */
function getWebhookEvent(req, res) {
  try {
    const { eventId } = req.params;
    const event = webhookService.getEvent(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Webhook event not found'
      });
    }

    res.json({
      success: true,
      data: event.toJSON()
    });

  } catch (error) {
    logger.logError(error, {
      controller: 'webhookController',
      method: 'getWebhookEvent'
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get webhook event',
      message: error.message
    });
  }
}

module.exports = {
  handleZoomWebhook,
  getWebhookEvents,
  getWebhookEvent
};

