"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const createMeeting = async (instructorId, courseId, startTime) => {
    logger_1.default.info(`Creating zoom meeting for instructor ${instructorId} and course ${courseId} at ${startTime}`);
    // Mocking the zoom api call
    return {
        meetingId: `zoom-${courseId}-${Date.now()}`,
        joinUrl: `https://zoom.us/j/1234567890`,
    };
};
exports.default = { createMeeting };
//# sourceMappingURL=zoom.service.js.map