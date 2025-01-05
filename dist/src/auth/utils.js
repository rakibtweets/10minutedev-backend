"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptToken = encryptToken;
exports.decryptToken = decryptToken;
const crypto_1 = __importDefault(require("crypto"));
const configs_1 = __importDefault(require("../configs"));
function encryptToken(token) {
    const encryptionKey = Buffer.from(configs_1.default.ENCRYPTION_KEY, 'utf-8'); // Convert key to buffer
    const iv = crypto_1.default.randomBytes(16); // Generate a secure IV
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(token, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return {
        token: encrypted,
        iv: iv.toString('hex')
    };
}
function decryptToken(encryptedToken, iv) {
    const encryptionKey = Buffer.from(configs_1.default.ENCRYPTION_KEY, 'utf-8'); // Convert key to buffer
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
//# sourceMappingURL=utils.js.map