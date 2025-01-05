"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../libraries/log/logger"));
const AppError_1 = require("../libraries/error-handling/AppError");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, { folder });
        return result;
    }
    catch (error) {
        logger_1.default.error('Failed to upload', error);
        throw new AppError_1.AppError(`Failed to uplaod image`, String(error));
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
// delete image from cloudinary
const deleteFromCloudinary = (publicId) => {
    try {
        const result = cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        logger_1.default.error('Failed to delete', error);
        throw new AppError_1.AppError(`Failed to delete image`, String(error));
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=coudinary.js.map