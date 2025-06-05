import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  poemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem',
    required: true,
    description: "좋아요한 시 ID"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: "좋아요한 사용자 ID"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

likeSchema.index({ poemId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);
