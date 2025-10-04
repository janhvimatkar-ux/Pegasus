import logger from "../utils/logger";

const createMeeting = async (instructorId: string, courseId: string, startTime: Date) => {
    logger.info(`Creating zoom meeting for instructor ${instructorId} and course ${courseId} at ${startTime}`);
    // Mocking the zoom api call
    return {
        meetingId: `zoom-${courseId}-${Date.now()}`,
        joinUrl: `https://zoom.us/j/1234567890`,
    }
};

export default { createMeeting };
