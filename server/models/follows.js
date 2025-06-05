import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: '팔로우를 거는 사람 (나)',
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: '팔로우 당하는 사람 (상대)',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Follow', followSchema);