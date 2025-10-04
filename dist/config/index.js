"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    zoom: {
        apiKey: process.env.ZOOM_API_KEY || 'mock_zoom_api_key',
        apiSecret: process.env.ZOOM_API_SECRET || 'mock_zoom_api_secret',
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map