import mongoose, { Schema, Document } from 'mongoose';
import { baseSchema } from '../../libraries/db/base-schema';

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail: {
    url: string;
    publicId?: string;
  };
  instructor: string;
  modules?: mongoose.Types.ObjectId[];
  tags?: string[];
  duration: number;
  enrolledStudents: number;
  price?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  isPublished?: boolean;
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  },
  instructor: { type: String, ref: 'User', required: true },
  modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  tags: [{ type: String }],
  duration: { type: Number, default: 0 },
  enrolledStudents: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  isPublished: { type: Boolean, default: false }
});

courseSchema.add(baseSchema);

export default mongoose.models.Course ||
  mongoose.model<ICourse>('Course', courseSchema);
