/**
 * Integration tests for Zoom webhook handling
 * Tests complete webhook processing flow with mocked responses
 */

const webhookService = require('../../src/services/webhookService');
const liveClassService = require('../../src/services/liveClassService');
const zoomService = require('../../src/services/zoomService');

// Mock Zoom service to avoid actual API calls
jest.mock('../../src/services/zoomService');

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    webhookService.clearAll();
    liveClassService.clearAll();

    // Mock Zoom API responses
    zoomService.createMeeting.mockResolvedValue({
      id: 123456789,
      topic: 'Test Meeting',
      start_time: '2025-12-31T10:00:00Z',
      duration: 60,
      join_url: 'https://zoom.us/j/123456789',
      start_url: 'https://zoom.us/s/123456789',
      password: 'test123'
    });
  });

  describe('meeting.started Webhook', () => {
    it('should update class status to active when meeting starts', async () => {
      // Create a live class first
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const meetingId = parseInt(classResult.liveClass.zoomMeetingId);

      // Simulate meeting.started webhook
      const webhook = {
        event: 'meeting.started',
        event_id: 'zoom-event-start-123',
        payload: {
          object: {
            id: meetingId,
            topic: 'Test Meeting',
            start_time: futureDate.toISOString()
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      expect(result.duplicate).toBeUndefined();

      // Verify class status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('active');
    });

    it('should handle missing live class gracefully', async () => {
      const webhook = {
        event: 'meeting.started',
        event_id: 'zoom-event-missing-123',
        payload: {
          object: {
            id: 999999999 // Non-existent meeting
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('No matching live class');
    });

    it('should not duplicate process when same webhook sent twice', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const webhook = {
        event: 'meeting.started',
        event_id: 'duplicate-event-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      // First processing
      const result1 = await webhookService.processWebhook(webhook);
      expect(result1.success).toBe(true);
      expect(result1.duplicate).toBeUndefined();

      // Second processing (duplicate)
      const result2 = await webhookService.processWebhook(webhook);
      expect(result2.success).toBe(true);
      expect(result2.duplicate).toBe(true);
      expect(result2.message).toBe('Event already processed');
    });
  });

  describe('meeting.ended Webhook', () => {
    it('should update class status to completed when meeting ends', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      // Start the meeting first
      liveClassService.updateStatus(classResult.liveClass.id, 'active');

      const webhook = {
        event: 'meeting.ended',
        event_id: 'zoom-event-end-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);

      // Verify class status updated
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('completed');
    });

    it('should handle ending already completed class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      // Mark as completed
      liveClassService.updateStatus(classResult.liveClass.id, 'completed');

      const webhook = {
        event: 'meeting.ended',
        event_id: 'zoom-event-end-duplicate-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('completed');
    });
  });

  describe('meeting.updated Webhook', () => {
    it('should update class startTime and duration', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { duration: 60 }
      );

      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 14);

      const webhook = {
        event: 'meeting.updated',
        event_id: 'zoom-event-update-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId),
            start_time: newDate.toISOString(),
            duration: 90
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);

      // Verify updates applied
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.startTime).toBe(newDate.toISOString());
      expect(updatedClass.duration).toBe(90);
      expect(updatedClass.updatedAt).toBeDefined();
    });

    it('should handle partial updates (only startTime)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { duration: 60 }
      );

      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 14);

      const webhook = {
        event: 'meeting.updated',
        event_id: 'zoom-event-update-partial-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId),
            start_time: newDate.toISOString()
            // No duration update
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);

      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.startTime).toBe(newDate.toISOString());
      expect(updatedClass.duration).toBe(60); // Unchanged
    });
  });

  describe('meeting.deleted Webhook', () => {
    it('should mark class as cancelled when meeting deleted', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const webhook = {
        event: 'meeting.deleted',
        event_id: 'zoom-event-delete-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);

      // Verify class cancelled
      const updatedClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(updatedClass.status).toBe('cancelled');
    });

    it('should handle deleting already cancelled class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      // Cancel class
      await liveClassService.cancelLiveClass(classResult.liveClass.id);

      const webhook = {
        event: 'meeting.deleted',
        event_id: 'zoom-event-delete-cancelled-123',
        payload: {
          object: {
            id: parseInt(classResult.liveClass.zoomMeetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
    });
  });

  describe('Participant Events', () => {
    it('should log participant_joined event', async () => {
      const webhook = {
        event: 'meeting.participant_joined',
        event_id: 'zoom-event-join-123',
        payload: {
          object: {
            id: 123456789,
            participant: {
              id: 'participant-123',
              user_name: 'John Doe',
              user_email: 'john@example.com'
            }
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('Participant attendance logged');
    });

    it('should log participant_left event', async () => {
      const webhook = {
        event: 'meeting.participant_left',
        event_id: 'zoom-event-left-123',
        payload: {
          object: {
            id: 123456789,
            participant: {
              id: 'participant-123',
              user_name: 'John Doe',
              duration: 3600 // 1 hour
            }
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('Participant departure logged');
    });
  });

  describe('Webhook Error Handling', () => {
    it('should handle unrecognized event types', async () => {
      const webhook = {
        event: 'meeting.unknown_event',
        event_id: 'zoom-event-unknown-123',
        payload: {
          object: {
            id: 123456789
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      expect(result.result.message).toBe('Event type not handled');
    });

    it('should track failed webhook processing', async () => {
      // Mock a failure in the handler
      const originalMethod = webhookService.handleMeetingStarted;
      webhookService.handleMeetingStarted = jest.fn().mockRejectedValue(
        new Error('Database connection lost')
      );

      const webhook = {
        event: 'meeting.started',
        event_id: 'zoom-event-fail-123',
        payload: {
          object: {
            id: 123456789
          }
        }
      };

      await expect(webhookService.processWebhook(webhook)).rejects.toThrow(
        'Database connection lost'
      );

      // Restore original method
      webhookService.handleMeetingStarted = originalMethod;
    });
  });

  describe('Webhook Event Storage', () => {
    it('should store webhook events', async () => {
      const webhook = {
        event: 'meeting.started',
        event_id: 'zoom-event-storage-123',
        payload: {
          object: {
            id: 123456789
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.eventId).toBeDefined();

      // Retrieve stored event
      const storedEvent = webhookService.getEvent(result.eventId);
      expect(storedEvent).toBeDefined();
      expect(storedEvent.eventType).toBe('meeting.started');
      expect(storedEvent.status).toBe('processed');
    });

    it('should filter events by status', async () => {
      const webhook1 = {
        event: 'meeting.started',
        event_id: 'event-1',
        payload: { object: { id: 111 } }
      };

      const webhook2 = {
        event: 'meeting.ended',
        event_id: 'event-2',
        payload: { object: { id: 222 } }
      };

      await webhookService.processWebhook(webhook1);
      await webhookService.processWebhook(webhook2);

      const processedEvents = webhookService.getEvents({ status: 'processed' });
      expect(processedEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple classes with same meeting ID', async () => {
      // This shouldn't happen in practice, but test robustness
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const class1 = await liveClassService.schedule_live_class(
        'instructor-1',
        'course-1',
        futureDate.toISOString()
      );

      const class2 = await liveClassService.schedule_live_class(
        'instructor-2',
        'course-2',
        futureDate.toISOString()
      );

      // Manually set same meeting ID (edge case)
      class2.liveClass.zoomMeetingId = class1.liveClass.zoomMeetingId;

      const webhook = {
        event: 'meeting.started',
        event_id: 'multi-class-123',
        payload: {
          object: {
            id: parseInt(class1.liveClass.zoomMeetingId)
          }
        }
      };

      const result = await webhookService.processWebhook(webhook);

      expect(result.success).toBe(true);
      expect(result.result.updatedClasses).toBe(2);
    });

    it('should handle webhooks with missing payload data', async () => {
      const webhook = {
        event: 'meeting.started',
        event_id: 'missing-payload-123',
        payload: {
          // Missing object.id
        }
      };

      const result = await webhookService.processWebhook(webhook);

      // Should not crash, handle gracefully
      expect(result.success).toBe(true);
    });

    it('should handle rapid succession of webhooks', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const classResult = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const meetingId = parseInt(classResult.liveClass.zoomMeetingId);

      // Send multiple webhooks rapidly
      const webhooks = [
        {
          event: 'meeting.started',
          event_id: 'rapid-1',
          payload: { object: { id: meetingId } }
        },
        {
          event: 'meeting.participant_joined',
          event_id: 'rapid-2',
          payload: { object: { id: meetingId, participant: { id: 'p1' } } }
        },
        {
          event: 'meeting.participant_joined',
          event_id: 'rapid-3',
          payload: { object: { id: meetingId, participant: { id: 'p2' } } }
        },
        {
          event: 'meeting.participant_left',
          event_id: 'rapid-4',
          payload: { object: { id: meetingId, participant: { id: 'p1' } } }
        },
        {
          event: 'meeting.ended',
          event_id: 'rapid-5',
          payload: { object: { id: meetingId } }
        }
      ];

      const results = await Promise.all(
        webhooks.map(w => webhookService.processWebhook(w))
      );

      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);

      // Verify final state
      const finalClass = liveClassService.getLiveClass(classResult.liveClass.id);
      expect(finalClass.status).toBe('completed');
    });
  });
});

