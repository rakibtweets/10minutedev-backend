import mongoose, { Model, Schema } from 'mongoose';
import { baseSchema } from '../../libraries/db/base-schema';

// Define an interface for the Product document
export interface IVideo extends Document {
  title: string;
  description?: string;
  videoId: string;
  module: mongoose.Types.ObjectId;
  duration: number;
  order: number;
  watchedBy: mongoose.Types.ObjectId[];
}

const videoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: { type: String },
  videoId: { type: String, required: true },
  module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  duration: { type: Number, required: true }, // in minutes
  order: { type: Number, required: true },
  watchedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
videoSchema.add(baseSchema);

// Create and export the model
const VideoModel: Model<IVideo> = mongoose.model<IVideo>('Video', videoSchema);

export default VideoModel;
