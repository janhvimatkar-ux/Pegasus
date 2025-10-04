const { v4: uuidv4 } = require('uuid');

class LiveClass {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.instructorId = data.instructorId;
    this.courseId = data.courseId;
    this.startTime = data.startTime;
    this.duration = data.duration || 60; // Default 60 minutes
    this.zoomMeetingId = data.zoomMeetingId || null;
    this.zoomJoinUrl = data.zoomJoinUrl || null;
    this.zoomStartUrl = data.zoomStartUrl || null;
    this.status = data.status || 'scheduled'; // scheduled, active, completed, cancelled
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.instructorId) {
      errors.push('instructorId is required');
    }

    if (!this.courseId) {
      errors.push('courseId is required');
    }

    if (!this.startTime) {
      errors.push('startTime is required');
    } else {
      const startDate = new Date(this.startTime);
      if (isNaN(startDate.getTime())) {
        errors.push('startTime must be a valid date');
      } else if (startDate < new Date()) {
        errors.push('startTime must be in the future');
      }
    }

    if (this.duration && (this.duration < 15 || this.duration > 480)) {
      errors.push('duration must be between 15 and 480 minutes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      instructorId: this.instructorId,
      courseId: this.courseId,
      startTime: this.startTime,
      duration: this.duration,
      zoomMeetingId: this.zoomMeetingId,
      zoomJoinUrl: this.zoomJoinUrl,
      zoomStartUrl: this.zoomStartUrl,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = LiveClass;

