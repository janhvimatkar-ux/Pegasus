"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
const { combine, timestamp, json, colorize, align, printf } = winston_1.default.format;
const logger = winston_1.default.createLogger({
    level: config_1.default.env === 'development' ? 'debug' : 'info',
    format: combine(colorize({ all: true }), timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }), align(), printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)),
    transports: [new winston_1.default.transports.Console()],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map