import multer from 'multer';
import { Request } from 'express';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req: Request, file, cb) => {
    console.log('multerupload', req);
    // const ext = path.extname(file.originalname).toLowerCase();
    const isValidType = ACCEPTED_IMAGE_TYPES.includes(file.mimetype);

    if (isValidType) {
      return cb(null, true);
    }

    cb(new Error('Only .jpg, .jpeg, and .png formats are supported'));
  }
});

export default upload;
