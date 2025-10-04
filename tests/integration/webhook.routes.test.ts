import request from 'supertest';
import app from '../../src/app';
import webhookService from '../../src/services/webhook.service';

jest.mock('../../src/services/webhook.service');

describe('Webhook Routes', () => {
  it('should process a zoom webhook on POST /api/webhooks/zoom', async () => {
    const event = { event: 'meeting.updated', payload: {} };
    const eventId = 'eventId123';
    (webhookService.processZoomEvent as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .post('/api/webhooks/zoom')
      .set('x-zm-request-id', eventId)
      .send(event);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Webhook processed successfully');
    expect(webhookService.processZoomEvent).toHaveBeenCalledWith(event, eventId);
  });

  it('should return 200 for already processed events', async () => {
    const event = { event: 'meeting.updated', payload: {} };
    const eventId = 'eventId456';
    (webhookService.processZoomEvent as jest.Mock).mockRejectedValue(new Error('Event already processed'));

    const response = await request(app)
      .post('/api/webhooks/zoom')
      .set('x-zm-request-id', eventId)
      .send(event);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Event already processed');
  });

  it('should return 400 if event ID is missing', async () => {
    const response = await request(app)
      .post('/api/webhooks/zoom')
      .send({ event: 'meeting.updated' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Missing event ID');
  });
});
