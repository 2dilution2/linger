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

// 사용자가 같은 시를 중복 북마크하지 못하도록 복합 인덱스 추가
bookmarkSchema.index({ poemId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
