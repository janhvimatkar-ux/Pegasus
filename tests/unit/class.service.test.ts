import classService from '../../src/services/class.service';
import zoomService from '../../src/services/zoom.service';
import notificationService from '../../src/services/notification.service';

jest.mock('../../src/services/zoom.service');
jest.mock('../../src/services/notification.service');

describe('Class Service', () => {
  it('should schedule a live class and send calendar invites', async () => {
    const mockMeetingDetails = {
      meetingId: 'mockMeetingId',
      joinUrl: 'http://mock.zoom.us/j/123',
    };
    (zoomService.createMeeting as jest.Mock).mockResolvedValue(
      mockMeetingDetails
    );

    const instructorId = 'inst1';
    const courseId = 'course1';
    const startTime = new Date();
    const participants = ['test@example.com'];

    const result = await classService.schedule_live_class(
      instructorId,
      courseId,
      startTime,
      participants
    );

    expect(zoomService.createMeeting).toHaveBeenCalledWith(
      instructorId,
      courseId,
      startTime
    );
    expect(notificationService.sendCalendarInvite).toHaveBeenCalledWith({
      title: `Live class for ${courseId}`,
      startTime,
      duration: 60,
      participants,
      meetingUrl: mockMeetingDetails.joinUrl,
      courseId,
    });
    expect(result).toHaveProperty('classId');
    expect(result.instructorId).toBe(instructorId);
    expect(result.courseId).toBe(courseId);
    expect(result.startTime).toBe(startTime);
    expect(result.meetingUrl).toBe(mockMeetingDetails.joinUrl);
  });
});
