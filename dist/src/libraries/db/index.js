"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectWithMongoDb = exports.connectWithMongoDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../log/logger"));
const configs_1 = __importDefault(require("../../configs"));
const connectWithMongoDb = async () => {
    const MONGODB_URI = configs_1.default.MONGODB_URI;
    logger_1.default.info('Connecting to MongoDB...');
    mongoose_1.default.connection.once('open', () => {
        logger_1.default.info('MongoDB connection is open');
    });
    mongoose_1.default.connection.on('error', (error) => {
        logger_1.default.error('MongoDB connection error', error);
    });
    await mongoose_1.default.connect(MONGODB_URI, {
        autoIndex: true,
        autoCreate: true
    });
    logger_1.default.info('Connected to MongoDB');
};
exports.connectWithMongoDb = connectWithMongoDb;
const disconnectWithMongoDb = async () => {
    logger_1.default.info('Disconnecting from MongoDB...');
    await mongoose_1.default.disconnect();
    logger_1.default.info('Disconnected from MongoDB');
};
exports.disconnectWithMongoDb = disconnectWithMongoDb;
