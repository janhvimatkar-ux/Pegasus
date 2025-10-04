import request from 'supertest';
import app from '../../src/app';
import classService from '../../src/services/class.service';

jest.mock('../../src/services/class.service');

describe('Class Routes', () => {
  it('should schedule a class on POST /api/classes/schedule', async () => {
    const mockClass = {
      classId: 'class1',
      instructorId: 'inst1',
      courseId: 'course1',
      startTime: new Date(),
      meetingUrl: 'http://mock.zoom.us/j/123',
    };
    (classService.schedule_live_class as jest.Mock).mockResolvedValue(mockClass);

    const response = await request(app)
      .post('/api/classes/schedule')
      .send({
        instructorId: 'inst1',
        courseId: 'course1',
        startTime: '2025-10-28T10:00:00.000Z',
      });

    expect(response.status).toBe(201);
    expect(response.body.classId).toBe(mockClass.classId);
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/classes/schedule')
      .send({
        instructorId: 'inst1',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required fields');
  });
});
