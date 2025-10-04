const logger = require('../utils/logger');
const config = require('../config');

class EmailService {
  constructor() {
    // Check if email is configured
    this.isConfigured = false; // Always use mock in development
    this.useMock = true;
  }

  /**
   * Send calendar invite to participants
   * @param {Object} liveClass - Live class instance
   * @param {Object} zoomMeeting - Zoom meeting details
   * @param {Array} participantEmails - Array of participant email addresses
   * @param {string} icsContent - iCalendar file content
   * @returns {Promise<Object>} Send result
   */
  async sendInviteToParticipants(liveClass, zoomMeeting, participantEmails, icsContent) {
    logger.info('Sending calendar invites', {
      classId: liveClass.id,
      recipients: participantEmails.length
    });

    if (this.useMock) {
      return this.sendMockInvite(liveClass, zoomMeeting, participantEmails, icsContent);
    }

    // Real email implementation would go here
    // For now, fallback to mock
    return this.sendMockInvite(liveClass, zoomMeeting, participantEmails, icsContent);
  }

  /**
   * Send mock calendar invite (for development)
   * @param {Object} liveClass - Live class instance
   * @param {Object} zoomMeeting - Zoom meeting details
   * @param {Array} participantEmails - Array of participant email addresses
   * @param {string} icsContent - iCalendar file content
   * @returns {Promise<Object>} Mock send result
   */
  async sendMockInvite(liveClass, zoomMeeting, participantEmails, icsContent) {
    logger.info('Using mock email service');

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const emailContent = this.buildEmailContent(liveClass, zoomMeeting);
    
    // Log the email that would be sent
    logger.info('Mock email generated', {
      to: participantEmails,
      subject: emailContent.subject,
      attachmentSize: icsContent.length
    });

    // In development, you can uncomment this to see the full email
    // logger.debug('Email body', { html: emailContent.html });
    // logger.debug('ICS content', { ics: icsContent });

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipients: participantEmails.length,
      emails: participantEmails,
      method: 'mock',
      message: 'Calendar invites logged (mock mode). Check logs for details.'
    };
  }

  /**
   * Build email content
   * @param {Object} liveClass - Live class instance
   * @param {Object} zoomMeeting - Zoom meeting details
   * @returns {Object} Email content with subject and html body
   */
  buildEmailContent(liveClass, zoomMeeting) {
    const joinUrl = zoomMeeting.join_url || zoomMeeting.joinUrl;
    const startUrl = zoomMeeting.start_url || zoomMeeting.startUrl;
    const password = zoomMeeting.password;
    const topic = zoomMeeting.topic || 'Live Class';
    
    const startDate = new Date(liveClass.startTime);
    const formattedDate = startDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    const subject = `Invitation: ${topic} - ${formattedDate}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .details { background: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .info-row { margin: 10px 0; }
    .label { font-weight: bold; color: #4F46E5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Live Class Invitation</h1>
    </div>
    
    <div class="content">
      <h2>You're invited to join a live class!</h2>
      
      <p>Hello!</p>
      
      <p>You have been invited to attend the following live class session:</p>
      
      <div class="details">
        <div class="info-row">
          <span class="label">Topic:</span> ${topic}
        </div>
        <div class="info-row">
          <span class="label">Date & Time:</span> ${formattedDate}
        </div>
        <div class="info-row">
          <span class="label">Duration:</span> ${liveClass.duration} minutes
        </div>
        <div class="info-row">
          <span class="label">Course:</span> ${liveClass.courseId}
        </div>
        ${password ? `<div class="info-row"><span class="label">Meeting Password:</span> ${password}</div>` : ''}
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${joinUrl}" class="button">🎥 Join Zoom Meeting</a>
      </p>
      
      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>⏰ Important:</strong> Please join the meeting 5 minutes before the scheduled start time.
      </div>
      
      <h3>Meeting Details</h3>
      <div class="details">
        <div class="info-row">
          <span class="label">Join URL:</span><br>
          <a href="${joinUrl}" style="color: #4F46E5; word-break: break-all;">${joinUrl}</a>
        </div>
        <div class="info-row">
          <span class="label">Meeting ID:</span> ${zoomMeeting.id}
        </div>
      </div>
      
      <p><strong>Calendar Invitation:</strong> A calendar invitation (.ics file) is attached to this email. Add it to your calendar to receive reminders.</p>
      
      <p>If you have any questions, please contact your instructor.</p>
      
      <p>See you in class! 🎓</p>
    </div>
    
    <div class="footer">
      <p>This is an automated message from Pegasus EdTech Platform.</p>
      <p>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `;

    return {
      subject,
      html,
      text: this.htmlToText(html)
    };
  }

  /**
   * Convert HTML to plain text (simple implementation)
   * @param {string} html - HTML content
   * @returns {string} Plain text
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gms, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new EmailService();

