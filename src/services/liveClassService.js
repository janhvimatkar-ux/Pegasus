const LiveClass = require('../models/LiveClass');
const zoomService = require('./zoomService');
const logger = require('../utils/logger');

class LiveClassService {
  constructor() {
    // In-memory storage for development (replace with database in production)
    this.liveClasses = new Map();
  }

  /**
   * Schedule a live class
   * @param {string} instructorId - Instructor's unique identifier
   * @param {string} courseId - Course unique identifier
   * @param {string} startTime - ISO 8601 formatted start time
   * @param {Object} options - Additional options (duration, topic, etc.)
   * @returns {Promise<LiveClass>} Scheduled live class
   */
  async schedule_live_class(instructorId, courseId, startTime, options = {}) {
    logger.info('Scheduling live class', { instructorId, courseId, startTime, options });

    try {
      // Create LiveClass instance
      const liveClass = new LiveClass({
        instructorId,
        courseId,
        startTime,
        duration: options.duration || 60
      });

      // Validate input
      const validation = liveClass.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create Zoom meeting
      const zoomMeeting = await zoomService.createMeeting({
        instructorId,
        topic: options.topic || `${courseId} - Live Class`,
        start_time: startTime,
        duration: liveClass.duration,
        timezone: options.timezone || 'UTC'
      });

      // Update live class with Zoom details
      liveClass.zoomMeetingId = zoomMeeting.id.toString();
      liveClass.zoomJoinUrl = zoomMeeting.join_url;
      liveClass.zoomStartUrl = zoomMeeting.start_url;

      // Store in memory (replace with DB persistence)
      this.liveClasses.set(liveClass.id, liveClass);

      logger.logServiceCall('LiveClassService', 'schedule_live_class', 
        { instructorId, courseId, startTime }, 
        liveClass.toJSON()
      );

      return liveClass;
    } catch (error) {
      logger.logError(error, { 
        service: 'LiveClassService', 
        method: 'schedule_live_class',
        instructorId,
        courseId,
        startTime
      });
      throw error;
    }
  }

  /**
   * Get a live class by ID
   * @param {string} classId - Live class ID
   * @returns {LiveClass|null} Live class or null if not found
   */
  getLiveClass(classId) {
    return this.liveClasses.get(classId) || null;
  }

  /**
   * Get all live classes for a course
   * @param {string} courseId - Course ID
   * @returns {Array<LiveClass>} Array of live classes
   */
  getLiveClassesByCourse(courseId) {
    return Array.from(this.liveClasses.values())
      .filter(lc => lc.courseId === courseId);
  }

  /**
   * Get all live classes for an instructor
   * @param {string} instructorId - Instructor ID
   * @returns {Array<LiveClass>} Array of live classes
   */
  getLiveClassesByInstructor(instructorId) {
    return Array.from(this.liveClasses.values())
      .filter(lc => lc.instructorId === instructorId);
  }

  /**
   * Cancel a live class
   * @param {string} classId - Live class ID
   * @returns {Promise<LiveClass>} Cancelled live class
   */
  async cancelLiveClass(classId) {
    logger.info('Cancelling live class', { classId });

    const liveClass = this.getLiveClass(classId);
    if (!liveClass) {
      throw new Error(`Live class not found: ${classId}`);
    }

    try {
      // Delete Zoom meeting
      if (liveClass.zoomMeetingId) {
        await zoomService.deleteMeeting(liveClass.zoomMeetingId);
      }

      // Update status
      liveClass.status = 'cancelled';
      liveClass.updatedAt = new Date().toISOString();

      logger.info('Live class cancelled', { classId });
      return liveClass;
    } catch (error) {
      logger.logError(error, { 
        service: 'LiveClassService', 
        method: 'cancelLiveClass',
        classId
      });
      throw error;
    }
  }

  /**
   * Update live class status
   * @param {string} classId - Live class ID
   * @param {string} status - New status
   * @returns {LiveClass} Updated live class
   */
  updateStatus(classId, status) {
    const liveClass = this.getLiveClass(classId);
    if (!liveClass) {
      throw new Error(`Live class not found: ${classId}`);
    }

    liveClass.status = status;
    liveClass.updatedAt = new Date().toISOString();

    logger.info('Live class status updated', { classId, status });
    return liveClass;
  }

  /**
   * Clear all live classes (for testing)
   */
  clearAll() {
    this.liveClasses.clear();
  }
}

module.exports = new LiveClassService();

