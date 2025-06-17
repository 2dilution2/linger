import Poem from '../models/poem.js';
import User from '../models/user.js';
import UserProfile from '../models/userProfile.js';
import { createError } from '../utils/error.js';
import Follow from '../models/follows.js';
import Like from '../models/like.js';
import Comment from '../models/comment.js';
import mongoose from 'mongoose';

// 모든 시 조회
export const getAllPoems = async (req, res, next) => {
  try {
    const poems = await Poem.find()
      .populate('author', 'penname')
      .sort({ createdAt: -1 });
    res.status(200).json(poems);
  } catch (err) {
    next(err);
  }
};

// 특정 시 조회
export const getPoemById = async (req, res, next) => {
  try {
    const poemId = req.params.id;
    let poem;
    
    // "poem-숫자" 형식의 ID인지 확인
    if (poemId.startsWith('poem-')) {
      // 샘플 데이터나 특별한 처리가 필요한 경우
      const poemNumber = poemId.split('-')[1];
      
      // 샘플 시 데이터를 반환 (프론트엔드 테스트용)
      poem = {
        _id: poemId,
        title: `샘플 시 ${poemNumber}`,
        content: `이것은 샘플 시 ${poemNumber}의 내용입니다.\n시를 작성하면 이곳에 실제 내용이 표시됩니다.`,
        author: 'sample-author',
        author: {
          _id: 'sample-author',
          penname: '샘플 작가'
        },
        pennameAtCreation: '샘플 작가',
        background: 'gradient',
        font: 'gothic',
        emotionTags: ['기쁨', '설렘'],
        isPublic: true,
        likesCount: [],
        commentsCount: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      // 정상적인 MongoDB ObjectId로 조회
      poem = await Poem.findById(poemId)
        .populate('author', 'penname')
        .populate('likesCount');
        
      if (!poem) {
        return next(createError(404, '시를 찾을 수 없습니다.'));
      }
    }
    
    res.status(200).json(poem);
  } catch (err) {
    next(err);
  }
};

// 새 시 작성
export const createPoem = async (req, res, next) => {
  try {
    // 사용자 프로필 정보를 가져옵니다
    const userId = req.user.userId;
    const userProfile = await UserProfile.findOne({ userId });
    
    if (!userProfile) {
      return next(createError(404, '사용자 프로필을 찾을 수 없습니다.'));
    }

    const newPoem = new Poem({
      title: req.body.title,
      content: req.body.content,
      author: userId,
      pennameAtCreation: userProfile.penname,
      emotionTags: req.body.emotionTags,
      isPublic: req.body.isPublic,
      background: req.body.background || 'gradient',
      font: req.body.font || 'gothic'
    });

    // 배경이 photo나 custom인 경우 backgroundImage 필드 추가
    if (req.body.background === 'photo' || req.body.background === 'custom') {
      newPoem.backgroundImage = req.body.backgroundImage;
    }

    const savedPoem = await newPoem.save();
    
    // 작성한 사용자의 시 목록에 추가
    await User.findByIdAndUpdate(userId, {
      $push: { poems: savedPoem._id }
    });
    
    res.status(201).json(savedPoem);
  } catch (err) {
    next(err);
  }
};

// 시 수정
export const updatePoem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      return next(createError(404, '시를 찾을 수 없습니다.'));
    }
    
    // 작성자만 수정 가능
    if (poem.author.toString() !== userId) {
      return next(createError(403, '자신의 시만 수정할 수 있습니다.'));
    }

    // 업데이트할 필드 설정
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      emotionTags: req.body.emotionTags,
      isPublic: req.body.isPublic,
      background: req.body.background,
      font: req.body.font
    };

    // 배경이 photo나 custom인 경우 backgroundImage 필드 추가
    if (req.body.background === 'photo' || req.body.background === 'custom') {
      updateData.backgroundImage = req.body.backgroundImage;
    }

    // 빈 값은 업데이트에서 제외
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedPoem = await Poem.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json(updatedPoem);
  } catch (err) {
    next(err);
  }
};

// 시 삭제
export const deletePoem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const poem = await Poem.findById(req.params.id);
    if (!poem) {
      return next(createError(404, '시를 찾을 수 없습니다.'));
    }
    
    // 작성자만 삭제 가능
    if (poem.author.toString() !== userId) {
      return next(createError(403, '자신의 시만 삭제할 수 있습니다.'));
    }

    await Poem.findByIdAndDelete(req.params.id);
    
    // 사용자의 시 목록에서도 제거
    await User.findByIdAndUpdate(userId, {
      $pull: { poems: req.params.id }
    });
    
    res.status(200).json({ message: '시가 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
};

// 특정 사용자의 시 조회
export const getUserPoems = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const poems = await Poem.find({ author: userId })
      .populate('author', 'penname')
      .sort({ createdAt: -1 });
    
    res.status(200).json(poems);
  } catch (err) {
    next(err);
  }
};

// 추천 시 조회 API
export const getRecommendedPoems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 인기도(좋아요 수) 기준으로 추천 시 조회
    const recommendedPoems = await Poem.aggregate([
      { $match: { isPublic: true } },
      {
        $lookup: {
          from: 'likesCount',
          localField: '_id',
          foreignField: 'poemId',
          as: 'likesCount'
        }
      },
      {
        $lookup: {
          from: 'commentsCount',
          localField: '_id',
          foreignField: 'poemId',
          as: 'commentsCount'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          likeCount: { $size: '$likesCount' },
          commentCount: { $size: '$commentsCount' },
          score: { 
            $add: [
              { $multiply: [{ $size: '$likesCount' }, 2] }, // 좋아요 점수
              { $size: '$commentsCount' }, // 댓글 점수
              { 
                $cond: { 
                  if: { $gte: ['$createdAt', { $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] }] }, 
                  then: 5, // 최근 일주일 내 작성된 시에 가중치 부여
                  else: 0 
                } 
              }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          author: 1,
          authorName: '$author.penname',
          likeCount: 1,
          commentCount: 1,
          createdAt: 1,
          emotionTags: 1,
          background: 1,
          font: 1,
          score: 1
        }
      },
      { $sort: { score: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json(recommendedPoems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 구독자 피드 조회 API (팔로우한 작가의 시)
export const getFollowingFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    
    // 사용자가 팔로우한 작가 ID 목록 조회
    const following = await Follow.find({ followerId: userId });
    const followingIds = following.map(f => f.followingId);
    
    // 팔로우한 작가들의 시 조회
    const poems = await Poem.find({
      author: { $in: followingIds },
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'penname')
      .lean();
    
    // 각 시에 대한 좋아요 및 댓글 수 추가
    const poemsWithStats = await Promise.all(poems.map(async (poem) => {
      const likeCount = await Like.countDocuments({ poemId: poem._id });
      const commentCount = await Comment.countDocuments({ poemId: poem._id });
      
      return {
        ...poem,
        likeCount,
        commentCount
      };
    }));
    
    // 총 시 개수 계산
    const totalCount = await Poem.countDocuments({
      author: { $in: followingIds },
      isPublic: true
    });
    
    res.json({
      poems: poemsWithStats,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 날짜별 시 조회 API (캘린더 뷰)
export const getCalendarPoems = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.userId;
    
    if (!year || !month) {
      return res.status(400).json({ message: '년도와 월을 입력해주세요.' });
    }
    
    // 해당 월의 시작일과 종료일 계산
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    // 사용자가 해당 월에 작성한 시 조회
    const poems = await Poem.find({
      author: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .select('_id title createdAt emotionTags')
      .lean();
    
    // 날짜별로 그룹화
    const calendarData = {};
    
    poems.forEach(poem => {
      const day = poem.createdAt.getDate();
      
      if (!calendarData[day]) {
        calendarData[day] = [];
      }
      
      calendarData[day].push({
        id: poem._id,
        title: poem.title,
        emotions: poem.emotionTags
      });
    });
    
    res.json(calendarData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPoems = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // 정렬 옵션 설정
    const sortOptions = {
      createdAt: { createdAt: order === 'desc' ? -1 : 1 },
      popularity: { popularity: order === 'desc' ? -1 : 1 },
      views: { views: order === 'desc' ? -1 : 1 }
    };

    const poems = await Poem.find()
      .sort(sortOptions[sort] || sortOptions.createdAt)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'penname')
      .lean();

    const total = await Poem.countDocuments();

    res.status(200).json({
      success: true,
      data: poems,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '시 목록을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 내 시 조회
export const getMyPoems = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const poems = await Poem.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'penname')
      .lean();
    
    res.json(poems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자의 감정 태그 통계 조회
export const getEmotionStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // 사용자가 작성한 시를 가져옵니다
    const userPoems = await Poem.find({ author: userId });
    
    if (!userPoems || userPoems.length === 0) {
      return res.status(200).json([]);
    }

    // 모든 감정 태그를 수집합니다
    const allEmotionTags = [];
    userPoems.forEach(poem => {
      if (poem.emotionTags && poem.emotionTags.length > 0) {
        allEmotionTags.push(...poem.emotionTags);
      }
    });

    // 태그가 없으면 빈 배열 반환
    if (allEmotionTags.length === 0) {
      return res.status(200).json([]);
    }

    // 태그별 빈도수 계산
    const tagCounts = {};
    allEmotionTags.forEach(tagId => {
      tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
    });

    // 태그 ID로 감정 태그 정보 조회
    const HashTag = mongoose.model('HashTag');
    
    // 기본 태그 색상 매핑
    const defaultColors = {
      '기쁨': '#FFD700',
      '행복': '#FFA500',
      '사랑': '#FF69B4',
      '설렘': '#FF1493',
      '평온': '#87CEEB',
      '감사': '#32CD32',
      '희망': '#00BFFF',
      '슬픔': '#4682B4',
      '그리움': '#9370DB',
      '외로움': '#6A5ACD',
      '우울': '#483D8B',
      '불안': '#2F4F4F',
      '분노': '#B22222',
      '후회': '#A52A2A',
      '절망': '#800000',
      '공허': '#696969'
    };

    // 감정 태그 데이터 구성
    const emotionStats = [];
    
    // 문자열로 된 태그 이름과 ObjectId로 구성된 태그 ID를 모두 처리
    const validTagIds = [];
    const tagNameIds = [];
    
    // ID 형식 확인 및 분류
    Object.keys(tagCounts).forEach(tagId => {
      // MongoDB ObjectId 패턴 검사 (24자리 16진수)
      if (/^[0-9a-fA-F]{24}$/.test(tagId)) {
        validTagIds.push(mongoose.Types.ObjectId(tagId));
      } else {
        // ObjectId가 아닌 경우 태그 이름으로 간주
        tagNameIds.push(tagId);
      }
    });
    
    console.log(`감정 통계 처리: ObjectId ${validTagIds.length}개, 문자열 ${tagNameIds.length}개`);
    
    // 유효한 ObjectId로 태그 조회
    let emotionTagsData = [];
    if (validTagIds.length > 0) {
      emotionTagsData = await HashTag.find({
        _id: { $in: validTagIds },
        type: 'emotion'
      });
    }
    
    // 태그 이름으로 조회 (ObjectId가 아닌 경우)
    if (tagNameIds.length > 0) {
      const nameBasedTags = await HashTag.find({
        name: { $in: tagNameIds },
        type: 'emotion'
      });
      
      // 결과 합치기
      emotionTagsData = [...emotionTagsData, ...nameBasedTags];
    }
    
    // 태그 데이터를 ID와 이름 기준으로 맵 구성
    const tagMap = {};
    
    // ID 기준 매핑
    emotionTagsData.forEach(tag => {
      const tagId = tag._id.toString();
      tagMap[tagId] = {
        name: tag.name,
        color: tag.color || defaultColors[tag.name] || '#808080'
      };
      // 이름 기준 매핑도 추가 (문자열 ID 지원)
      tagMap[tag.name] = {
        name: tag.name,
        color: tag.color || defaultColors[tag.name] || '#808080'
      };
    });
    
    // 기본 감정 태그 이름 추가 (DB에 없는 경우 대비)
    Object.entries(defaultColors).forEach(([name, color]) => {
      if (!tagMap[name]) {
        tagMap[name] = { name, color };
      }
    });
    
    // 태그별 통계 구성
    const totalTags = allEmotionTags.length;
    Object.entries(tagCounts).forEach(([tagId, count]) => {
      const tag = tagMap[tagId];
      if (tag) {
        emotionStats.push({
          name: tag.name,
          count: count,
          percentage: Math.round((count / totalTags) * 100),
          color: tag.color
        });
      } else {
        console.warn(`감정 태그 정보 없음: ${tagId}`);
      }
    });

    // 백분율 기준 내림차순 정렬
    emotionStats.sort((a, b) => b.percentage - a.percentage);
    
    // 백분율 합이 100%가 되도록 조정
    let totalPercentage = emotionStats.reduce((sum, stat) => sum + stat.percentage, 0);
    if (totalPercentage !== 100 && emotionStats.length > 0) {
      // 가장 큰 값의 백분율 조정
      const diff = 100 - totalPercentage;
      emotionStats[0].percentage += diff;
    }
    
    res.status(200).json(emotionStats);
  } catch (err) {
    console.error('감정 통계 조회 오류:', err);
    next(err);
  }
};

// 자주 사용된 단어 통계 조회
export const getFrequentWords = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // 사용자가 작성한 시를 가져옵니다
    const userPoems = await Poem.find({ author: userId });
    
    if (!userPoems || userPoems.length === 0) {
      return res.status(200).json([]);
    }

    // 모든 시 내용을 합쳐서 분석합니다
    const allContent = userPoems.map(poem => poem.content).join(' ');
    
    // 단어 분리 및 불용어 필터링
    const stopWords = ['은', '는', '이', '가', '을', '를', '에', '의', '과', '와', '그', '저', '나', '너', '그리고', '그러나'];
    const words = allContent
      .replace(/[^\uAC00-\uD7A3\s]/g, '') // 한글과 공백만 남기기
      .split(/\s+/)
      .filter(word => word.length >= 2) // 2글자 이상만 포함
      .filter(word => !stopWords.includes(word)); // 불용어 제외
    
    // 단어 빈도수 계산
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // 빈도수 기준 정렬하여 상위 20개 단어 추출
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));
    
    res.status(200).json(sortedWords);
  } catch (err) {
    console.error('단어 통계 조회 오류:', err);
    next(err);
  }
}; 