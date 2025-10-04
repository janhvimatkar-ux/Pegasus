const express = require('express');
const liveClassController = require('../controllers/liveClassController');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'pegasus-edtech-platform'
  });
});

// Live class routes
router.post('/live-classes', liveClassController.scheduleClass);
router.get('/live-classes/:classId', liveClassController.getClass);
router.get('/courses/:courseId/live-classes', liveClassController.getClassesByCourse);
router.get('/instructors/:instructorId/live-classes', liveClassController.getClassesByInstructor);
router.delete('/live-classes/:classId', liveClassController.cancelClass);

// Webhook routes
router.post('/webhooks/zoom', webhookController.handleZoomWebhook);
router.get('/webhooks/events', webhookController.getWebhookEvents);
router.get('/webhooks/events/:eventId', webhookController.getWebhookEvent);

module.exports = router;

