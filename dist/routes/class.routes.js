"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = __importDefault(require("../controllers/class.controller"));
const router = (0, express_1.Router)();
router.post('/schedule', class_controller_1.default.scheduleClass);
exports.default = router;
//# sourceMappingURL=class.routes.js.map