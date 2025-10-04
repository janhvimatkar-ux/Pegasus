/**
 * Integration tests for schedule_live_class()
 * Tests the complete flow: validation → Zoom API → calendar invites
 */

const liveClassService = require('../../src/services/liveClassService');
const zoomService = require('../../src/services/zoomService');
const calendarService = require('../../src/services/calendarService');
const emailService = require('../../src/services/emailService');

// Mock the services
jest.mock('../../src/services/zoomService');
jest.mock('../../src/services/calendarService');
jest.mock('../../src/services/emailService');

describe('schedule_live_class() Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks and live classes before each test
    jest.clearAllMocks();
    liveClassService.clearAll();

    // Default mock implementations
    zoomService.createMeeting.mockResolvedValue({
      id: 123456789,
      topic: 'Mock Meeting',
      start_time: '2025-12-31T10:00:00Z',
      duration: 60,
      join_url: 'https://zoom.us/j/123456789',
      start_url: 'https://zoom.us/s/123456789',
      password: 'mockpass123'
    });

    calendarService.createEventFromLiveClass.mockReturnValue({
      uid: 'event-123',
      title: 'Test Class',
      startTime: new Date('2025-12-31T10:00:00Z'),
      endTime: new Date('2025-12-31T11:00:00Z'),
      attendees: []
    });

    calendarService.generateICS.mockReturnValue('BEGIN:VCALENDAR...END:VCALENDAR');

    emailService.sendInviteToParticipants.mockResolvedValue({
      success: true,
      messageId: 'mock-message-123',
      recipients: 2
    });
  });

  describe('Success Cases', () => {
    it('should successfully schedule a basic live class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      // Verify Zoom API was called
      expect(zoomService.createMeeting).toHaveBeenCalledWith({
        instructorId: 'instructor-123',
        topic: 'course-456 - Live Class',
        start_time: futureDate.toISOString(),
        duration: 60,
        timezone: 'UTC'
      });

      // Verify result structure
      expect(result).toHaveProperty('liveClass');
      expect(result).toHaveProperty('zoomMeeting');
      expect(result).toHaveProperty('invitations');
      
      expect(result.liveClass.instructorId).toBe('instructor-123');
      expect(result.liveClass.courseId).toBe('course-456');
      expect(result.liveClass.zoomMeetingId).toBe('123456789');
      expect(result.zoomMeeting.joinUrl).toBe('https://zoom.us/j/123456789');
      expect(result.invitations).toBeNull(); // No participants provided
    });

    it('should schedule class with calendar invites when participants provided', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const participants = [
        { name: 'Alice', email: 'alice@example.com', role: 'student' },
        { name: 'Bob', email: 'bob@example.com', role: 'student' }
      ];

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        {
          duration: 90,
          topic: 'Advanced Math',
          participants
        }
      );

      // Verify Zoom meeting created
      expect(zoomService.createMeeting).toHaveBeenCalled();

      // Verify calendar service called
      expect(calendarService.createEventFromLiveClass).toHaveBeenCalled();
      expect(calendarService.generateICS).toHaveBeenCalled();

      // Verify email service called
      expect(emailService.sendInviteToParticipants).toHaveBeenCalledWith(
        expect.any(Object), // liveClass
        expect.any(Object), // zoomMeeting
        ['alice@example.com', 'bob@example.com'],
        expect.any(String) // icsContent
      );

      // Verify invitations sent
      expect(result.invitations).toBeDefined();
      expect(result.invitations.success).toBe(true);
      expect(result.invitations.recipients).toBe(2);
    });

    it('should handle custom duration and timezone', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        {
          duration: 120,
          timezone: 'America/New_York',
          topic: 'Special Session'
        }
      );

      expect(zoomService.createMeeting).toHaveBeenCalledWith({
        instructorId: 'instructor-123',
        topic: 'Special Session',
        start_time: futureDate.toISOString(),
        duration: 120,
        timezone: 'America/New_York'
      });

      expect(result.liveClass.duration).toBe(120);
    });

    it('should skip invites when sendCalendarInvite is false', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        {
          participants: [{ name: 'Alice', email: 'alice@example.com' }],
          sendCalendarInvite: false
        }
      );

      expect(calendarService.createEventFromLiveClass).not.toHaveBeenCalled();
      expect(emailService.sendInviteToParticipants).not.toHaveBeenCalled();
      expect(result.invitations).toBeNull();
    });
  });

  describe('Failure Cases', () => {
    it('should fail when instructorId is missing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        liveClassService.schedule_live_class(
          null,
          'course-456',
          futureDate.toISOString()
        )
      ).rejects.toThrow('instructorId is required');

      expect(zoomService.createMeeting).not.toHaveBeenCalled();
    });

    it('should fail when courseId is missing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          null,
          futureDate.toISOString()
        )
      ).rejects.toThrow('courseId is required');

      expect(zoomService.createMeeting).not.toHaveBeenCalled();
    });

    it('should fail when startTime is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          'course-456',
          pastDate.toISOString()
        )
      ).rejects.toThrow('startTime must be in the future');

      expect(zoomService.createMeeting).not.toHaveBeenCalled();
    });

    it('should fail when startTime is invalid', async () => {
      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          'course-456',
          'invalid-date'
        )
      ).rejects.toThrow('startTime must be a valid date');
    });

    it('should fail when duration is too short', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          'course-456',
          futureDate.toISOString(),
          { duration: 10 }
        )
      ).rejects.toThrow('duration must be between 15 and 480 minutes');
    });

    it('should fail when duration is too long', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          'course-456',
          futureDate.toISOString(),
          { duration: 500 }
        )
      ).rejects.toThrow('duration must be between 15 and 480 minutes');
    });

    it('should propagate Zoom API errors', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      zoomService.createMeeting.mockRejectedValue(
        new Error('Zoom API: Rate limit exceeded')
      );

      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          'course-456',
          futureDate.toISOString()
        )
      ).rejects.toThrow('Zoom API: Rate limit exceeded');
    });

    it('should create class even if calendar invites fail', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      emailService.sendInviteToParticipants.mockRejectedValue(
        new Error('Email service unavailable')
      );

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        {
          participants: [{ name: 'Alice', email: 'alice@example.com' }]
        }
      );

      // Class should be created
      expect(result.liveClass).toBeDefined();
      expect(result.zoomMeeting).toBeDefined();

      // Invitations should show failure
      expect(result.invitations).toBeDefined();
      expect(result.invitations.success).toBe(false);
      expect(result.invitations.error).toContain('Email service unavailable');
    });
  });

  describe('Edge Cases', () => {
    it('should handle startTime exactly at current moment', async () => {
      const now = new Date();
      now.setMilliseconds(now.getMilliseconds() + 100); // Slightly in future

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        now.toISOString()
      );

      expect(result.liveClass).toBeDefined();
    });

    it('should handle minimum valid duration (15 minutes)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { duration: 15 }
      );

      expect(result.liveClass.duration).toBe(15);
    });

    it('should handle maximum valid duration (480 minutes)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { duration: 480 }
      );

      expect(result.liveClass.duration).toBe(480);
    });

    it('should handle empty participants array', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { participants: [] }
      );

      expect(result.invitations).toBeNull();
      expect(emailService.sendInviteToParticipants).not.toHaveBeenCalled();
    });

    it('should handle very long topic names', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const longTopic = 'A'.repeat(200);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString(),
        { topic: longTopic }
      );

      expect(result.zoomMeeting.topic).toBeDefined();
    });

    it('should handle special characters in IDs', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = await liveClassService.schedule_live_class(
        'instructor-123-abc@xyz',
        'course-456-test!',
        futureDate.toISOString()
      );

      expect(result.liveClass.instructorId).toBe('instructor-123-abc@xyz');
      expect(result.liveClass.courseId).toBe('course-456-test!');
    });

    it('should handle far future dates (1 year ahead)', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      expect(result.liveClass).toBeDefined();
    });

    it('should handle concurrent scheduling requests', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const promises = Array.from({ length: 5 }, (_, i) =>
        liveClassService.schedule_live_class(
          `instructor-${i}`,
          `course-${i}`,
          futureDate.toISOString()
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(liveClassService.liveClasses.size).toBe(5);
    });
  });

  describe('Zoom API Response Variations', () => {
    it('should handle Zoom response without password', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      zoomService.createMeeting.mockResolvedValue({
        id: 123456789,
        topic: 'Mock Meeting',
        start_time: futureDate.toISOString(),
        duration: 60,
        join_url: 'https://zoom.us/j/123456789',
        start_url: 'https://zoom.us/s/123456789'
        // No password
      });

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      expect(result.zoomMeeting.password).toBeUndefined();
    });

    it('should handle different Zoom meeting ID formats', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      zoomService.createMeeting.mockResolvedValue({
        id: 9876543210, // 10-digit ID
        topic: 'Mock Meeting',
        start_time: futureDate.toISOString(),
        duration: 60,
        join_url: 'https://zoom.us/j/9876543210',
        start_url: 'https://zoom.us/s/9876543210',
        password: 'test'
      });

      const result = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      expect(result.liveClass.zoomMeetingId).toBe('9876543210');
    });
  });
});

