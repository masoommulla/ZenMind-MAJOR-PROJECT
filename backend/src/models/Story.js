import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  story: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  }
}, { timestamps: true });

export default mongoose.model('Story', storySchema);
