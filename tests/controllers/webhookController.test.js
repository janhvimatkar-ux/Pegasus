const request = require('supertest');
const app = require('../../src/index');
const webhookService = require('../../src/services/webhookService');
const liveClassService = require('../../src/services/liveClassService');

describe('Webhook Controller', () => {
  beforeEach(() => {
    webhookService.clearAll();
    liveClassService.clearAll();
  });

  describe('POST /api/v1/webhooks/zoom', () => {
    it('should process meeting.started webhook', async () => {
      // Create a live class first
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const payload = {
        event: 'meeting.started',
        event_id: 'webhook-test-1',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Webhook processed');
      expect(response.body.eventId).toBeDefined();

      // Verify class status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('active');
    });

    it('should handle duplicate webhook (idempotency)', async () => {
      const payload = {
        event: 'meeting.started',
        event_id: 'duplicate-webhook-1',
        payload: {
          object: {
            id: 123456789
          }
        }
      };

      // Send first time
      const response1 = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send(payload)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.duplicate).toBe(false);

      // Send second time (should be skipped)
      const response2 = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send(payload)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.duplicate).toBe(true);
    });

    it('should process meeting.ended webhook', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      // Start the meeting first
      liveClassService.updateStatus(classResult.liveClass.id, 'active');

      const payload = {
        event: 'meeting.ended',
        event_id: 'webhook-end-1',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify class status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('completed');
    });

    it('should process meeting.deleted webhook', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const payload = {
        event: 'meeting.deleted',
        event_id: 'webhook-delete-1',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify class status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('cancelled');
    });

    it('should handle unrecognized event types', async () => {
      const payload = {
        event: 'meeting.unknown_event',
        event_id: 'webhook-unknown-1',
        payload: {
          object: {
            id: 123456789
          }
        }
      };

      const response = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send(payload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/webhooks/events', () => {
    it('should return all webhook events', async () => {
      // Create some webhook events
      await request(app)
        .post('/api/v1/webhooks/zoom')
        .send({
          event: 'meeting.started',
          event_id: 'event-1',
          payload: { object: { id: 111 } }
        });

      await request(app)
        .post('/api/v1/webhooks/zoom')
        .send({
          event: 'meeting.ended',
          event_id: 'event-2',
          payload: { object: { id: 222 } }
        });

      const response = await request(app)
        .get('/api/v1/webhooks/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should filter webhook events by status', async () => {
      await request(app)
        .post('/api/v1/webhooks/zoom')
        .send({
          event: 'meeting.started',
          event_id: 'event-1',
          payload: { object: { id: 111 } }
        });

      const response = await request(app)
        .get('/api/v1/webhooks/events?status=processed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('processed');
    });

    it('should filter webhook events by eventType', async () => {
      await request(app)
        .post('/api/v1/webhooks/zoom')
        .send({
          event: 'meeting.started',
          event_id: 'event-1',
          payload: { object: { id: 111 } }
        });

      await request(app)
        .post('/api/v1/webhooks/zoom')
        .send({
          event: 'meeting.ended',
          event_id: 'event-2',
          payload: { object: { id: 222 } }
        });

      const response = await request(app)
        .get('/api/v1/webhooks/events?eventType=meeting.started')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].eventType).toBe('meeting.started');
    });
  });

  describe('GET /api/v1/webhooks/events/:eventId', () => {
    it('should return specific webhook event', async () => {
      const webhookResponse = await request(app)
        .post('/api/v1/webhooks/zoom')
        .send({
          event: 'meeting.started',
          event_id: 'event-1',
          payload: { object: { id: 111 } }
        });

      const eventId = webhookResponse.body.eventId;

      const response = await request(app)
        .get(`/api/v1/webhooks/events/${eventId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(eventId);
      expect(response.body.data.eventType).toBe('meeting.started');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/v1/webhooks/events/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Webhook event not found');
    });
  });
});

