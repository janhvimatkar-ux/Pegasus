const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class ZoomService {
  constructor() {
    this.apiKey = config.zoom.apiKey;
    this.apiSecret = config.zoom.apiSecret;
    this.baseUrl = config.zoom.apiBaseUrl;
    this.useMock = !this.apiKey || config.env === 'development';
  }

  /**
   * Generate mock Zoom meeting data
   * @param {Object} params - Meeting parameters
   * @returns {Object} Mock meeting data
   */
  generateMockMeeting(params) {
    const meetingId = Math.floor(Math.random() * 1000000000);
    const password = Math.random().toString(36).substring(7);
    
    return {
      id: meetingId,
      host_id: params.instructorId,
      topic: params.topic || 'Live Class',
      type: 2, // Scheduled meeting
      start_time: params.start_time,
      duration: params.duration,
      timezone: params.timezone || 'UTC',
      status: 'waiting',
      join_url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
      start_url: `https://zoom.us/s/${meetingId}?zak=mock_zak_token`,
      password: password,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: 'both',
        auto_recording: 'cloud'
      }
    };
  }

  /**
   * Create a Zoom meeting
   * @param {Object} params - Meeting parameters
   * @returns {Promise<Object>} Meeting details
   */
  async createMeeting(params) {
    logger.info('Creating Zoom meeting', { params, useMock: this.useMock });

    // Use mock data in development or when API key is not configured
    if (this.useMock) {
      logger.info('Using mock Zoom API data');
      const mockMeeting = this.generateMockMeeting(params);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      logger.info('Mock Zoom meeting created', { meetingId: mockMeeting.id });
      return mockMeeting;
    }

    try {
      // Real Zoom API call
      const response = await axios.post(
        `${this.baseUrl}/users/me/meetings`,
        {
          topic: params.topic,
          type: 2, // Scheduled meeting
          start_time: params.start_time,
          duration: params.duration,
          timezone: params.timezone || 'UTC',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            audio: 'both',
            auto_recording: 'cloud'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Zoom meeting created', { meetingId: response.data.id });
      return response.data;
    } catch (error) {
      logger.logError(error, { service: 'ZoomService', method: 'createMeeting' });
      throw new Error(`Failed to create Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Get Zoom meeting details
   * @param {string} meetingId - Zoom meeting ID
   * @returns {Promise<Object>} Meeting details
   */
  async getMeeting(meetingId) {
    logger.info('Getting Zoom meeting', { meetingId, useMock: this.useMock });

    if (this.useMock) {
      return {
        id: meetingId,
        topic: 'Live Class',
        status: 'waiting',
        start_time: new Date().toISOString(),
        duration: 60
      };
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.logError(error, { service: 'ZoomService', method: 'getMeeting' });
      throw new Error(`Failed to get Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Delete a Zoom meeting
   * @param {string} meetingId - Zoom meeting ID
   * @returns {Promise<void>}
   */
  async deleteMeeting(meetingId) {
    logger.info('Deleting Zoom meeting', { meetingId, useMock: this.useMock });

    if (this.useMock) {
      return { success: true };
    }

    try {
      await axios.delete(
        `${this.baseUrl}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${await this.getAccessToken()}`
          }
        }
      );

      logger.info('Zoom meeting deleted', { meetingId });
    } catch (error) {
      logger.logError(error, { service: 'ZoomService', method: 'deleteMeeting' });
      throw new Error(`Failed to delete Zoom meeting: ${error.message}`);
    }
  }

  /**
   * Get Zoom OAuth access token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // In production, implement proper OAuth flow
    // For now, return a mock token or use Server-to-Server OAuth
    if (this.useMock) {
      return 'mock_access_token';
    }

    // Implement actual OAuth token retrieval here
    throw new Error('OAuth token retrieval not implemented. Please configure Zoom OAuth.');
  }
}

module.exports = new ZoomService();

