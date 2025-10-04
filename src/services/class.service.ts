import logger from '../utils/logger';
import zoomService from './zoom.service';

interface LiveClass {
  classId: string;
  instructorId: string;
  courseId: string;
  startTime: Date;
  meetingUrl: string;
}

const schedule_live_class = async (
  instructorId: string,
  courseId: string,
  startTime: Date
): Promise<LiveClass> => {
  logger.info(
    `Scheduling live class for instructor ${instructorId}, course ${courseId} at ${startTime}`
  );

  const meetingDetails = await zoomService.createMeeting(
    instructorId,
    courseId,
    startTime
  );

  const newClass: LiveClass = {
    classId: `class-${courseId}-${Date.now()}`,
    instructorId,
    courseId,
    startTime,
    meetingUrl: meetingDetails.joinUrl,
  };

  logger.info(`Successfully scheduled class ${newClass.classId}`);
  return newClass;
};

export default { schedule_live_class };
