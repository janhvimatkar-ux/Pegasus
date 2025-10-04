"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_service_1 = __importDefault(require("../services/class.service"));
const logger_1 = __importDefault(require("../utils/logger"));
const scheduleClass = async (req, res) => {
    try {
        const { instructorId, courseId, startTime } = req.body;
        if (!instructorId || !courseId || !startTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const newClass = await class_service_1.default.schedule_live_class(instructorId, courseId, new Date(startTime));
        return res.status(201).json(newClass);
    }
    catch (error) {
        logger_1.default.error('Error scheduling class:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.default = { scheduleClass };
//# sourceMappingURL=class.controller.js.map