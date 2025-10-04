const request = require('supertest');
const app = require('../../src/index');
const liveClassService = require('../../src/services/liveClassService');

describe('LiveClass Controller', () => {
  beforeEach(() => {
    // Clear all classes before each test
    liveClassService.clearAll();
  });

  describe('POST /api/v1/live-classes', () => {
    it('should schedule a live class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const payload = {
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: futureDate.toISOString(),
        duration: 60
      };

      const response = await request(app)
        .post('/api/v1/live-classes')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.instructorId).toBe(payload.instructorId);
      expect(response.body.data.courseId).toBe(payload.courseId);
      expect(response.body.data.zoomMeetingId).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const payload = {
        instructorId: 'instructor-123'
        // Missing courseId and startTime
      };

      const response = await request(app)
        .post('/api/v1/live-classes')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should return 400 for startTime in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const payload = {
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: pastDate.toISOString()
      };

      const response = await request(app)
        .post('/api/v1/live-classes')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid duration', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const payload = {
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: futureDate.toISOString(),
        duration: 10 // Too short
      };

      const response = await request(app)
        .post('/api/v1/live-classes')
        .send(payload)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/live-classes/:classId', () => {
    it('should get a live class by ID', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduled = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const response = await request(app)
        .get(`/api/v1/live-classes/${scheduled.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(scheduled.id);
    });

    it('should return 404 for non-existent class', async () => {
      const response = await request(app)
        .get('/api/v1/live-classes/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Live class not found');
    });
  });

  describe('GET /api/v1/courses/:courseId/live-classes', () => {
    it('should get all live classes for a course', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const courseId = 'course-456';

      await liveClassService.schedule_live_class(
        'instructor-123',
        courseId,
        futureDate.toISOString()
      );

      await liveClassService.schedule_live_class(
        'instructor-456',
        courseId,
        futureDate.toISOString()
      );

      const response = await request(app)
        .get(`/api/v1/courses/${courseId}/live-classes`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/v1/instructors/:instructorId/live-classes', () => {
    it('should get all live classes for an instructor', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const instructorId = 'instructor-123';

      await liveClassService.schedule_live_class(
        instructorId,
        'course-456',
        futureDate.toISOString()
      );

      await liveClassService.schedule_live_class(
        instructorId,
        'course-789',
        futureDate.toISOString()
      );

      const response = await request(app)
        .get(`/api/v1/instructors/${instructorId}/live-classes`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('DELETE /api/v1/live-classes/:classId', () => {
    it('should cancel a live class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduled = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const response = await request(app)
        .delete(`/api/v1/live-classes/${scheduled.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should return 404 when cancelling non-existent class', async () => {
      const response = await request(app)
        .delete('/api/v1/live-classes/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
    });
  });
});

