"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../libraries/log/logger"));
const config_schema_1 = __importDefault(require("./config.schema"));
class Config {
    constructor() {
        if (!Config.instance) {
            logger_1.default.info('Loading and validating config for the first time...');
            this.config = this.loadAndValidateConfig();
            Config.instance = this;
            logger_1.default.info('Config loaded and validated', {
                NODE_ENV: this.config.NODE_ENV,
                PORT: this.config.PORT,
                HOST: this.config.HOST,
                CLIENT_HOST: this.config.CLIENT_HOST
            });
            // log the keys only (not the values) from the config
            logger_1.default.info('Config keys: ', Object.keys(this.config));
        }
        return Config.instance;
    }
    loadAndValidateConfig() {
        const environment = process.env.NODE_ENV || 'development';
        // 1. Load environment file from one level up using __dirname
        const envFile = `.env.${environment}`;
        const envPath = path_1.default.join(__dirname, '..', envFile);
        if (!fs_1.default.existsSync(envPath)) {
            throw new Error(`Environment file not found: ${envPath}`);
        }
        dotenv_1.default.config({ path: envPath });
        // 2. Load config file based on environment
        const configFile = path_1.default.join(__dirname, `config.${environment}.json`);
        if (!fs_1.default.existsSync(configFile)) {
            throw new Error(`Config file not found: ${configFile}`);
        }
        let config = JSON.parse(fs_1.default.readFileSync(configFile, 'utf-8'));
        const sharedConfigFile = path_1.default.join(__dirname, 'config.shared.json');
        if (fs_1.default.existsSync(sharedConfigFile)) {
            const sharedConfig = JSON.parse(fs_1.default.readFileSync(sharedConfigFile, 'utf-8'));
            config = { ...sharedConfig, ...config };
        }
        const finalConfig = {};
        const schemaKeys = config_schema_1.default.describe().keys;
        for (const key in schemaKeys) {
            if (Object.prototype.hasOwnProperty.call(process.env, key)) {
                finalConfig[key] = process.env[key]; // Prioritize environment variables
            }
            else if (Object.prototype.hasOwnProperty.call(config, key)) {
                finalConfig[key] = config[key]; // Fallback to config file value
            }
        }
        console.log('config', finalConfig);
        // 4. Load the schema file
        if (!config_schema_1.default) {
            throw new Error('Schema file not found');
        }
        const { error, value: validatedConfig } = config_schema_1.default.validate(finalConfig);
        if (error) {
            const missingProperties = error.details.map((detail) => detail.path[0]);
            throw new Error(`Config validation error: missing properties ${missingProperties}`);
        }
        return validatedConfig;
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
}
Config.instance = null;
exports.default = Config.getInstance().config;
