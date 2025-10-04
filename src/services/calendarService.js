const logger = require('../utils/logger');

class CalendarService {
  /**
   * Create a calendar event from a live class
   * @param {Object} liveClass - Live class instance
   * @param {Object} zoomMeeting - Zoom meeting details
   * @param {Array} participants - Array of participants
   * @returns {Object} Calendar event object
   */
  createEventFromLiveClass(liveClass, zoomMeeting, participants = []) {
    const startTime = new Date(liveClass.startTime);
    const endTime = new Date(startTime.getTime() + liveClass.duration * 60000);

    return {
      uid: `live-class-${liveClass.id}@pegasus-edtech.com`,
      title: zoomMeeting.topic || 'Live Class',
      description: this.buildDescription(liveClass, zoomMeeting),
      location: zoomMeeting.join_url || zoomMeeting.joinUrl,
      startTime: startTime,
      endTime: endTime,
      organizer: {
        name: 'Pegasus EdTech',
        email: 'noreply@pegasus-edtech.com'
      },
      attendees: participants.map(p => ({
        name: p.name,
        email: p.email,
        role: p.role || 'student'
      }))
    };
  }

  /**
   * Build event description with Zoom details
   * @param {Object} liveClass - Live class instance
   * @param {Object} zoomMeeting - Zoom meeting details
   * @returns {string} Event description
   */
  buildDescription(liveClass, zoomMeeting) {
    const joinUrl = zoomMeeting.join_url || zoomMeeting.joinUrl;
    const password = zoomMeeting.password;
    
    let description = `Live class session for course ${liveClass.courseId}\\n\\n`;
    description += `Join Zoom Meeting:\\n${joinUrl}\\n\\n`;
    
    if (password) {
      description += `Meeting Password: ${password}\\n\\n`;
    }
    
    description += `Meeting ID: ${zoomMeeting.id}\\n`;
    description += `Duration: ${liveClass.duration} minutes`;
    
    return description;
  }

  /**
   * Generate iCalendar (.ics) file content
   * @param {Object} event - Calendar event object
   * @returns {string} iCalendar format string
   */
  generateICS(event) {
    logger.info('Generating iCalendar file', { eventId: event.uid });

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const now = formatDate(new Date());
    const start = formatDate(event.startTime);
    const end = formatDate(event.endTime);

    // Escape special characters for iCalendar format
    const escape = (str) => {
      return str.replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/\n/g, '\\n');
    };

    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//Pegasus EdTech//Live Class Scheduler//EN\r\n';
    ics += 'CALSCALE:GREGORIAN\r\n';
    ics += 'METHOD:REQUEST\r\n';
    
    ics += 'BEGIN:VEVENT\r\n';
    ics += `UID:${event.uid}\r\n`;
    ics += `DTSTAMP:${now}\r\n`;
    ics += `DTSTART:${start}\r\n`;
    ics += `DTEND:${end}\r\n`;
    ics += `SUMMARY:${escape(event.title)}\r\n`;
    ics += `DESCRIPTION:${escape(event.description)}\r\n`;
    ics += `LOCATION:${escape(event.location)}\r\n`;
    ics += `ORGANIZER;CN=${escape(event.organizer.name)}:mailto:${event.organizer.email}\r\n`;
    
    // Add attendees
    event.attendees.forEach(attendee => {
      ics += `ATTENDEE;CN=${escape(attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendee.email}\r\n`;
    });
    
    ics += 'STATUS:CONFIRMED\r\n';
    ics += 'SEQUENCE:0\r\n';
    ics += 'BEGIN:VALARM\r\n';
    ics += 'TRIGGER:-PT15M\r\n';
    ics += 'ACTION:DISPLAY\r\n';
    ics += 'DESCRIPTION:Reminder: Live class starts in 15 minutes\r\n';
    ics += 'END:VALARM\r\n';
    ics += 'END:VEVENT\r\n';
    
    ics += 'END:VCALENDAR\r\n';

    logger.info('iCalendar file generated successfully', { 
      eventId: event.uid,
      attendees: event.attendees.length 
    });

    return ics;
  }
}

module.exports = new CalendarService();

