"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseSchema = void 0;
const mongoose_1 = require("mongoose");
// Create the base schema with TypeScript
const baseSchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: () => new Date(),
        index: true
    },
    updatedAt: {
        type: Date,
        default: () => new Date(),
        index: true
    }
});
exports.baseSchema = baseSchema;
//# sourceMappingURL=base-schema.js.map