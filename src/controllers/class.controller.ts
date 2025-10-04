import { Request, Response } from 'express';
import classService from '../services/class.service';
import logger from '../utils/logger';

const scheduleClass = async (req: Request, res: Response) => {
  try {
    const { instructorId, courseId, startTime } = req.body;

    if (!instructorId || !courseId || !startTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newClass = await classService.schedule_live_class(
        instructorId,
        courseId,
        new Date(startTime)
    );

    return res.status(201).json(newClass);
  } catch (error) {
    logger.error('Error scheduling class:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default { scheduleClass };
