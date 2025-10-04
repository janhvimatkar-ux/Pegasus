const emailService = require('../../src/services/emailService');
const LiveClass = require('../../src/models/LiveClass');

describe('EmailService', () => {
  describe('sendInviteToParticipants', () => {
    it('should send mock calendar invites', async () => {
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
        start_url: 'https://zoom.us/s/123456789',
        password: 'test123'
      };

      const participantEmails = ['alice@example.com', 'bob@example.com'];
      const icsContent = 'BEGIN:VCALENDAR...END:VCALENDAR';

      const result = await emailService.sendInviteToParticipants(
        liveClass,
        zoomMeeting,
        participantEmails,
        icsContent
      );

      expect(result.success).toBe(true);
      expect(result.recipients).toBe(2);
      expect(result.emails).toEqual(participantEmails);
      expect(result.method).toBe('mock');
      expect(result.messageId).toBeDefined();
    });

    it('should handle empty participant list', async () => {
      const liveClass = new LiveClass({
        instructorId: 'inst-1',
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      });

      const zoomMeeting = {
        id: '123456789',
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
  });

  describe('buildEmailContent', () => {
    it('should build email content with all details', () => {
      const liveClass = {
        id: 'class-123',
        instructorId: 'inst-1',
        courseId: 'course-456',
        startTime: '2025-12-31T10:00:00Z',
        duration: 90
      };

      const zoomMeeting = {
        id: '987654321',
        topic: 'Advanced Math',
        join_url: 'https://zoom.us/j/987654321',
        start_url: 'https://zoom.us/s/987654321',
        password: 'secret123'
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      expect(content.subject).toContain('Advanced Math');
      expect(content.html).toContain('Advanced Math');
      expect(content.html).toContain('https://zoom.us/j/987654321');
      expect(content.html).toContain('secret123');
      expect(content.html).toContain('90 minutes');
      expect(content.html).toContain('course-456');
      expect(content.html).toContain('987654321');
      expect(content.text).toBeDefined();
    });

    it('should handle missing password', () => {
      const liveClass = {
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const zoomMeeting = {
        id: '123456789',
        join_url: 'https://zoom.us/j/123456789'
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      expect(content.html).not.toContain('Meeting Password:');
    });

    it('should use default topic if missing', () => {
      const liveClass = {
        courseId: 'course-1',
        startTime: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const zoomMeeting = {
        id: '123456789',
        join_url: 'https://zoom.us/j/123456789'
      };

      const content = emailService.buildEmailContent(liveClass, zoomMeeting);

      expect(content.html).toContain('Live Class');
    });
  });

  describe('htmlToText', () => {
    it('should convert HTML to plain text', () => {
      const html = '<p>Hello <strong>World</strong></p><div>Test</div>';
      const text = emailService.htmlToText(html);

      expect(text).not.toContain('<');
      expect(text).not.toContain('>');
      expect(text).toContain('Hello');
      expect(text).toContain('World');
      expect(text).toContain('Test');
    });

    it('should remove style tags', () => {
      const html = '<style>body{color:red;}</style><p>Content</p>';
      const text = emailService.htmlToText(html);

      expect(text).not.toContain('body{color:red;}');
      expect(text).toContain('Content');
    });
  });
});

