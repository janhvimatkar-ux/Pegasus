const calendarService = require('../../src/services/calendarService');
const LiveClass = require('../../src/models/LiveClass');

describe('CalendarService', () => {
  describe('createEventFromLiveClass', () => {
    it('should create calendar event from live class and zoom meeting', () => {
      const liveClass = new LiveClass({
        id: 'class-123',
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: '123456789',
        topic: 'Test Class',
        join_url: 'https://zoom.us/j/123456789',
        password: 'test123'
      };

      const participants = [
        { name: 'Alice', email: 'alice@example.com', role: 'student' },
        { name: 'Bob', email: 'bob@example.com', role: 'student' }
      ];

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        participants
      );

      expect(event.uid).toContain('live-class-class-123');
      expect(event.title).toBe('Test Class');
      expect(event.location).toBe('https://zoom.us/j/123456789');
      expect(event.attendees).toHaveLength(2);
      expect(event.attendees[0].email).toBe('alice@example.com');
      expect(event.description).toContain('Join Zoom Meeting');
      expect(event.description).toContain('test123');
    });

    it('should handle missing zoom password', () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: '123456789',
        topic: 'Test Class',
        join_url: 'https://zoom.us/j/123456789'
      };

      const event = calendarService.createEventFromLiveClass(
        liveClass,
        zoomMeeting,
        []
      );

      expect(event.description).not.toContain('Meeting Password');
    });
  });

  describe('buildDescription', () => {
    it('should build event description with all details', () => {
      const liveClass = {
        courseId: 'course-123',
        duration: 90
      };

      const zoomMeeting = {
        id: '987654321',
        join_url: 'https://zoom.us/j/987654321',
        password: 'pass123'
      };

      const description = calendarService.buildDescription(liveClass, zoomMeeting);

      expect(description).toContain('course-123');
      expect(description).toContain('https://zoom.us/j/987654321');
      expect(description).toContain('pass123');
      expect(description).toContain('90 minutes');
      expect(description).toContain('987654321');
    });
  });

  describe('generateICS', () => {
    it('should generate valid iCalendar content', () => {
      const event = {
        uid: 'test-event-123',
        title: 'Test Meeting',
        description: 'Test Description',
        location: 'https://zoom.us/j/123',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: {
          name: 'Test Organizer',
          email: 'org@example.com'
        },
        attendees: [
          { name: 'Alice', email: 'alice@example.com' }
        ]
      };

      const ics = calendarService.generateICS(event);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('UID:test-event-123');
      expect(ics).toContain('SUMMARY:Test Meeting');
      expect(ics).toContain('LOCATION:https://zoom.us/j/123');
      expect(ics).toContain('ORGANIZER;CN=Test Organizer:mailto:org@example.com');
      expect(ics).toContain('ATTENDEE;CN=Alice');
      expect(ics).toContain('mailto:alice@example.com');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('METHOD:REQUEST');
      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('TRIGGER:-PT15M');
    });

    it('should handle multiple attendees', () => {
      const event = {
        uid: 'test-event-456',
        title: 'Multi-Attendee Meeting',
        description: 'Test',
        location: 'Zoom',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: { name: 'Org', email: 'org@example.com' },
        attendees: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' },
          { name: 'Charlie', email: 'charlie@example.com' }
        ]
      };

      const ics = calendarService.generateICS(event);

      expect(ics).toContain('mailto:alice@example.com');
      expect(ics).toContain('mailto:bob@example.com');
      expect(ics).toContain('mailto:charlie@example.com');
      expect((ics.match(/ATTENDEE/g) || []).length).toBe(3);
    });

    it('should escape special characters', () => {
      const event = {
        uid: 'test-event-789',
        title: 'Meeting; with, special\\ncharacters',
        description: 'Description;with,special\\nchars',
        location: 'Location;Test',
        startTime: new Date('2025-12-31T10:00:00Z'),
        endTime: new Date('2025-12-31T11:00:00Z'),
        organizer: { name: 'Org', email: 'org@example.com' },
        attendees: []
      };

      const ics = calendarService.generateICS(event);

      expect(ics).toContain('\\;');
      expect(ics).toContain('\\,');
      expect(ics).toContain('\\n');
    });
  });
});

