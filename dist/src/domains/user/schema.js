"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const base_schema_1 = require("../../libraries/db/base-schema");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    authType: { type: String, enum: ['google', 'github'], required: true },
    enrolledCourses: [
        {
            courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' },
            progress: { type: Number, default: 0 },
            completedModules: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Module' }],
            watchedVideos: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Video' }],
            enrolledAt: { type: Date, default: Date.now }
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    },
    google: {
        id: { type: String },
        email: { type: String },
        picture: { type: String }
    },
    github: {
        id: { type: String },
        avatarUrl: { type: String }
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    accessToken: {
        type: String
    },
    accessTokenIV: {
        type: String
    }
    // other properties
});
userSchema.add(base_schema_1.baseSchema);
// Add unique indexes for auth provider IDs
userSchema.index({ 'github.id': 1 }, { unique: true, sparse: true });
userSchema.index({ 'google.id': 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });
// Create and export the model
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=schema.js.map