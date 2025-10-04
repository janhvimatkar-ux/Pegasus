"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const class_service_1 = __importDefault(require("../../src/services/class.service"));
jest.mock('../../src/services/class.service');
describe('Class Routes', () => {
    it('should schedule a class on POST /api/classes/schedule', async () => {
        const mockClass = {
            classId: 'class1',
            instructorId: 'inst1',
            courseId: 'course1',
            startTime: new Date(),
            meetingUrl: 'http://mock.zoom.us/j/123',
        };
        class_service_1.default.schedule_live_class.mockResolvedValue(mockClass);
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/classes/schedule')
            .send({
            instructorId: 'inst1',
            courseId: 'course1',
            startTime: '2025-10-28T10:00:00.000Z',
        });
        expect(response.status).toBe(201);
        expect(response.body.classId).toBe(mockClass.classId);
    });
    it('should return 400 if required fields are missing', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/classes/schedule')
            .send({
            instructorId: 'inst1',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Missing required fields');
    });
});
//# sourceMappingURL=class.routes.test.js.map