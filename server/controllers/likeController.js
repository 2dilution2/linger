import Like from '../models/like.js';
import Poem from '../models/poem.js';
import Notification from '../models/notification.js';

// 좋아요 추가
export const addLike = async (req, res) => {
  try {
    const { poemId } = req.params;
    const userId = req.user.userId;

    // 해당 시가 존재하는지 확인
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: '시를 찾을 수 없습니다.' });
    }

    // 이미 좋아요를 했는지 확인
    const existingLike = await Like.findOne({ poemId, userId });
    if (existingLike) {
      return res.status(400).json({ message: '이미 좋아요를 누른 시입니다.' });
    }

    // 좋아요 추가
    const like = new Like({
      poemId,
      userId
    });
    await like.save();

    // 시의 좋아요 수 증가
    poem.likesCount += 1;
    await poem.save();

    // 알림 생성 (시 작성자에게)
    try {
      if (poem.authorId && userId && 
          poem.authorId.toString && userId.toString && 
          poem.authorId.toString() !== userId.toString()) {
        const notification = new Notification({
          recipientId: poem.authorId,
          senderId: userId,
          type: 'poem_liked',
          entityId: poemId,
          entityType: 'poem',
          message: `${req.user.penname || '사용자'}님이 회원님의 시를 좋아합니다.`
        });
        await notification.save();
      }
    } catch (notificationError) {
      console.error('알림 생성 중 오류 발생:', notificationError);
      // 알림 생성 실패해도 좋아요 기능은 성공으로 처리
    }

    res.status(201).json({ message: '시에 좋아요를 눌렀습니다.' });
  } catch (error) {
    console.error('좋아요 추가 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
};

// 좋아요 취소
export const removeLike = async (req, res) => {
  try {
    const { poemId } = req.params;
    const userId = req.user.userId;

    // 좋아요 찾기
    const like = await Like.findOne({ poemId, userId });
    if (!like) {
      return res.status(404).json({ message: '좋아요를 찾을 수 없습니다.' });
    }

    // 좋아요 삭제
    await Like.findByIdAndDelete(like._id);

    // 시의 좋아요 수 감소
    const poem = await Poem.findById(poemId);
    if (poem) {
      poem.likesCount = Math.max(0, poem.likesCount - 1);
      await poem.save();
    }

    res.json({ message: '시 좋아요를 취소했습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 시의 좋아요 목록 조회
export const getLikesByPoemId = async (req, res) => {
  try {
    const { poemId } = req.params;
    const likes = await Like.find({ poemId }).populate('userId', 'penname');
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자가 좋아요 한 시 목록 조회
export const getLikesByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const likes = await Like.find({ userId }).populate('poemId');
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 좋아요 상태 확인 API
export const getLikeStatus = async (req, res) => {
  try {
    const { poemId } = req.params;
    const userId = req.user.userId;

    // 시 존재 여부 확인
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: '시를 찾을 수 없습니다.' });
    }

    // 좋아요 여부 확인
    const like = await Like.findOne({ poemId, userId });
    
    res.json({ isLiked: !!like });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 