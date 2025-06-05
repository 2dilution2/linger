import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: '북마크한 사용자 ID',
  },
  poemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem',
    required: true,
    description: '북마크한 시 ID',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: '북마크한 시점',
  },
});

export default mongoose.model('Bookmark', bookmarkSchema);
