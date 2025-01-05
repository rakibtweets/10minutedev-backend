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
const courseSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: {
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    },
    instructor: { type: String, ref: 'User', required: true },
    modules: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Module' }],
    tags: [{ type: String }],
    duration: { type: Number, default: 0 },
    enrolledStudents: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    isPublished: { type: Boolean, default: false },
    noOfVideos: { type: Number, default: 0 }
});
courseSchema.add(base_schema_1.baseSchema);
const Course = mongoose_1.default.model('Course', courseSchema);
exports.default = Course;
//# sourceMappingURL=schema.js.map