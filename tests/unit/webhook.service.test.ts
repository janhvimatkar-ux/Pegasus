import webhookService from '../../src/services/webhook.service';
import logger from '../../src/utils/logger';

jest.mock('../../src/utils/logger');

describe('Webhook Service', () => {
  it('should process a meeting.updated event', async () => {
    const event = {
      event: 'meeting.updated',
      payload: { object: { id: '123', topic: 'Test Meeting', start_time: new Date().toISOString() } },
    };
    const eventId = 'uniqueEventId1';
    await webhookService.processZoomEvent(event, eventId);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Meeting 123 (Test Meeting) was updated.'));
  });

  it('should process a meeting.deleted event', async () => {
    const event = {
      event: 'meeting.deleted',
      payload: { object: { id: '456' } },
    };
    const eventId = 'uniqueEventId2';
    await webhookService.processZoomEvent(event, eventId);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Meeting 456 was deleted.'));
  });

  it('should not process the same event twice', async () => {
    const event = {
      event: 'meeting.updated',
      payload: { object: { id: '789' } },
    };
    const eventId = 'uniqueEventId3';

    await webhookService.processZoomEvent(event, eventId);
    await expect(webhookService.processZoomEvent(event, eventId)).rejects.toThrow('Event already processed');
  });

  it('should handle unknown event types', async () => {
    const event = { event: 'unknown.event' };
    const eventId = 'uniqueEventId4';
    await webhookService.processZoomEvent(event, eventId);
    expect(logger.warn).toHaveBeenCalledWith('Unhandled event type: unknown.event');
  });
});
