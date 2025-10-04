"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_service_1 = __importDefault(require("../../src/services/class.service"));
const zoom_service_1 = __importDefault(require("../../src/services/zoom.service"));
jest.mock('../../src/services/zoom.service');
describe('Class Service', () => {
    it('should schedule a live class', async () => {
        const mockMeetingDetails = {
            meetingId: 'mockMeetingId',
            joinUrl: 'http://mock.zoom.us/j/123',
        };
        zoom_service_1.default.createMeeting.mockResolvedValue(mockMeetingDetails);
        const instructorId = 'inst1';
        const courseId = 'course1';
        const startTime = new Date();
        const result = await class_service_1.default.schedule_live_class(instructorId, courseId, startTime);
        expect(zoom_service_1.default.createMeeting).toHaveBeenCalledWith(instructorId, courseId, startTime);
        expect(result).toHaveProperty('classId');
        expect(result.instructorId).toBe(instructorId);
        expect(result.courseId).toBe(courseId);
        expect(result.startTime).toBe(startTime);
        expect(result.meetingUrl).toBe(mockMeetingDetails.joinUrl);
    });
});
//# sourceMappingURL=class.service.test.js.map