const express = require('express');
const liveClassController = require('../controllers/liveClassController');

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

module.exports = router;

