"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const zoom_service_1 = __importDefault(require("./zoom.service"));
const schedule_live_class = async (instructorId, courseId, startTime) => {
    logger_1.default.info(`Scheduling live class for instructor ${instructorId}, course ${courseId} at ${startTime}`);
    const meetingDetails = await zoom_service_1.default.createMeeting(instructorId, courseId, startTime);
    const newClass = {
        classId: `class-${courseId}-${Date.now()}`,
        instructorId,
        courseId,
        startTime,
        meetingUrl: meetingDetails.joinUrl,
    };
    logger_1.default.info(`Successfully scheduled class ${newClass.classId}`);
    return newClass;
};
exports.default = { schedule_live_class };
//# sourceMappingURL=class.service.js.map