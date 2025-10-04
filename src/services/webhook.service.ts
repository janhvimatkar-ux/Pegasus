import logger from '../utils/logger';

// A simple in-memory cache to track processed event IDs for idempotency.
// In a production environment, a persistent cache like Redis would be more suitable.
const processedEvents = new Set<string>();

const processZoomEvent = async (event: any, eventId: string) => {
  if (processedEvents.has(eventId)) {
    logger.info(`Event ${eventId} already processed. Skipping.`);
    throw new Error('Event already processed');
  }

  logger.info(`Processing event ${eventId} of type ${event.event}`);

  switch (event.event) {
    case 'meeting.updated':
      await handleMeetingUpdated(event.payload);
      break;
    case 'meeting.deleted':
      await handleMeetingDeleted(event.payload);
      break;
    default:
      logger.warn(`Unhandled event type: ${event.event}`);
  }

  processedEvents.add(eventId);
  logger.info(`Successfully applied changes for event ${eventId}`);
};

const handleMeetingUpdated = async (payload: any) => {
  const { id, topic, start_time } = payload.object;
  logger.info(`Meeting ${id} (${topic}) was updated. New start time: ${start_time}`);
  // Here you would add logic to update the meeting in your database
  // and potentially send updated calendar invites to participants.
};

const handleMeetingDeleted = async (payload: any) => {
  const { id } = payload.object;
  logger.info(`Meeting ${id} was deleted.`);
  // Here you would add logic to cancel the meeting in your database
  // and send cancellation notifications to participants.
};

export default { processZoomEvent };
