const liveClassService = require('../../src/services/liveClassService');
const LiveClass = require('../../src/models/LiveClass');

describe('LiveClassService', () => {
  beforeEach(() => {
    // Clear all classes before each test
    liveClassService.clearAll();
  });

  describe('schedule_live_class', () => {
    it('should schedule a live class successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const instructorId = 'instructor-123';
      const courseId = 'course-456';
      const startTime = futureDate.toISOString();

      const liveClass = await liveClassService.schedule_live_class(
        instructorId,
        courseId,
        startTime
      );

      expect(liveClass).toBeInstanceOf(LiveClass);
      expect(liveClass.instructorId).toBe(instructorId);
      expect(liveClass.courseId).toBe(courseId);
      expect(liveClass.startTime).toBe(startTime);
      expect(liveClass.zoomMeetingId).toBeDefined();
      expect(liveClass.zoomJoinUrl).toBeDefined();
      expect(liveClass.zoomStartUrl).toBeDefined();
    });

    it('should schedule a live class with custom duration', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const instructorId = 'instructor-123';
      const courseId = 'course-456';
      const startTime = futureDate.toISOString();
      const options = { duration: 90 };

      const liveClass = await liveClassService.schedule_live_class(
        instructorId,
        courseId,
        startTime,
        options
      );

      expect(liveClass.duration).toBe(90);
    });

    it('should throw error when instructorId is missing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        liveClassService.schedule_live_class(null, 'course-456', futureDate.toISOString())
      ).rejects.toThrow();
    });

    it('should throw error when courseId is missing', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(
        liveClassService.schedule_live_class('instructor-123', null, futureDate.toISOString())
      ).rejects.toThrow();
    });

    it('should throw error when startTime is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      await expect(
        liveClassService.schedule_live_class(
          'instructor-123',
          'course-456',
          pastDate.toISOString()
        )
      ).rejects.toThrow();
    });
  });

  describe('getLiveClass', () => {
    it('should get a live class by ID', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduled = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const retrieved = liveClassService.getLiveClass(scheduled.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(scheduled.id);
    });

    it('should return null for non-existent class', () => {
      const retrieved = liveClassService.getLiveClass('non-existent-id');

      expect(retrieved).toBeNull();
    });
  });

  describe('getLiveClassesByCourse', () => {
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

      await liveClassService.schedule_live_class(
        'instructor-789',
        'course-789',
        futureDate.toISOString()
      );

      const classes = liveClassService.getLiveClassesByCourse(courseId);

      expect(classes).toHaveLength(2);
      expect(classes.every(c => c.courseId === courseId)).toBe(true);
    });

    it('should return empty array for course with no classes', () => {
      const classes = liveClassService.getLiveClassesByCourse('non-existent-course');

      expect(classes).toHaveLength(0);
    });
  });

  describe('getLiveClassesByInstructor', () => {
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

      await liveClassService.schedule_live_class(
        'instructor-456',
        'course-456',
        futureDate.toISOString()
      );

      const classes = liveClassService.getLiveClassesByInstructor(instructorId);

      expect(classes).toHaveLength(2);
      expect(classes.every(c => c.instructorId === instructorId)).toBe(true);
    });
  });

  describe('cancelLiveClass', () => {
    it('should cancel a live class', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduled = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const cancelled = await liveClassService.cancelLiveClass(scheduled.id);

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.id).toBe(scheduled.id);
    });

    it('should throw error when cancelling non-existent class', async () => {
      await expect(
        liveClassService.cancelLiveClass('non-existent-id')
      ).rejects.toThrow('Live class not found');
    });
  });

  describe('updateStatus', () => {
    it('should update live class status', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const scheduled = await liveClassService.schedule_live_class(
        'instructor-123',
        'course-456',
        futureDate.toISOString()
      );

      const updated = liveClassService.updateStatus(scheduled.id, 'active');

      expect(updated.status).toBe('active');
    });

    it('should throw error when updating non-existent class', () => {
      expect(() => {
        liveClassService.updateStatus('non-existent-id', 'active');
      }).toThrow('Live class not found');
    });
  });
});

