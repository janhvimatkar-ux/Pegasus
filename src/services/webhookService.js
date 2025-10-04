const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');
const WebhookEvent = require('../models/WebhookEvent');
const liveClassService = require('./liveClassService');

class WebhookService {
  constructor() {
    // In-memory storage for webhook events (replace with database in production)
    this.events = new Map();
    this.processedEventIds = new Set();
    
    // Webhook secret for signature verification
    this.webhookSecret = config.zoom.webhookSecret;
  }

  /**
   * Verify Zoom webhook signature
   * @param {string} signature - Signature from request header
   * @param {Object} payload - Request body
   * @param {string} timestamp - Timestamp from request header
   * @returns {boolean} Whether signature is valid
   */
  verifySignature(signature, payload, timestamp) {
    if (!this.webhookSecret) {
      logger.warn('Webhook secret not configured, skipping verification');
      return true; // Allow in development
    }

    try {
      const message = `v0:${timestamp}:${JSON.stringify(payload)}`;
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(message)
        .digest('hex');
      
      const expectedSignature = `v0=${hash}`;
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        logger.warn('Webhook signature verification failed', {
          expected: expectedSignature.substring(0, 20) + '...',
          received: signature.substring(0, 20) + '...'
        });
      }

      return isValid;
    } catch (error) {
      logger.logError(error, {
        service: 'WebhookService',
        method: 'verifySignature'
      });
      return false;
    }
  }

  /**
   * Check if event has already been processed (idempotency)
   * @param {string} eventId - Zoom event ID
   * @returns {boolean}
   */
  isEventProcessed(eventId) {
    return this.processedEventIds.has(eventId);
  }

  /**
   * Process incoming webhook event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>} Processing result
   */
  async processWebhook(payload) {
    const eventType = payload.event;
    const eventId = payload.event_id || payload.payload?.object?.id;

    logger.info('Webhook received', {
      eventType,
      eventId,
      timestamp: new Date().toISOString()
    });

    // Check idempotency - skip if already processed
    if (this.isEventProcessed(eventId)) {
      logger.info('Webhook event already processed (idempotency check)', {
        eventId,
        eventType
      });
      return {
        success: true,
        message: 'Event already processed',
        duplicate: true
      };
    }

    // Create webhook event record
    const webhookEvent = new WebhookEvent({
      eventId,
      eventType,
      payload
    });

    // Store event
    this.events.set(webhookEvent.id, webhookEvent);

    try {
      // Mark as processing
      webhookEvent.markAsProcessing();
      logger.info('Webhook processing started', {
        eventId,
        eventType,
        status: 'processing'
      });

      // Route to appropriate handler
      let result;
      switch (eventType) {
        case 'meeting.started':
          result = await this.handleMeetingStarted(payload);
          break;
        
        case 'meeting.ended':
          result = await this.handleMeetingEnded(payload);
          break;
        
        case 'meeting.updated':
          result = await this.handleMeetingUpdated(payload);
          break;
        
        case 'meeting.deleted':
          result = await this.handleMeetingDeleted(payload);
          break;
        
        case 'meeting.participant_joined':
          result = await this.handleParticipantJoined(payload);
          break;
        
        case 'meeting.participant_left':
          result = await this.handleParticipantLeft(payload);
          break;
        
        default:
          logger.info('Unhandled webhook event type', { eventType });
          result = { success: true, message: 'Event type not handled' };
      }

      // Mark as processed
      webhookEvent.markAsProcessed();
      this.processedEventIds.add(eventId);

      logger.info('Webhook processing completed', {
        eventId,
        eventType,
        status: 'processed',
        appliedAt: webhookEvent.appliedAt
      });

      return {
        success: true,
        eventId: webhookEvent.id,
        result
      };

    } catch (error) {
      // Mark as failed
      webhookEvent.markAsFailed(error);

      logger.logError(error, {
        service: 'WebhookService',
        method: 'processWebhook',
        eventId,
        eventType,
        status: 'failed',
        retryCount: webhookEvent.retryCount
      });

      // Schedule retry if applicable
      if (webhookEvent.canRetry()) {
        logger.info('Webhook will be retried', {
          eventId,
          retryCount: webhookEvent.retryCount,
          maxRetries: webhookEvent.maxRetries
        });
        await this.scheduleRetry(webhookEvent);
      }

      throw error;
    }
  }

  /**
   * Handle meeting started event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async handleMeetingStarted(payload) {
    const meetingId = payload.payload?.object?.id;
    
    logger.info('Handling meeting.started event', { meetingId });

    // Find live class by Zoom meeting ID
    const liveClasses = Array.from(liveClassService.liveClasses.values())
      .filter(lc => lc.zoomMeetingId === meetingId.toString());

    if (liveClasses.length === 0) {
      logger.warn('No live class found for meeting', { meetingId });
      return { success: true, message: 'No matching live class' };
    }

    // Update status to active
    for (const liveClass of liveClasses) {
      liveClassService.updateStatus(liveClass.id, 'active');
      logger.info('Live class status updated to active', {
        classId: liveClass.id,
        meetingId
      });
    }

    return {
      success: true,
      updatedClasses: liveClasses.length,
      newStatus: 'active'
    };
  }

  /**
   * Handle meeting ended event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async handleMeetingEnded(payload) {
    const meetingId = payload.payload?.object?.id;
    
    logger.info('Handling meeting.ended event', { meetingId });

    // Find live class by Zoom meeting ID
    const liveClasses = Array.from(liveClassService.liveClasses.values())
      .filter(lc => lc.zoomMeetingId === meetingId.toString());

    if (liveClasses.length === 0) {
      logger.warn('No live class found for meeting', { meetingId });
      return { success: true, message: 'No matching live class' };
    }

    // Update status to completed
    for (const liveClass of liveClasses) {
      liveClassService.updateStatus(liveClass.id, 'completed');
      logger.info('Live class status updated to completed', {
        classId: liveClass.id,
        meetingId
      });
    }

    return {
      success: true,
      updatedClasses: liveClasses.length,
      newStatus: 'completed'
    };
  }

  /**
   * Handle meeting updated event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async handleMeetingUpdated(payload) {
    const meetingId = payload.payload?.object?.id;
    const updates = payload.payload?.object;
    
    logger.info('Handling meeting.updated event', {
      meetingId,
      updates: Object.keys(updates || {})
    });

    // Find live class by Zoom meeting ID
    const liveClasses = Array.from(liveClassService.liveClasses.values())
      .filter(lc => lc.zoomMeetingId === meetingId.toString());

    if (liveClasses.length === 0) {
      logger.warn('No live class found for meeting', { meetingId });
      return { success: true, message: 'No matching live class' };
    }

    // Update live class with new meeting details
    for (const liveClass of liveClasses) {
      if (updates.start_time) {
        liveClass.startTime = updates.start_time;
      }
      if (updates.duration) {
        liveClass.duration = updates.duration;
      }
      liveClass.updatedAt = new Date().toISOString();

      logger.info('Live class updated from webhook', {
        classId: liveClass.id,
        meetingId,
        changes: {
          startTime: updates.start_time,
          duration: updates.duration
        }
      });
    }

    return {
      success: true,
      updatedClasses: liveClasses.length,
      changes: Object.keys(updates)
    };
  }

  /**
   * Handle meeting deleted event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async handleMeetingDeleted(payload) {
    const meetingId = payload.payload?.object?.id;
    
    logger.info('Handling meeting.deleted event', { meetingId });

    // Find live class by Zoom meeting ID
    const liveClasses = Array.from(liveClassService.liveClasses.values())
      .filter(lc => lc.zoomMeetingId === meetingId.toString());

    if (liveClasses.length === 0) {
      logger.warn('No live class found for meeting', { meetingId });
      return { success: true, message: 'No matching live class' };
    }

    // Update status to cancelled
    for (const liveClass of liveClasses) {
      liveClass.status = 'cancelled';
      liveClass.updatedAt = new Date().toISOString();
      
      logger.info('Live class cancelled from webhook', {
        classId: liveClass.id,
        meetingId
      });
    }

    return {
      success: true,
      updatedClasses: liveClasses.length,
      newStatus: 'cancelled'
    };
  }

  /**
   * Handle participant joined event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async handleParticipantJoined(payload) {
    const meetingId = payload.payload?.object?.id;
    const participant = payload.payload?.object?.participant;
    
    logger.info('Participant joined meeting', {
      meetingId,
      participantId: participant?.id,
      participantName: participant?.user_name
    });

    // In production, track attendance in database
    return {
      success: true,
      message: 'Participant attendance logged'
    };
  }

  /**
   * Handle participant left event
   * @param {Object} payload - Webhook payload
   * @returns {Promise<Object>}
   */
  async handleParticipantLeft(payload) {
    const meetingId = payload.payload?.object?.id;
    const participant = payload.payload?.object?.participant;
    
    logger.info('Participant left meeting', {
      meetingId,
      participantId: participant?.id,
      participantName: participant?.user_name
    });

    // In production, update attendance in database
    return {
      success: true,
      message: 'Participant departure logged'
    };
  }

  /**
   * Schedule retry for failed webhook
   * @param {WebhookEvent} webhookEvent - Failed webhook event
   * @returns {Promise<void>}
   */
  async scheduleRetry(webhookEvent) {
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, webhookEvent.retryCount) * 1000;

    logger.info('Scheduling webhook retry', {
      eventId: webhookEvent.eventId,
      retryCount: webhookEvent.retryCount,
      delay: `${delay}ms`
    });

    setTimeout(async () => {
      try {
        logger.info('Retrying webhook processing', {
          eventId: webhookEvent.eventId,
          attempt: webhookEvent.retryCount + 1
        });

        await this.processWebhook(webhookEvent.payload);
      } catch (error) {
        logger.logError(error, {
          service: 'WebhookService',
          method: 'scheduleRetry',
          eventId: webhookEvent.eventId
        });
      }
    }, delay);
  }

  /**
   * Get webhook event by ID
   * @param {string} eventId - Webhook event ID
   * @returns {WebhookEvent|null}
   */
  getEvent(eventId) {
    return this.events.get(eventId) || null;
  }

  /**
   * Get all webhook events
   * @param {Object} filters - Filter options
   * @returns {Array<WebhookEvent>}
   */
  getEvents(filters = {}) {
    let events = Array.from(this.events.values());

    if (filters.status) {
      events = events.filter(e => e.status === filters.status);
    }

    if (filters.eventType) {
      events = events.filter(e => e.eventType === filters.eventType);
    }

    return events.sort((a, b) => 
      new Date(b.receivedAt) - new Date(a.receivedAt)
    );
  }

  /**
   * Clear all webhook events (for testing)
   */
  clearAll() {
    this.events.clear();
    this.processedEventIds.clear();
  }
}

module.exports = new WebhookService();

