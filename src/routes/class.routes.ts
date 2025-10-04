import { Router } from 'express';
import classController from '../controllers/class.controller';

const router = Router();

router.post('/schedule', classController.scheduleClass);

export default router;
