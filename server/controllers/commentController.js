import Comment from '../models/comment.js';
import Poem from '../models/poem.js';
import Notification from '../models/notification.js';
import UserProfile from '../models/userProfile.js';

// 댓글 작성
export const createComment = async (req, res) => {
  try {
    const { poemId } = req.params;
    const { content, parentCommentId } = req.body;
    const authorId = req.user.userId;

    // 시 존재 여부 확인
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return res.status(404).json({ message: '시를 찾을 수 없습니다.' });
    }

    // 부모 댓글 확인 (대댓글인 경우)
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: '부모 댓글을 찾을 수 없습니다.' });
      }
    }

    // 댓글 생성
    const comment = new Comment({
      poemId,
      authorId,
      content,
      parentCommentId: parentCommentId || null
    });

    await comment.save();

    // 시의 댓글 수 증가
    poem.commentsCount += 1;
    await poem.save();

    // 알림 생성
    if (parentCommentId) {
      // 대댓글인 경우 원 댓글 작성자에게 알림
      try {
        const parentComment = await Comment.findById(parentCommentId);
        
        if (parentComment.authorId && String(parentComment.authorId) !== String(authorId)) {
          // 사용자 프로필에서 penname을 다시 가져와서 확인
          let penname = req.user?.penname;
          if (!penname) {
            try {
              const userProfile = await UserProfile.findOne({ userId: authorId });
              if (userProfile) {
                penname = userProfile.penname;
              }
            } catch (err) {
              // 프로필 조회 실패해도 계속 진행
            }
          }
          
          const notification = new Notification({
            recipientId: parentComment.authorId,
            senderId: authorId,
            type: 'new_reply',
            entityId: comment._id,
            entityType: 'comment',
            message: `${penname || '사용자'}님이 회원님의 댓글에 답글을 달았습니다.`
          });
          await notification.save();
        }
      } catch (notificationError) {
        // 알림 생성 실패해도 댓글 작성은 성공으로 처리
      }
    } else {
      // 일반 댓글인 경우 시 작성자에게 알림
      // authorId 대신 author 필드 사용
      try {
        if (poem.author && String(poem.author) !== String(authorId)) {
          // 사용자 프로필에서 penname을 다시 가져와서 확인
          let penname = req.user?.penname;
          if (!penname) {
            try {
              const userProfile = await UserProfile.findOne({ userId: authorId });
              if (userProfile) {
                penname = userProfile.penname;
              }
            } catch (err) {
              // 프로필 조회 실패해도 계속 진행
            }
          }
          
          const notification = new Notification({
            recipientId: poem.author,
            senderId: authorId,
            type: 'new_comment',
            entityId: comment._id,
            entityType: 'comment',
            message: `${penname || '사용자'}님이 회원님의 시에 댓글을 달았습니다.`
          });
          await notification.save();
        }
      } catch (notificationError) {
        // 알림 생성 실패해도 댓글 작성은 성공으로 처리
      }
    }

    // 응답에 penname 추가
    const commentWithPenname = comment.toObject();
    commentWithPenname.penname = req.user?.penname || '익명';
    
    res.status(201).json(commentWithPenname);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 댓글 수정
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 댓글 작성자만 수정 가능
    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 댓글 삭제 (소프트 딜리트)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 댓글 작성자만 삭제 가능
    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    comment.isDeleted = true;
    comment.updatedAt = Date.now();
    await comment.save();

    // 시의 댓글 수 감소
    const poem = await Poem.findById(comment.poemId);
    if (poem) {
      poem.commentsCount = Math.max(0, poem.commentsCount - 1);
      await poem.save();
    }

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 시의 댓글 목록 조회
export const getCommentsByPoemId = async (req, res) => {
  try {
    const { poemId } = req.params;
    
    // 최상위 댓글 먼저 조회
    const comments = await Comment.find({ 
      poemId, 
      parentCommentId: null,
      isDeleted: false 
    })
    .sort({ createdAt: -1 });
    
    // 각 댓글의 답글 조회 및 작성자 정보 추가
    const result = await Promise.all(comments.map(async (comment) => {
      const commentObj = comment.toObject();
      
      // 댓글 작성자 정보(penname) 조회
      try {
        const userProfile = await UserProfile.findOne({ userId: comment.authorId });
        if (userProfile) {
          commentObj.penname = userProfile.penname;
          commentObj.profileImage = userProfile.profileImage;
        }
      } catch (err) {
        console.error('댓글 작성자 정보 조회 실패:', err);
      }
      
      // 대댓글 조회
      const replies = await Comment.find({
        poemId,
        parentCommentId: comment._id,
        isDeleted: false
      }).sort({ createdAt: 1 });
      
      // 대댓글에 작성자 정보 추가
      const repliesWithPenname = await Promise.all(replies.map(async (reply) => {
        const replyObj = reply.toObject();
        
        try {
          const replyUserProfile = await UserProfile.findOne({ userId: reply.authorId });
          if (replyUserProfile) {
            replyObj.penname = replyUserProfile.penname;
            replyObj.profileImage = replyUserProfile.profileImage;
          }
        } catch (err) {
          console.error('대댓글 작성자 정보 조회 실패:', err);
        }
        
        return replyObj;
      }));
      
      return {
        ...commentObj,
        replies: repliesWithPenname
      };
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 댓글 좋아요
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 이미 좋아요를 눌렀는지 확인
    if (comment.likes.includes(userId)) {
      return res.status(400).json({ message: '이미 좋아요를 누른 댓글입니다.' });
    }

    // 좋아요 추가
    comment.likes.push(userId);
    await comment.save();

    // 알림 생성
    if (comment.authorId.toString() !== userId.toString()) {
      const notification = new Notification({
        recipientId: comment.authorId,
        senderId: userId,
        type: 'comment_liked',
        entityId: commentId,
        entityType: 'comment',
        message: `${req.user.penname}님이 회원님의 댓글을 좋아합니다.`
      });
      await notification.save();
    }

    res.json({ message: '댓글에 좋아요를 눌렀습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 댓글 좋아요 취소
export const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 좋아요 취소
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    await comment.save();

    res.json({ message: '댓글 좋아요가 취소되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 