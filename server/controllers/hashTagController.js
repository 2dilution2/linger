import HashTag from '../models/hashTag.js';
import Poem from '../models/poem.js';

// 해시태그 추가
export const addHashTag = async (req, res) => {
  try {
    const { poemId } = req.params;
    const { tag } = req.body;

    // 시 존재 여부 확인
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: '시를 찾을 수 없습니다.' });
    }

    // 태그 형식 검증
    if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
      return res.status(400).json({ message: '유효한 태그를 입력해주세요.' });
    }

    const formattedTag = tag.trim().toLowerCase();

    // 이미 존재하는 태그인지 확인
    const existingTag = await HashTag.findOne({ poemId, tag: formattedTag });
    if (existingTag) {
      return res.status(400).json({ message: '이미 존재하는 태그입니다.' });
    }

    // 해시태그 생성
    const hashTag = new HashTag({
      poemId,
      tag: formattedTag
    });

    await hashTag.save();
    res.status(201).json(hashTag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 해시태그 삭제
export const removeHashTag = async (req, res) => {
  try {
    const { poemId, tagId } = req.params;

    const hashTag = await HashTag.findById(tagId);
    if (!hashTag) {
      return res.status(404).json({ message: '해시태그를 찾을 수 없습니다.' });
    }

    if (hashTag.poemId.toString() !== poemId) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    await HashTag.findByIdAndDelete(tagId);
    res.json({ message: '해시태그가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 시의 해시태그 조회
export const getHashTagsByPoemId = async (req, res) => {
  try {
    const { poemId } = req.params;
    const hashTags = await HashTag.find({ poemId });
    res.json(hashTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 특정 태그로 시 검색
export const searchPoemsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const formattedTag = tag.trim().toLowerCase();
    
    const hashTags = await HashTag.find({ tag: formattedTag });
    const poemIds = hashTags.map(tag => tag.poemId);
    
    const poems = await Poem.find({ 
      _id: { $in: poemIds },
      isPublic: true,
      isDeleted: false
    });
    
    res.json(poems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 인기 태그 조회
export const getPopularTags = async (req, res) => {
  try {
    const result = await HashTag.aggregate([
      { $group: { _id: '$tag', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 감정 태그 생성
export const createEmotionTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: '유효한 태그 이름을 입력해주세요.' });
    }

    const formattedName = name.trim().toLowerCase();

    // 이미 존재하는 태그인지 확인
    const existingTag = await HashTag.findOne({ 
      type: 'emotion',
      name: formattedName 
    });

    if (existingTag) {
      // 클라이언트 형식에 맞게 응답
      return res.json({
        id: existingTag._id,
        name: existingTag.name,
        color: existingTag.color || '#808080'
      });
    }

    // 새 감정 태그 생성
    const emotionTag = new HashTag({
      type: 'emotion',
      name: formattedName,
      color: '#808080' // 기본 색상
    });

    await emotionTag.save();
    
    // 클라이언트 형식에 맞게 응답
    res.status(201).json({
      id: emotionTag._id,
      name: emotionTag.name,
      color: emotionTag.color
    });
  } catch (error) {
    console.error('감정 태그 생성 오류:', error);
    res.status(500).json({ message: error.message });
  }
};

// 감정 태그 목록 조회
export const getEmotionTags = async (req, res) => {
  try {
    // 시스템에서 제공하는 기본 감정 태그 목록
    const defaultEmotionTags = [
      { id: 'joy', name: '기쁨', color: '#FFD700' },
      { id: 'happy', name: '행복', color: '#FFA500' },
      { id: 'love', name: '사랑', color: '#FF69B4' },
      { id: 'flutter', name: '설렘', color: '#FF1493' },
      { id: 'peace', name: '평온', color: '#87CEEB' },
      { id: 'gratitude', name: '감사', color: '#32CD32' },
      { id: 'hope', name: '희망', color: '#00BFFF' },
      { id: 'sad', name: '슬픔', color: '#4682B4' },
      { id: 'miss', name: '그리움', color: '#9370DB' },
      { id: 'lonely', name: '외로움', color: '#6A5ACD' },
      { id: 'depressed', name: '우울', color: '#483D8B' },
      { id: 'anxiety', name: '불안', color: '#2F4F4F' },
      { id: 'anger', name: '분노', color: '#B22222' },
      { id: 'regret', name: '후회', color: '#A52A2A' },
      { id: 'despair', name: '절망', color: '#800000' },
      { id: 'empty', name: '공허', color: '#696969' }
    ];
    
    // DB에서 사용자가 생성한 감정 태그 조회
    const customTags = await HashTag.find({ type: 'emotion' })
      .select('_id name color')
      .sort({ createdAt: -1 });
    
    // 두 목록 합치기 (중복 제거)
    const allTags = [...defaultEmotionTags];
    
    // 이미 기본 태그에 있는지 확인 후, 없으면 추가
    customTags.forEach(tag => {
      if (!allTags.some(t => t.name === tag.name)) {
        allTags.push({
          id: tag._id.toString(),
          name: tag.name,
          color: tag.color || '#808080'
        });
      }
    });
    
    // 응답 로깅
    console.log('감정 태그 응답:', allTags.length, '개 태그 반환');
    
    res.json(allTags);
  } catch (error) {
    console.error('감정 태그 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
}; 