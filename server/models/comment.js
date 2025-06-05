import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  poemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem',
    required: true,
    description: "댓글이 달린 시 ID"
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: "댓글 작성자"
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000,
    description: "댓글 본문"
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    description: "대댓글인 경우 부모 댓글 ID"
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    description: "댓글에 좋아요 누른 사용자들"
  },
  isDeleted: {
    type: Boolean,
    default: false,
    description: "soft delete 여부"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Comment', commentSchema);
