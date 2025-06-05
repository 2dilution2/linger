import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    description: '신고한 사용자 ID'
  },
  targetType: {
    type: String,
    required: true,
    enum: ['poem', 'comment', 'user'],
    description: '신고 대상 유형'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    description: '신고 대상 객체 ID'
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'copyright', 'other'],
    description: '신고 사유'
  },
  description: {
    type: String,
    trim: true,
    description: '자세한 설명 (선택)'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
    description: '처리 상태'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: '신고 생성 시각'
  }
});

const Report = mongoose.model('Report', reportSchema);

export default Report; 