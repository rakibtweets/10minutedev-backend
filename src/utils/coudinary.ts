import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
import logger from '../libraries/log/logger';
import { AppError } from '../libraries/error-handling/AppError';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (
  filePath: string,
  folder: string
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    return result;
  } catch (error) {
    logger.error('Failed to upload', error);
    throw new AppError(`Failed to uplaod image`, String(error));
  }
};

export default cloudinary;
