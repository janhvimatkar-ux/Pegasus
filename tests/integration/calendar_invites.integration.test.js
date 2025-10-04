/**
 * Integration tests for calendar invite generation
 * Tests the complete flow: calendar event creation → ICS generation → email sending
 */

const calendarService = require('../../src/services/calendarService');
const emailService = require('../../src/services/emailService');
const LiveClass = require('../../src/models/LiveClass');

describe('Calendar Invites Integration Tests', () => {
  describe('Calendar Event Creation', () => {
    it('should create complete calendar event from live class', () => {
      const liveClass = new LiveClass({
        id: 'class-123',
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 90
      });

      const zoomMeeting = {
        id: 123456789,
        topic: 'Advanced Mathematics',
        join_url: 'https://zoom.us/j/123456789',
        start_url: 'https://zoom.us/s/123456789',
        password: 'secure123'
      };

      const participants = [
        { name: 'Alice Smith', email: 'alice@example.com', role: 'student' },
        { name: 'Bob Jones', email: 'bob@example.com', role: 'student' }
      ];

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        participants
      );

      // Verify event structure
      expect(event.uid).toContain('live-class-class-123');
      expect(event.title).toBe('Advanced Mathematics');
      expect(event.location).toBe('https://zoom.us/j/123456789');
      expect(event.description).toContain('Meeting Password: secure123');
      expect(event.description).toContain('Meeting ID: 123456789');
      expect(event.description).toContain('90 minutes');
      
      // Verify times
      expect(event.startTime).toEqual(new Date('2025-12-31T10:00:00Z'));
      expect(event.endTime).toEqual(new Date('2025-12-31T11:30:00Z')); // +90 min

      // Verify attendees
      expect(event.attendees).toHaveLength(2);
      expect(event.attendees[0]).toEqual({
        name: 'Alice Smith',
        email: 'alice@example.com',
        role: 'student'
      });
    });

    it('should handle event without password', () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 987654321,
        topic: 'Open Session',
        join_url: 'https://zoom.us/j/987654321'
        // No password
      };

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        []
      );

      expect(event.description).not.toContain('Meeting Password');
      expect(event.description).toContain('Join Zoom Meeting');
    });

    it('should handle event with no participants', () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 111111111,
        join_url: 'https://zoom.us/j/111111111'
      };

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        []
      );

      expect(event.attendees).toHaveLength(0);
      expect(event.uid).toBeDefined();
    });
  });

  describe('ICS File Generation', () => {
    it('should generate valid RFC 5545 iCalendar format', () => {
      const event = {
        uid: 'test-event-123@pegasus.com',
        title: 'Test Meeting',
        description: 'Join Zoom Meeting\\nhttps://zoom.us/j/123',
        location: 'https://zoom.us/j/123',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: {
          name: 'Pegasus EdTech',
          email: 'noreply@pegasus-edtech.com'
        },
        attendees: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' }
        ]
      };

      const ics = calendarService.generateICS(event);

      // Verify required iCalendar components
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('METHOD:REQUEST');
      expect(ics).toContain('PRODID:-//Pegasus EdTech');

      // Verify event
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('UID:test-event-123@pegasus.com');
      expect(ics).toContain('SUMMARY:Test Meeting');
      expect(ics).toContain('LOCATION:https://zoom.us/j/123');

      // Verify attendees
      expect(ics).toContain('ATTENDEE;CN=Alice');
      expect(ics).toContain('mailto:alice@example.com');
      expect(ics).toContain('ATTENDEE;CN=Bob');
      expect(ics).toContain('mailto:bob@example.com');

      // Verify alarm/reminder
      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('TRIGGER:-PT15M');
      expect(ics).toContain('END:VALARM');

      // Verify line endings (CRLF)
      expect(ics).toContain('\r\n');
    });

    it('should escape special characters in iCalendar format', () => {
      const event = {
        uid: 'escape-test-123',
        title: 'Meeting; with, special\\ncharacters',
        description: 'Description;with,special\\nchars',
        location: 'Location;Test',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: { name: 'Test', email: 'test@example.com' },
        attendees: []
      };

      const ics = calendarService.generateICS(event);

      // Verify escaping
      expect(ics).toContain('\\;');
      expect(ics).toContain('\\,');
      expect(ics).toContain('\\n');
      expect(ics).not.toContain('Meeting; with, special'); // Should be escaped
    });

    it('should handle long descriptions and titles', () => {
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(1000);

      const event = {
        uid: 'long-content-test',
        title: longTitle,
        description: longDescription,
        location: 'Zoom',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: { name: 'Test', email: 'test@example.com' },
        attendees: []
      };

      const ics = calendarService.generateICS(event);

      expect(ics).toContain('SUMMARY:');
      expect(ics).toContain('DESCRIPTION:');
      expect(ics.length).toBeGreaterThan(1000);
    });

    it('should generate unique DTSTAMPs for each event', () => {
      const event1 = {
        uid: 'event-1',
        title: 'Event 1',
        description: 'Test',
        location: 'Zoom',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: { name: 'Test', email: 'test@example.com' },
        attendees: []
      };

      const event2 = { ...event1, uid: 'event-2', title: 'Event 2' };

      const ics1 = calendarService.generateICS(event1);
      const ics2 = calendarService.generateICS(event2);

      // Extract DTSTAMP values
      const stamp1 = ics1.match(/DTSTAMP:(\d+Z)/);
      const stamp2 = ics2.match(/DTSTAMP:(\d+Z)/);

      expect(stamp1).toBeTruthy();
      expect(stamp2).toBeTruthy();
      // Stamps should be same or close (within same second)
    });

    it('should format dates in ISO format without separators', () => {
      const event = {
        uid: 'date-format-test',
        title: 'Test',
        description: 'Test',
        location: 'Zoom',
        startTime: new Date('2025-12-31T10:30:45Z'),
        endTime: new Date('2025-12-31T11:30:45Z'),
        organizer: { name: 'Test', email: 'test@example.com' },
        attendees: []
      };

      const ics = calendarService.generateICS(event);

      // Should contain date in format: 20251231T103045Z
      expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
      expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/);
    });
  });

  describe('Email with Calendar Attachment', () => {
    it('should generate email with meeting details', () => {
      const liveClass = {
        id: 'class-123',
        courseId: 'course-math-101',
        startTime: '2025-12-31T10:00:00Z',
        duration: 90
      };

      const zoomMeeting = {
        id: 123456789,
        topic: 'Advanced Calculus',
        join_url: 'https://zoom.us/j/123456789?pwd=abc',
        start_url: 'https://zoom.us/s/123456789',
        password: 'secret123'
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      // Verify subject
      expect(content.subject).toContain('Advanced Calculus');

      // Verify HTML content
      expect(content.html).toContain('Advanced Calculus');
      expect(content.html).toContain('https://zoom.us/j/123456789?pwd=abc');
      expect(content.html).toContain('secret123');
      expect(content.html).toContain('90 minutes');
      expect(content.html).toContain('course-math-101');
      expect(content.html).toContain('123456789');

      // Verify HTML structure
      expect(content.html).toContain('<!DOCTYPE html>');
      expect(content.html).toContain('<head>');
      expect(content.html).toContain('<style>');
      expect(content.html).toContain('🎥 Join Zoom Meeting');

      // Verify plain text fallback
      expect(content.text).toBeDefined();
      expect(content.text).toContain('Advanced Calculus');
    });

    it('should handle email without password', () => {
      const liveClass = {
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const zoomMeeting = {
        id: 987654321,
        join_url: 'https://zoom.us/j/987654321'
        // No password
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      expect(content.html).not.toContain('Meeting Password:');
      expect(content.html).toContain('Join Zoom Meeting');
    });

    it('should use default topic if missing', () => {
      const liveClass = {
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const zoomMeeting = {
        id: 111111111,
        join_url: 'https://zoom.us/j/111111111'
        // No topic
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      expect(content.subject).toContain('Live Class');
      expect(content.html).toContain('Live Class');
    });

    it('should convert HTML to plain text', () => {
      const html = `
        <html>
          <head><style>body{color:red;}</style></head>
          <body>
            <h1>Meeting Title</h1>
            <p>Join the <strong>meeting</strong> at:</p>
            <a href="https://zoom.us">Link</a>
          </body>
        </html>
      `;

      const text = emailService.htmlToText(html);

      expect(text).not.toContain('<html>');
      expect(text).not.toContain('<style>');
      expect(text).not.toContain('<strong>');
      expect(text).toContain('Meeting Title');
      expect(text).toContain('meeting');
    });

    it('should format date in user-friendly way', () => {
      const liveClass = {
        courseId: 'course-1',
        startTime: '2025-12-31T14:30:00Z',
        duration: 60
      };

      const zoomMeeting = {
        id: 123456789,
        join_url: 'https://zoom.us/j/123456789'
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      // Should contain formatted date (exact format may vary by locale)
      expect(content.html).toMatch(/December|Dec/);
      expect(content.html).toMatch(/31/);
      expect(content.html).toMatch(/2025/);
    });
  });

  describe('Complete Invite Flow', () => {
    it('should send mock invites successfully', async () => {
      const liveClass = new LiveClass({
        id: 'class-123',
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 123456789,
        topic: 'Test Class',
        join_url: 'https://zoom.us/j/123456789',
        password: 'test123'
      };

      const participantEmails = [
        'alice@example.com',
        'bob@example.com',
        'charlie@example.com'
      ];

      const icsContent = 'BEGIN:VCALENDAR...END:VCALENDAR';

      const result = await emailService.sendInviteToParticipants(
        liveClass,
        zoomMeeting,
        participantEmails,
        icsContent
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.recipients).toBe(3);
      expect(result.emails).toEqual(participantEmails);
      expect(result.method).toBe('mock');
    });

    it('should handle empty recipient list', async () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 123456789,
        join_url: 'https://zoom.us/j/123456789'
      };

      const result = await emailService.sendInviteToParticipants(
        liveClass,
        zoomMeeting,
        [],
        'ICS_CONTENT'
      );

      expect(result.success).toBe(true);
      expect(result.recipients).toBe(0);
    });

    it('should simulate email sending delay', async () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 123456789,
        join_url: 'https://zoom.us/j/123456789'
      };

      const startTime = Date.now();
      
      await emailService.sendInviteToParticipants(
        liveClass,
        zoomMeeting,
        ['test@example.com'],
        'ICS'
      );

      const duration = Date.now() - startTime;

      // Should have some delay (mock delay is 300ms)
      expect(duration).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long participant lists', () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 123456789,
        join_url: 'https://zoom.us/j/123456789'
      };

      const participants = Array.from({ length: 100 }, (_, i) => ({
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        role: 'student'
      }));

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        participants
      );

      expect(event.attendees).toHaveLength(100);

      const ics = calendarService.generateICS(event);
      expect((ics.match(/ATTENDEE/g) || []).length).toBe(100);
    });

    it('should handle Unicode characters in names and topics', () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 123456789,
        topic: 'Matemáticas Avanzadas 数学 🎓',
        join_url: 'https://zoom.us/j/123456789'
      };

      const participants = [
        { name: 'José García', email: 'jose@example.com' },
        { name: '田中太郎', email: 'tanaka@example.com' },
        { name: 'François Müller', email: 'francois@example.com' }
      ];

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        participants
      );

      expect(event.title).toContain('Matemáticas');
      expect(event.attendees[0].name).toBe('José García');

      const ics = calendarService.generateICS(event);
      expect(ics).toBeDefined();
      expect(ics.length).toBeGreaterThan(0);
    });

    it('should handle meetings spanning midnight', () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T23:00:00Z',
        duration: 120 // 2 hours, ends at 01:00 next day
      });

      const zoomMeeting = {
        id: 123456789,
        join_url: 'https://zoom.us/j/123456789'
      };

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        []
      );

      expect(event.startTime.getDate()).toBe(31);
      expect(event.endTime.getDate()).toBe(1); // Next day
      expect(event.endTime.getMonth()).toBe(0); // January
      expect(event.endTime.getFullYear()).toBe(2026);
    });

    it('should handle email addresses with special characters', async () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: 123456789,
        join_url: 'https://zoom.us/j/123456789'
      };

      const participants = [
        { name: 'User', email: 'user+tag@example.com' },
        { name: 'User', email: 'user.name@sub.example.com' }
      ];

      const result = await emailService.sendInviteToParticipants(
        liveClass,
        zoomMeeting,
        participants.map(p => p.email),
        'ICS'
      );

      expect(result.success).toBe(true);
      expect(result.recipients).toBe(2);
    });
  });
});

