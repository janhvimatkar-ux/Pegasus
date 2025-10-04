const zoomService = require('../../src/services/zoomService');

describe('ZoomService', () => {
  describe('generateMockMeeting', () => {
    it('should generate mock meeting data', () => {
      const params = {
        instructorId: 'instructor-123',
        topic: 'Test Meeting',
        start_time: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const meeting = zoomService.generateMockMeeting(params);

      expect(meeting).toHaveProperty('id');
      expect(meeting).toHaveProperty('host_id', params.instructorId);
      expect(meeting).toHaveProperty('topic', params.topic);
      expect(meeting).toHaveProperty('start_time', params.start_time);
      expect(meeting).toHaveProperty('duration', params.duration);
      expect(meeting).toHaveProperty('join_url');
      expect(meeting).toHaveProperty('start_url');
      expect(meeting).toHaveProperty('password');
      expect(meeting.join_url).toContain('zoom.us');
    });

    it('should use default topic if not provided', () => {
      const params = {
        instructorId: 'instructor-123',
        start_time: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const meeting = zoomService.generateMockMeeting(params);

      expect(meeting.topic).toBe('Live Class');
    });
  });

  describe('createMeeting', () => {
    it('should create a meeting with mock data in development', async () => {
      const params = {
        instructorId: 'instructor-123',
        topic: 'Test Meeting',
        start_time: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const meeting = await zoomService.createMeeting(params);

      expect(meeting).toHaveProperty('id');
      expect(meeting).toHaveProperty('join_url');
      expect(meeting).toHaveProperty('start_url');
      expect(meeting).toHaveProperty('password');
    });

    it('should include meeting settings', async () => {
      const params = {
        instructorId: 'instructor-123',
        topic: 'Test Meeting',
        start_time: '2025-12-31T10:00:00Z',
        duration: 60
      };

      const meeting = await zoomService.createMeeting(params);

      expect(meeting.settings).toBeDefined();
      expect(meeting.settings.host_video).toBe(true);
      expect(meeting.settings.participant_video).toBe(true);
      expect(meeting.settings.waiting_room).toBe(true);
    });
  });

  describe('getMeeting', () => {
    it('should get meeting details with mock data', async () => {
      const meetingId = '123456789';

      const meeting = await zoomService.getMeeting(meetingId);

      expect(meeting).toHaveProperty('id', meetingId);
      expect(meeting).toHaveProperty('topic');
      expect(meeting).toHaveProperty('status');
    });
  });

  describe('deleteMeeting', () => {
    it('should delete a meeting successfully', async () => {
      const meetingId = '123456789';

      const result = await zoomService.deleteMeeting(meetingId);

      expect(result).toHaveProperty('success', true);
    });
  });

  describe('getAccessToken', () => {
    it('should return mock access token in development', async () => {
      const token = await zoomService.getAccessToken();

      expect(token).toBe('mock_access_token');
    });
  });
});

