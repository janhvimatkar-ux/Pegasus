const LiveClass = require('../models/LiveClass');
const zoomService = require('./zoomService');
const calendarService = require('./calendarService');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class LiveClassService {
  constructor() {
    // In-memory storage for development (replace with database in production)
    this.liveClasses = new Map();
  }

  /**
   * Schedule a live class with Zoom meeting and calendar invites
   * @param {string} instructorId - Instructor's unique identifier
   * @param {string} courseId - Course unique identifier
   * @param {string} startTime - ISO 8601 formatted start time
   * @param {Object} options - Additional options
   * @param {number} options.duration - Duration in minutes
   * @param {string} options.topic - Meeting topic
   * @param {string} options.timezone - Timezone
   * @param {Array} options.participants - Array of participant objects {name, email, role}
   * @param {boolean} options.sendCalendarInvite - Whether to send calendar invites (default: true)
   * @returns {Promise<Object>} Scheduled live class with invitation results
   */
  async schedule_live_class(instructorId, courseId, startTime, options = {}) {
    logger.info('Scheduling live class', { 
      instructorId, 
      courseId, 
      startTime, 
      participants: options.participants?.length || 0
    });

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

      // Step 1: Create Zoom meeting with proper request payload
      logger.info('Step 1: Creating Zoom meeting', { instructorId, courseId });
      const zoomMeeting = await zoomService.createMeeting({
        instructorId,
        topic: options.topic || `${courseId} - Live Class`,
        start_time: startTime,
        duration: liveClass.duration,
        timezone: options.timezone || 'UTC'
      });

      // Step 2: Update live class with Zoom meeting details
      logger.info('Step 2: Updating live class with Zoom details', { 
        meetingId: zoomMeeting.id 
      });
      
      liveClass.zoomMeetingId = zoomMeeting.id.toString();
      liveClass.zoomJoinUrl = zoomMeeting.join_url;
      liveClass.zoomStartUrl = zoomMeeting.start_url;

      // Store in memory (replace with DB persistence)
      this.liveClasses.set(liveClass.id, liveClass);

      // Step 3: Send calendar invites to participants (if enabled)
      let invitationResult = null;
      const sendInvites = options.sendCalendarInvite !== false;
      
      if (sendInvites && options.participants && options.participants.length > 0) {
        logger.info('Step 3: Sending calendar invites', { 
          participantCount: options.participants.length 
        });
        
        try {
          invitationResult = await this.sendCalendarInvites(
            liveClass, 
            zoomMeeting, 
            options.participants
          );
          
          logger.info('Calendar invites sent successfully', {
            classId: liveClass.id,
            recipients: invitationResult.recipients
          });
        } catch (inviteError) {
          // Log error but don't fail the whole operation
          logger.logError(inviteError, {
            service: 'LiveClassService',
            method: 'schedule_live_class',
            step: 'sendCalendarInvites',
            classId: liveClass.id
          });
          
          invitationResult = {
            success: false,
            error: inviteError.message,
            message: 'Class scheduled but calendar invites failed to send'
          };
        }
      } else {
        logger.info('Step 3: Skipping calendar invites', { 
          sendInvites, 
          participantsProvided: !!options.participants 
        });
      }

      // Prepare comprehensive response
      const response = {
        liveClass: liveClass,
        zoomMeeting: {
          id: zoomMeeting.id,
          topic: zoomMeeting.topic || options.topic || `${courseId} - Live Class`,
          startTime: zoomMeeting.start_time,
          duration: zoomMeeting.duration,
          joinUrl: zoomMeeting.join_url,
          startUrl: zoomMeeting.start_url,
          password: zoomMeeting.password
        },
        invitations: invitationResult
      };

      logger.logServiceCall('LiveClassService', 'schedule_live_class', 
        { instructorId, courseId, startTime }, 
        { 
          classId: liveClass.id,
          meetingId: zoomMeeting.id,
          invitesSent: !!invitationResult
        }
      );

      return response;
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
   * Send calendar invites to participants
   * @param {LiveClass} liveClass - Live class instance
   * @param {Object} zoomMeeting - Zoom meeting details
   * @param {Array} participants - Array of participant objects
   * @returns {Promise<Object>} Invitation send result
   */
  async sendCalendarInvites(liveClass, zoomMeeting, participants) {
    logger.info('Generating calendar invites', { 
      classId: liveClass.id,
      participantCount: participants.length 
    });

    // Create calendar event
    const calendarEvent = calendarService.createEventFromLiveClass(
      liveClass,
      zoomMeeting,
      participants
    );

    // Generate .ics file content
    const icsContent = calendarService.generateICS(calendarEvent);

    // Extract participant emails
    const participantEmails = participants.map(p => p.email);

    // Send email with calendar attachment
    const emailResult = await emailService.sendInviteToParticipants(
      liveClass,
      zoomMeeting,
      participantEmails,
      icsContent
    );

    return emailResult;
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

