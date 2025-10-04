const webhookService = require('../../src/services/webhookService');
const liveClassService = require('../../src/services/liveClassService');

describe('WebhookService', () => {
  beforeEach(() => {
    // Clear webhook events and live classes before each test
    webhookService.clearAll();
    liveClassService.clearAll();
  });

  describe('isEventProcessed', () => {
    it('should return false for new event', () => {
      const result = webhookService.isEventProcessed('new-event-123');
      expect(result).toBe(false);
    });

    it('should return true for already processed event', async () => {
      const payload = {
        event: 'meeting.started',
        event_id: 'test-event-123',
        payload: {
          object: {
            id: '123456789'
          }
        }
      };

      await webhookService.processWebhook(payload);
      const result = webhookService.isEventProcessed('test-event-123');
      
      expect(result).toBe(true);
    });
  });

  describe('processWebhook - idempotency', () => {
    it('should process webhook only once (idempotency)', async () => {
      const payload = {
        event: 'meeting.started',
        event_id: 'duplicate-test-123',
        payload: {
          object: {
            id: '987654321'
          }
        }
      };

      // Process first time
      const result1 = await webhookService.processWebhook(payload);
      expect(result1.success).toBe(true);
      expect(result1.duplicate).toBeUndefined();

      // Process second time (should be skipped)
      const result2 = await webhookService.processWebhook(payload);
      expect(result2.success).toBe(true);
      expect(result2.duplicate).toBe(true);
      expect(result2.message).toBe('Event already processed');
    });
  });

  describe('handleMeetingStarted', () => {
    it('should update live class status to active', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      // Create a live class first
      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const meetingId = classResult.liveClass.zoomMeetingId;

      // Send webhook
      const payload = {
        event: 'meeting.started',
        event_id: 'start-event-123',
        payload: {
          object: {
            id: parseInt(meetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      
      // Check status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('active');
    });

    it('should handle meeting started for non-existent class', async () => {
      const payload = {
        event: 'meeting.started',
        event_id: 'start-event-456',
        payload: {
          object: {
            id: 999999999
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('No matching live class');
    });
  });

  describe('handleMeetingEnded', () => {
    it('should update live class status to completed', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      // Create and start a live class
      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const meetingId = classResult.liveClass.zoomMeetingId;
      liveClassService.updateStatus(classResult.liveClass.id, 'active');

      // Send webhook
      const payload = {
        event: 'meeting.ended',
        event_id: 'end-event-123',
        payload: {
          object: {
            id: parseInt(meetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      
      // Check status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('completed');
    });
  });

  describe('handleMeetingUpdated', () => {
    it('should update live class with new meeting details', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      // Create a live class
      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { duration: 60 }
      );

      const meetingId = classResult.liveClass.zoomMeetingId;

      // Send update webhook
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 14);

      const payload = {
        event: 'meeting.updated',
        event_id: 'update-event-123',
        payload: {
          object: {
            id: parseInt(meetingId),
            start_time: newDate.toISOString(),
            duration: 90
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      
      // Check updates applied
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.startTime).toBe(newDate.toISOString());
      expect(updatedClass.duration).toBe(90);
    });
  });

  describe('handleMeetingDeleted', () => {
    it('should update live class status to cancelled', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      // Create a live class
      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const meetingId = classResult.liveClass.zoomMeetingId;

      // Send deletion webhook
      const payload = {
        event: 'meeting.deleted',
        event_id: 'delete-event-123',
        payload: {
          object: {
            id: parseInt(meetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      
      // Check status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('cancelled');
    });
  });

  describe('handleParticipantJoined', () => {
    it('should log participant join event', async () => {
      const payload = {
        event: 'meeting.participant_joined',
        event_id: 'join-event-123',
        payload: {
          object: {
            id: 123456789,
            participant: {
              id: 'participant-123',
              user_name: 'John Doe'
            }
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('Participant attendance logged');
    });
  });

  describe('handleParticipantLeft', () => {
    it('should log participant leave event', async () => {
      const payload = {
        event: 'meeting.participant_left',
        event_id: 'leave-event-123',
        payload: {
          object: {
            id: 123456789,
            participant: {
              id: 'participant-123',
              user_name: 'John Doe'
            }
          }
        }
      };

      const result = await webhookService.processWebhook(payload);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('Participant departure logged');
    });
  });

  describe('getEvents', () => {
    it('should return all webhook events', async () => {
      const payload1 = {
        event: 'meeting.started',
        event_id: 'event-1',
        payload: { object: { id: 111 } }
      };

      const payload2 = {
        event: 'meeting.ended',
        event_id: 'event-2',
        payload: { object: { id: 222 } }
      };

      await webhookService.processWebhook(payload1);
      await webhookService.processWebhook(payload2);

      const events = webhookService.getEvents();

      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe('meeting.ended'); // Most recent first
      expect(events[1].eventType).toBe('meeting.started');
    });

    it('should filter events by status', async () => {
      const payload = {
        event: 'meeting.started',
        event_id: 'event-1',
        payload: { object: { id: 111 } }
      };

      await webhookService.processWebhook(payload);

      const processedEvents = webhookService.getEvents({ status: 'processed' });
      const failedEvents = webhookService.getEvents({ status: 'failed' });

      expect(processedEvents).toHaveLength(1);
      expect(failedEvents).toHaveLength(0);
    });

    it('should filter events by eventType', async () => {
      const payload1 = {
        event: 'meeting.started',
        event_id: 'event-1',
        payload: { object: { id: 111 } }
      };

      const payload2 = {
        event: 'meeting.ended',
        event_id: 'event-2',
        payload: { object: { id: 222 } }
      };

      await webhookService.processWebhook(payload1);
      await webhookService.processWebhook(payload2);

      const startedEvents = webhookService.getEvents({ eventType: 'meeting.started' });

      expect(startedEvents).toHaveLength(1);
      expect(startedEvents[0].eventType).toBe('meeting.started');
    });
  });
});

