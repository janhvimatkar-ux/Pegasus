import logger from '../utils/logger';
import config from '../config';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const generateZoomToken = () => {
  const payload = {
    iss: config.zoom.apiKey,
    exp: new Date().getTime() + 5000,
  };
  return jwt.sign(payload, config.zoom.apiSecret);
};

const createMeeting = async (
  instructorId: string,
  courseId: string,
  startTime: Date
) => {
  logger.info(
    `Creating zoom meeting for instructor ${instructorId} and course ${courseId} at ${startTime}`
  );

  const token = generateZoomToken();
  const url = `${config.zoom.apiBaseUrl}/users/me/meetings`;
  const payload = {
    topic: `Live class for ${courseId}`,
    type: 2, // Scheduled meeting
    start_time: startTime.toISOString(),
    duration: 60, // 60 minutes
    timezone: 'UTC',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      watermark: false,
      use_pmi: false,
      approval_type: 0, // Automatically approve
      audio: 'both',
      auto_recording: 'none',
    },
  };
  
  if (config.env !== 'test') {
    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return {
      meetingId: data.id,
      joinUrl: data.join_url,
      startUrl: data.start_url
    };
  }

  // Mocking the zoom api call for test environment
  return {
    meetingId: `zoom-${courseId}-${Date.now()}`,
    joinUrl: `https://mock.zoom.us/j/1234567890`,
    startUrl: `https://mock.zoom.us/s/1234567890`
  };
};

export default { createMeeting };
