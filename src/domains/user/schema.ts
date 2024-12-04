import mongoose, { Model, Schema } from 'mongoose';
import { baseSchema } from '../../libraries/db/base-schema';

// Define an interface for the Product document
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'admin' | 'user';
  authType: 'google' | 'github';
  enrolledCourses?: Array<{
    courseId: mongoose.Types.ObjectId;
    progress: number;
    completedModules: mongoose.Types.ObjectId[];
    watchedVideos: mongoose.Types.ObjectId[];
    enrolledAt: Date;
  }>;
  isAdmin: boolean;
  google?: {
    id: string;
    email: string;
    picture: string;
  };
  github?: {
    id: string;
    avatarUrl: string;
  };
  isDeactivated: boolean;
  accessToken?: string | null;
  accessTokenIV?: string | null;
}

const userSchema = new Schema<IUser>({
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
      courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
      progress: { type: Number, default: 0 },
      completedModules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
      watchedVideos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
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
userSchema.add(baseSchema);

// Add unique indexes for auth provider IDs
userSchema.index({ 'github.id': 1 }, { unique: true, sparse: true });
userSchema.index({ 'google.id': 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true });

// Create and export the model
const ProductModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default ProductModel;
