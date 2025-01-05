"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./libraries/log/logger"));
const index_1 = __importDefault(require("./domains/index"));
const package_json_1 = __importDefault(require("../package.json"));
function formatUptime(uptime) {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
function defineRoutes(expressApp) {
    logger_1.default.info('Defining routes...');
    const router = express_1.default.Router();
    (0, index_1.default)(router);
    expressApp.use('/api/v1', router);
    // Default route
    expressApp.get('/', (req, res) => {
        console.log('Welcome to 10minutedev server');
        res.send('Welcome to 10minutedev server');
    });
    // Health check
    expressApp.get('/health', (req, res) => {
        const healthCheck = {
            uptime: process.uptime(),
            formattedUptime: formatUptime(process.uptime()),
            message: 'OK',
            timestamp: Date.now(),
            version: package_json_1.default.version
        };
        res.status(200).json(healthCheck);
    });
    // 404 handler
    expressApp.use((req, res) => {
        res.status(404).send('Not Found');
    });
    logger_1.default.info('Routes defined');
}
exports.default = defineRoutes;
//# sourceMappingURL=app.js.map