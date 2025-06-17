import Bookmark from '../models/bookmark.js';
import Poem from '../models/poem.js';
import Notification from '../models/notification.js';

// 북마크 추가
export const addBookmark = async (req, res) => {
  try {
    const { poemId } = req.params;
    const userId = req.user.userId;

    // 해당 시가 존재하는지 확인
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: '시를 찾을 수 없습니다.' });
    }

    // 이미 북마크했는지 확인
    const existingBookmark = await Bookmark.findOne({ poemId, userId });
    if (existingBookmark) {
      return res.status(400).json({ message: '이미 북마크한 시입니다.' });
    }

    // 북마크 추가
    const bookmark = new Bookmark({
      poemId,
      userId
    });
    await bookmark.save();

    // 시의 북마크 수 증가
    poem.bookmarksCount += 1;
    await poem.save();

    // 알림 생성 (시 작성자에게)
    try {
      if (poem.authorId && userId && 
          poem.authorId.toString && userId.toString && 
          poem.authorId.toString() !== userId.toString()) {
        const notification = new Notification({
          recipientId: poem.authorId,
          senderId: userId,
          type: 'poem_bookmarked',
          entityId: poemId,
          entityType: 'poem',
          message: `${req.user.penname || '사용자'}님이 회원님의 시를 북마크했습니다.`
        });
        await notification.save();
      }
    } catch (notificationError) {
      console.error('알림 생성 중 오류 발생:', notificationError);
      // 알림 생성 실패해도 북마크 기능은 성공으로 처리
    }

    res.status(201).json({ message: '시를 북마크했습니다.' });
  } catch (error) {
    console.error('북마크 추가 중 오류:', error);
    res.status(500).json({ message: error.message });
  }
};

// 북마크 삭제
export const removeBookmark = async (req, res) => {
  try {
    const { poemId } = req.params;
    const userId = req.user.userId;

    // 북마크 찾기
    const bookmark = await Bookmark.findOne({ poemId, userId });
    if (!bookmark) {
      return res.status(404).json({ message: '북마크를 찾을 수 없습니다.' });
    }

    // 북마크 삭제
    await Bookmark.findByIdAndDelete(bookmark._id);

    // 시의 북마크 수 감소
    const poem = await Poem.findById(poemId);
    if (poem) {
      poem.bookmarksCount = Math.max(0, poem.bookmarksCount - 1);
      await poem.save();
    }

    res.json({ message: '시 북마크를 취소했습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자가 북마크한 시 목록
export const getBookmarksByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookmarks = await Bookmark.find({ userId })
      .populate({
        path: 'poemId',
        select: 'title content authorId pennameAtCreation createdAt emotionTags'
      })
      .sort({ createdAt: -1 });
    
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 시의 북마크 여부 확인
export const checkBookmark = async (req, res) => {
  try {
    const { poemId } = req.params;
    const userId = req.user.userId;

    const bookmark = await Bookmark.findOne({ poemId, userId });
    
    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 