"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        console.log('multerupload', req);
        // const ext = path.extname(file.originalname).toLowerCase();
        const isValidType = ACCEPTED_IMAGE_TYPES.includes(file.mimetype);
        if (isValidType) {
            return cb(null, true);
        }
        cb(new Error('Only .jpg, .jpeg, and .png formats are supported'));
    }
});
exports.default = upload;
//# sourceMappingURL=index.js.map