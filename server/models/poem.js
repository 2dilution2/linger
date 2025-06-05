import mongoose from 'mongoose';

const poemSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    description: "시 제목"
  },
  content: {
    type: String,
    required: true,
    description: "본문 내용"
  },
  background: {
    type: String,
    required: true,
    enum: ['gradient', 'photo', 'custom'],
    default: 'gradient',
    description: "배경 타입 (gradient: 그라데이션, photo: 기본 제공 사진, custom: 사용자 업로드)"
  },
  backgroundImage: {
    type: String,
    required: function() {
      return this.background === 'photo' || this.background === 'custom';
    },
    description: "배경 이미지 URL (photo나 custom 타입일 때만 필수)"
  },
  font: {
    type: String,
    required: true,
    enum: ['gothic', 'handwriting', 'brush'],
    default: 'gothic',
    description: "폰트 타입 (gothic: 고딕체, handwriting: 손글씨체, brush: 붓글씨체)"
  },
  tags: [{
    type: String,
    trim: true
  }],
  pennameAtCreation: {
    type: String,
    required: true,
    description: "작성 시점의 필명 (변경과 무관, 정적 기록용)"
  },
  emotionTags: {
    type: [String],
    default: [],
    description: "감정 기반 사용자 태그 (예: '고요한밤', '설레임')"
  },
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    default: null,
    description: "[미사용] 향후 공모전/기획전 기능 확장용 필드"
  },
  isPublic: {
    type: Boolean,
    default: true,
    description: "공개 여부"
  },
  views: {
    type: Number,
    default: 0,
    description: "조회수 (캐싱 용도)"
  },
  popularity: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0,
    description: "좋아요 수 (likes 배열 대신 count 저장)"
  },
  bookmarksCount: {
    type: Number,
    default: 0,
    description: "북마크 수"
  },
  commentsCount: {
    type: Number,
    default: 0,
    description: "댓글 수"
  },
  reports: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    description: "신고한 사용자 ID 목록"
  },
  isDeleted: {
    type: Boolean,
    default: false,
    description: "삭제 여부 (soft delete)"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 인기도 계산을 위한 가중치 설정 (가상 필드 제거)
// poemSchema.virtual('likesCount', {
//   ref: 'Like',
//   localField: '_id',
//   foreignField: 'poem',
//   count: true
// });

// 인기도 업데이트 미들웨어
poemSchema.pre('save', async function(next) {
  if (this.isModified('views') || this.isModified('likesCount')) {
    // 인기도 = 조회수 * 0.3 + 좋아요 수 * 0.7
    // 이미 likesCount 필드가 있으므로 가상 필드가 필요 없음
    this.popularity = (this.views * 0.3) + (this.likesCount * 0.7);
  }
  next();
});

poemSchema.index({ title: 'text', content: 'text' });

const Poem = mongoose.model('Poem', poemSchema);

export default Poem;