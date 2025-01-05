"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_context_1 = require("../../middlewares/request-context");
const winston_1 = require("winston");
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('winston-daily-rotate-file');
const LOG_DIR = 'logs';
class LogManager {
    constructor() {
        this.logger = (0, winston_1.createLogger)({
            level: 'info',
            format: winston_1.format.combine(winston_1.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json(), (0, winston_1.format)((info) => {
                const requestId = (0, request_context_1.retrieveRequestId)();
                if (requestId) {
                    info.requestId = requestId;
                }
                return info;
            })()),
            transports: [
                new winston_1.transports.File({
                    filename: `${LOG_DIR}/error.log`,
                    level: 'error'
                }),
                new winston_1.transports.File({ filename: `${LOG_DIR}/combined.log` }),
                //@ts-ignore
                new winston_1.transports.DailyRotateFile({
                    level: 'info',
                    filename: `${LOG_DIR}/application-%DATE%.log`,
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d'
                })
            ]
        });
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston_1.transports.Console({
                format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
            }));
        }
    }
    getLogger() {
        return this.logger;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new LogManager();
        }
        return this.instance;
    }
}
exports.default = LogManager.getInstance().getLogger();
