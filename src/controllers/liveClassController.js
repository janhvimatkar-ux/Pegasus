const liveClassService = require('../services/liveClassService');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schemas
const scheduleClassSchema = Joi.object({
  instructorId: Joi.string().required(),
  courseId: Joi.string().required(),
  startTime: Joi.date().iso().greater('now').required(),
  duration: Joi.number().min(15).max(480).optional(),
  topic: Joi.string().optional(),
  timezone: Joi.string().optional()
});

const classIdSchema = Joi.object({
  classId: Joi.string().required()
});

/**
 * Schedule a new live class
 */
async function scheduleClass(req, res) {
  const startTime = Date.now();

  try {
    // Validate request body
    const { error, value } = scheduleClassSchema.validate(req.body);
    if (error) {
      logger.warn('Validation error', { errors: error.details });
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { instructorId, courseId, startTime: classStartTime, ...options } = value;

    // Schedule the class
    const liveClass = await liveClassService.schedule_live_class(
      instructorId,
      courseId,
      classStartTime,
      options
    );

    logger.logRequest(req, 201, Date.now() - startTime);

    res.status(201).json({
      success: true,
      data: liveClass.toJSON()
    });
  } catch (error) {
    logger.logError(error, { 
      controller: 'liveClassController', 
      method: 'scheduleClass',
      body: req.body 
    });

    logger.logRequest(req, 500, Date.now() - startTime);

    res.status(500).json({
      success: false,
      error: 'Failed to schedule live class',
      message: error.message
    });
  }
}

/**
 * Get a live class by ID
 */
function getClass(req, res) {
  const startTime = Date.now();

  try {
    const { error, value } = classIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const liveClass = liveClassService.getLiveClass(value.classId);

    if (!liveClass) {
      logger.logRequest(req, 404, Date.now() - startTime);
      return res.status(404).json({
        success: false,
        error: 'Live class not found'
      });
    }

    logger.logRequest(req, 200, Date.now() - startTime);

    res.json({
      success: true,
      data: liveClass.toJSON()
    });
  } catch (error) {
    logger.logError(error, { 
      controller: 'liveClassController', 
      method: 'getClass' 
    });

    logger.logRequest(req, 500, Date.now() - startTime);

    res.status(500).json({
      success: false,
      error: 'Failed to get live class',
      message: error.message
    });
  }
}

/**
 * Get all live classes for a course
 */
function getClassesByCourse(req, res) {
  const startTime = Date.now();

  try {
    const { courseId } = req.params;
    const liveClasses = liveClassService.getLiveClassesByCourse(courseId);

    logger.logRequest(req, 200, Date.now() - startTime);

    res.json({
      success: true,
      data: liveClasses.map(lc => lc.toJSON()),
      count: liveClasses.length
    });
  } catch (error) {
    logger.logError(error, { 
      controller: 'liveClassController', 
      method: 'getClassesByCourse' 
    });

    logger.logRequest(req, 500, Date.now() - startTime);

    res.status(500).json({
      success: false,
      error: 'Failed to get live classes',
      message: error.message
    });
  }
}

/**
 * Get all live classes for an instructor
 */
function getClassesByInstructor(req, res) {
  const startTime = Date.now();

  try {
    const { instructorId } = req.params;
    const liveClasses = liveClassService.getLiveClassesByInstructor(instructorId);

    logger.logRequest(req, 200, Date.now() - startTime);

    res.json({
      success: true,
      data: liveClasses.map(lc => lc.toJSON()),
      count: liveClasses.length
    });
  } catch (error) {
    logger.logError(error, { 
      controller: 'liveClassController', 
      method: 'getClassesByInstructor' 
    });

    logger.logRequest(req, 500, Date.now() - startTime);

    res.status(500).json({
      success: false,
      error: 'Failed to get live classes',
      message: error.message
    });
  }
}

/**
 * Cancel a live class
 */
async function cancelClass(req, res) {
  const startTime = Date.now();

  try {
    const { error, value } = classIdSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const liveClass = await liveClassService.cancelLiveClass(value.classId);

    logger.logRequest(req, 200, Date.now() - startTime);

    res.json({
      success: true,
      data: liveClass.toJSON(),
      message: 'Live class cancelled successfully'
    });
  } catch (error) {
    logger.logError(error, { 
      controller: 'liveClassController', 
      method: 'cancelClass' 
    });

    const statusCode = error.message.includes('not found') ? 404 : 500;
    logger.logRequest(req, statusCode, Date.now() - startTime);

    res.status(statusCode).json({
      success: false,
      error: 'Failed to cancel live class',
      message: error.message
    });
  }
}

module.exports = {
  scheduleClass,
  getClass,
  getClassesByCourse,
  getClassesByInstructor,
  cancelClass
};

