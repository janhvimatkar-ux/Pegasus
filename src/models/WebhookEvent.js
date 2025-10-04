const { v4: uuidv4 } = require('uuid');

class WebhookEvent {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.eventId = data.eventId; // Zoom's event ID for idempotency
    this.eventType = data.eventType; // meeting.started, meeting.ended, etc.
    this.payload = data.payload;
    this.status = data.status || 'received'; // received, processing, processed, failed
    this.retryCount = data.retryCount || 0;
    this.maxRetries = data.maxRetries || 3;
    this.error = data.error || null;
    this.receivedAt = data.receivedAt || new Date().toISOString();
    this.processedAt = data.processedAt || null;
    this.appliedAt = data.appliedAt || null;
  }

  /**
   * Check if event has been processed
   * @returns {boolean}
   */
  isProcessed() {
    return this.status === 'processed';
  }

  /**
   * Check if event can be retried
   * @returns {boolean}
   */
  canRetry() {
    return this.status === 'failed' && this.retryCount < this.maxRetries;
  }

  /**
   * Mark event as processing
   */
  markAsProcessing() {
    this.status = 'processing';
    this.processedAt = new Date().toISOString();
  }

  /**
   * Mark event as processed
   */
  markAsProcessed() {
    this.status = 'processed';
    this.appliedAt = new Date().toISOString();
  }

  /**
   * Mark event as failed
   * @param {Error} error - Error that occurred
   */
  markAsFailed(error) {
    this.status = 'failed';
    this.error = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    this.retryCount += 1;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      eventType: this.eventType,
      payload: this.payload,
      status: this.status,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      error: this.error,
      receivedAt: this.receivedAt,
      processedAt: this.processedAt,
      appliedAt: this.appliedAt
    };
  }
}

module.exports = WebhookEvent;

