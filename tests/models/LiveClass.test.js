const LiveClass = require('../../src/models/LiveClass');

describe('LiveClass Model', () => {
  describe('constructor', () => {
    it('should create a LiveClass instance with required fields', () => {
      const data = {
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: '2025-12-31T10:00:00Z'
      };

      const liveClass = new LiveClass(data);

      expect(liveClass.instructorId).toBe(data.instructorId);
      expect(liveClass.courseId).toBe(data.courseId);
      expect(liveClass.startTime).toBe(data.startTime);
      expect(liveClass.duration).toBe(60); // default
      expect(liveClass.status).toBe('scheduled'); // default
      expect(liveClass.id).toBeDefined();
    });

    it('should create a LiveClass instance with custom duration', () => {
      const data = {
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: '2025-12-31T10:00:00Z',
        duration: 90
      };

      const liveClass = new LiveClass(data);

      expect(liveClass.duration).toBe(90);
    });
  });

  describe('validate', () => {
    it('should validate a correct LiveClass', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const liveClass = new LiveClass({
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: futureDate.toISOString()
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation when instructorId is missing', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const liveClass = new LiveClass({
        courseId: 'course-456',
        startTime: futureDate.toISOString()
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('instructorId is required');
    });

    it('should fail validation when courseId is missing', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const liveClass = new LiveClass({
        instructorId: 'instructor-123',
        startTime: futureDate.toISOString()
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('courseId is required');
    });

    it('should fail validation when startTime is missing', () => {
      const liveClass = new LiveClass({
        instructorId: 'instructor-123',
        courseId: 'course-456'
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('startTime is required');
    });

    it('should fail validation when startTime is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);

      const liveClass = new LiveClass({
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: pastDate.toISOString()
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('startTime must be in the future');
    });

    it('should fail validation when duration is too short', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const liveClass = new LiveClass({
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: futureDate.toISOString(),
        duration: 10
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('duration must be between 15 and 480 minutes');
    });

    it('should fail validation when duration is too long', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const liveClass = new LiveClass({
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: futureDate.toISOString(),
        duration: 500
      });

      const validation = liveClass.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('duration must be between 15 and 480 minutes');
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the LiveClass', () => {
      const data = {
        instructorId: 'instructor-123',
        courseId: 'course-456',
        startTime: '2025-12-31T10:00:00Z',
        duration: 90
      };

      const liveClass = new LiveClass(data);
      const json = liveClass.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('instructorId', data.instructorId);
      expect(json).toHaveProperty('courseId', data.courseId);
      expect(json).toHaveProperty('startTime', data.startTime);
      expect(json).toHaveProperty('duration', data.duration);
      expect(json).toHaveProperty('status', 'scheduled');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
  });
});

