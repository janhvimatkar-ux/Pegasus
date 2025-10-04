"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const server = app_1.default.listen(config_1.default.port, () => {
    logger_1.default.info(`Server is running on port ${config_1.default.port}`);
});
exports.default = server;
//# sourceMappingURL=server.js.map