"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const schema = joi_1.default.object({
    NODE_ENV: joi_1.default.string()
        .valid('development', 'production', 'test')
        .default('development'),
    MONGODB_URI: joi_1.default.string().required(),
    RATE: joi_1.default.number().min(0).required(),
    PORT: joi_1.default.number().min(1000).default(4000),
    //  OAuth Secrets
    GITHUB_CLIENT_ID: joi_1.default.string().required(),
    GITHUB_CLIENT_SECRET: joi_1.default.string().required(),
    GOOGLE_CLIENT_ID: joi_1.default.string().required(),
    GOOGLE_CLIENT_SECRET: joi_1.default.string().required(),
    ENCRYPTION_KEY: joi_1.default.string().required(),
    SESSION_SECRET: joi_1.default.string().required(),
    // host should start with http:// or https://
    HOST: joi_1.default.string()
        .pattern(/^(http:\/\/|https:\/\/)/)
        .required(),
    CLIENT_HOST: joi_1.default.string()
        .pattern(/^(http:\/\/|https:\/\/)/)
        .required(),
    ADMIN_EMAILS: joi_1.default.array().items(joi_1.default.string()).required()
});
exports.default = schema;
//# sourceMappingURL=config.schema.js.map