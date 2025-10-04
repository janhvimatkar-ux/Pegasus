const WebhookEvent = require('../../src/models/WebhookEvent');

describe('WebhookEvent Model', () => {
  describe('constructor', () => {
    it('should create a WebhookEvent instance with required fields', () => {
      const data = {
        eventId: 'zoom-event-123',
        eventType: 'meeting.started',
        payload: { test: 'data' }
      };

      const event = new WebhookEvent(data);

      expect(event.eventId).toBe(data.eventId);
      expect(event.eventType).toBe(data.eventType);
      expect(event.payload).toEqual(data.payload);
      expect(event.status).toBe('received');
      expect(event.retryCount).toBe(0);
      expect(event.maxRetries).toBe(3);
      expect(event.id).toBeDefined();
    });

    it('should create a WebhookEvent instance with custom values', () => {
      const data = {
        eventId: 'zoom-event-456',
        eventType: 'meeting.ended',
        payload: { data: 'test' },
        status: 'processing',
        retryCount: 1,
        maxRetries: 5
      };

      const event = new WebhookEvent(data);

      expect(event.status).toBe('processing');
      expect(event.retryCount).toBe(1);
      expect(event.maxRetries).toBe(5);
    });
  });

  describe('isProcessed', () => {
    it('should return true when status is processed', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {},
        status: 'processed'
      });

      expect(event.isProcessed()).toBe(true);
    });

    it('should return false when status is not processed', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {},
        status: 'received'
      });

      expect(event.isProcessed()).toBe(false);
    });
  });

  describe('canRetry', () => {
    it('should return true when failed and retry count below max', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {},
        status: 'failed',
        retryCount: 1,
        maxRetries: 3
      });

      expect(event.canRetry()).toBe(true);
    });

    it('should return false when retry count equals max', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {},
        status: 'failed',
        retryCount: 3,
        maxRetries: 3
      });

      expect(event.canRetry()).toBe(false);
    });

    it('should return false when status is not failed', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {},
        status: 'processed',
        retryCount: 0,
        maxRetries: 3
      });

      expect(event.canRetry()).toBe(false);
    });
  });

  describe('markAsProcessing', () => {
    it('should update status to processing and set processedAt', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {}
      });

      event.markAsProcessing();

      expect(event.status).toBe('processing');
      expect(event.processedAt).toBeDefined();
    });
  });

  describe('markAsProcessed', () => {
    it('should update status to processed and set appliedAt', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {}
      });

      event.markAsProcessed();

      expect(event.status).toBe('processed');
      expect(event.appliedAt).toBeDefined();
    });
  });

  describe('markAsFailed', () => {
    it('should update status to failed and increment retry count', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {}
      });

      const error = new Error('Test error');
      event.markAsFailed(error);

      expect(event.status).toBe('failed');
      expect(event.retryCount).toBe(1);
      expect(event.error).toBeDefined();
      expect(event.error.message).toBe('Test error');
      expect(event.error.stack).toBeDefined();
    });

    it('should increment retry count on multiple failures', () => {
      const event = new WebhookEvent({
        eventId: 'test',
        eventType: 'meeting.started',
        payload: {}
      });

      event.markAsFailed(new Error('Error 1'));
      event.markAsFailed(new Error('Error 2'));
      event.markAsFailed(new Error('Error 3'));

      expect(event.retryCount).toBe(3);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the WebhookEvent', () => {
      const data = {
        eventId: 'zoom-event-123',
        eventType: 'meeting.started',
        payload: { test: 'data' },
        status: 'processed'
      };

      const event = new WebhookEvent(data);
      const json = event.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('eventId', data.eventId);
      expect(json).toHaveProperty('eventType', data.eventType);
      expect(json).toHaveProperty('payload', data.payload);
      expect(json).toHaveProperty('status', data.status);
      expect(json).toHaveProperty('retryCount');
      expect(json).toHaveProperty('receivedAt');
    });
  });
});

