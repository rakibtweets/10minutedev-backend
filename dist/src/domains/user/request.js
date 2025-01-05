"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = exports.updateSchema = exports.createSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = __importDefault(require("mongoose"));
const createSchema = joi_1.default.object().keys({
    name: joi_1.default.string().required()
    // other properties
});
exports.createSchema = createSchema;
const updateSchema = joi_1.default.object().keys({
    name: joi_1.default.string()
    // other properties
});
exports.updateSchema = updateSchema;
const idSchema = joi_1.default.object().keys({
    id: joi_1.default.string()
        .custom((value, helpers) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'ObjectId validation')
        .required()
});
exports.idSchema = idSchema;
//# sourceMappingURL=request.js.map