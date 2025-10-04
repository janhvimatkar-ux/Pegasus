"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/classes', class_routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
exports.default = app;
//# sourceMappingURL=app.js.map