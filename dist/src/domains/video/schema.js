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
const videoSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoId: { type: String, required: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    module: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Module', required: true },
    duration: { type: Number, required: true }, // in minutes
    order: { type: Number, required: true },
    watchedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
});
videoSchema.add(base_schema_1.baseSchema);
// Create and export the model
const Video = mongoose_1.default.model('Video', videoSchema);
exports.default = Video;
//# sourceMappingURL=schema.js.map