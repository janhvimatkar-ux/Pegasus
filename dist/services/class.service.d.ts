interface LiveClass {
    classId: string;
    instructorId: string;
    courseId: string;
    startTime: Date;
    meetingUrl: string;
}
declare const _default: {
    schedule_live_class: (instructorId: string, courseId: string, startTime: Date) => Promise<LiveClass>;
};
export default _default;
//# sourceMappingURL=class.service.d.ts.map