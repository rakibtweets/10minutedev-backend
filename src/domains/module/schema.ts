import mongoose, { Schema, Document, Model } from 'mongoose';
import { baseSchema } from '../../libraries/db/base-schema';

export interface IModule extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  videos: mongoose.Types.ObjectId[];
  order: number;
  duration: number;
}

const ModuleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  order: { type: Number, required: true },
  duration: { type: Number, default: 0 }
});
ModuleSchema.add(baseSchema);

// Create and export the model
const CourseModule: Model<IModule> = mongoose.model<IModule>(
  'Module',
  ModuleSchema
);

export default CourseModule;
