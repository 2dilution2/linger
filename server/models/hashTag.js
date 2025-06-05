import mongoose from 'mongoose';

const hashTagSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['poem', 'emotion'],
    default: 'poem',
    description: "태그 타입 (일반 시 태그 또는 감정 태그)"
  },
  poemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poem',
    required: function() { return this.type === 'poem'; },
    description: "태그가 연결된 시의 ID (poem 타입일 때만 필수)"
  },
  tag: {
    type: String,
    required: function() { return this.type === 'poem'; },
    trim: true,
    lowercase: true,
    description: "해시태그 문자열 (예: '겨울밤', '추억') - poem 타입일 때만 필수"
  },
  name: {
    type: String,
    required: function() { return this.type === 'emotion'; },
    trim: true,
    lowercase: true,
    description: "감정 태그 이름 (예: '행복', '슬픔') - emotion 타입일 때만 필수"
  },
  color: {
    type: String,
    default: '#808080',
    description: "감정 태그 색상 - emotion 타입에서 사용"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// poem 타입의 태그에 대해서만 고유성 제약 적용
hashTagSchema.index({ tag: 1, poemId: 1 }, { 
  unique: true,
  partialFilterExpression: { type: 'poem' } 
});

// emotion 타입의 태그에 대해 name 필드의 고유성 제약 적용
hashTagSchema.index({ name: 1, type: 1 }, {
  unique: true,
  partialFilterExpression: { type: 'emotion' }
});

export default mongoose.model('HashTag', hashTagSchema);
