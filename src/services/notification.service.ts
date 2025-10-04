import nodemailer from 'nodemailer';
import { createEvent, DateArray } from 'ics';
import config from '../config';
import logger from '../utils/logger';

interface CalendarEvent {
  title: string;
  startTime: Date;
  duration: number; // in minutes
  participants: string[];
  meetingUrl: string;
  courseId: string;
}

const transporter = nodemailer.createTransport(config.mail);

const sendCalendarInvite = async (event: CalendarEvent) => {
  const { title, startTime, duration, participants, meetingUrl, courseId } = event;

  const start = [
    startTime.getUTCFullYear(),
    startTime.getUTCMonth() + 1,
    startTime.getUTCDate(),
    startTime.getUTCHours(),
    startTime.getUTCMinutes(),
  ] as DateArray;

  const icsEvent = createEvent({
    title,
    start,
    duration: { minutes: duration },
    url: meetingUrl,
    description: `Live class for course ${courseId}`,
    location: meetingUrl,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: { name: 'EdTech Platform', email: 'noreply@edtech.com' },
    attendees: participants.map((email) => ({ email, rsvp: true })),
  });
  
  if (icsEvent.error) {
    throw icsEvent.error;
  }
  
  const mailOptions = {
    from: '"EdTech Platform" <noreply@edtech.com>',
    to: participants.join(','),
    subject: `Invitation: ${title}`,
    html: `You are invited to ${title}. Please find the event details attached.`,
    icalEvent: {
      filename: 'invite.ics',
      method: 'REQUEST',
      content: icsEvent.value,
    },
  };
  
  if (config.env !== 'test') {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Calendar invite sent: ${nodemailer.getTestMessageUrl(info)}`);
  } else {
    logger.info('Calendar invite would be sent in non-test environment');
  }
};

export default { sendCalendarInvite };
