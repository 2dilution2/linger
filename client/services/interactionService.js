import api from './api';

// 상호작용(좋아요, 댓글, 북마크 등) 서비스
const interactionService = {
  // 좋아요 추가
  addLike: async (poemId) => {
    try {
      // 입력값 검증
      if (!poemId) {
        console.error('유효하지 않은 시 ID:', poemId);
        throw new Error('유효하지 않은 시 ID입니다.');
      }
      
      // 문자열로 확실하게 변환
      let normalizedPoemId = String(poemId);
      
      // 특수문자 검사
      if (/[^a-zA-Z0-9]/.test(normalizedPoemId)) {
        console.warn('ID에 특수문자가 포함되어 있습니다:', normalizedPoemId);
      }
      
      console.log('좋아요 추가 요청:', {
        원본ID: poemId,
        변환ID: normalizedPoemId
      });
      
      const url = `/api/likes/poems/${normalizedPoemId}`;
      console.log(`API 호출 URL: ${url}`);
      
      const response = await api.post(url);
      console.log('좋아요 추가 성공 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('좋아요 추가 오류:', error);
      if (error.response) {
        console.error('서버 응답 상태:', error.response.status);
        console.error('서버 응답 데이터:', error.response.data);
      }
      throw error;
    }
  },

  // 좋아요 삭제
  removeLike: async (poemId) => {
    try {
      // 입력값 검증
      if (!poemId) {
        console.error('유효하지 않은 시 ID:', poemId);
        throw new Error('유효하지 않은 시 ID입니다.');
      }
      
      // 문자열로 확실하게 변환
      let normalizedPoemId = String(poemId);
      
      // 특수문자 검사
      if (/[^a-zA-Z0-9]/.test(normalizedPoemId)) {
        console.warn('ID에 특수문자가 포함되어 있습니다:', normalizedPoemId);
      }
      
      console.log('좋아요 제거 요청:', {
        원본ID: poemId,
        변환ID: normalizedPoemId
      });
      
      const url = `/api/likes/poems/${normalizedPoemId}`;
      console.log(`API 호출 URL: ${url}`);
      
      const response = await api.delete(url);
      console.log('좋아요 제거 성공 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('좋아요 제거 오류:', error);
      if (error.response) {
        console.error('서버 응답 상태:', error.response.status);
        console.error('서버 응답 데이터:', error.response.data);
      }
      throw error;
    }
  },

  // 좋아요 상태 확인
  checkLikeStatus: async (poemId) => {
    try {
      // 입력값 검증
      if (!poemId) {
        console.warn('유효하지 않은 시 ID로 좋아요 상태 확인 시도');
        return { isLiked: false };
      }
      
      // 문자열로 확실하게 변환
      let normalizedPoemId = String(poemId);
      
      console.log('좋아요 상태 확인 요청:', {
        원본ID: poemId,
        변환ID: normalizedPoemId
      });
      
      const url = `/api/likes/${normalizedPoemId}/status`;
      console.log(`API 호출 URL: ${url}`);
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('좋아요 상태 확인 오류:', error);
      return { isLiked: false };
    }
  },

  // 댓글 목록 조회
  getComments: async (poemId) => {
    try {
      const response = await api.get(`/api/comments/poems/${poemId}`);
      
      // 서버로부터 받은 원본 데이터 로깅
      console.log('서버에서 받은 원본 댓글 데이터:', response.data.map(c => ({
        _id: c._id,
        _idType: typeof c._id,
        authorId: c.authorId,
        penname: c.penname
      })));
      
      // 모든 댓글에 commentId 속성 추가 (문자열로 _id 복제)
      const commentsWithStringIds = response.data.map(comment => {
        // _id가 객체인 경우 toString() 처리, 문자열이면 그대로 사용
        const commentId = comment._id && typeof comment._id === 'object' && comment._id.toString 
          ? comment._id.toString() 
          : (typeof comment._id === 'string' ? comment._id : `temp-${Date.now()}`);
        
        console.log('댓글 ID 변환:', {
          원본ID: comment._id,
          원본타입: typeof comment._id, 
          변환ID: commentId,
          변환타입: typeof commentId
        });
          
        // 답글도 같은 방식으로 처리
        const replies = comment.replies ? comment.replies.map(reply => {
          const replyId = reply._id && typeof reply._id === 'object' && reply._id.toString
            ? reply._id.toString()
            : (typeof reply._id === 'string' ? reply._id : `temp-reply-${Date.now()}`);
            
          return {
            ...reply,
            commentId: replyId
          };
        }) : [];
        
        return {
          ...comment,
          commentId,
          replies
        };
      });
      
      console.log('commentId 변환 완료:', commentsWithStringIds.map(c => ({ 
        _id: c._id, 
        commentId: c.commentId,
        commentIdType: typeof c.commentId,
        penname: c.penname
      })));
      
      return commentsWithStringIds;
    } catch (error) {
      console.error('댓글 조회 오류:', error);
      return [];
    }
  },

  // 댓글 작성
  addComment: async (poemId, content) => {
    const response = await api.post(`/api/comments/poems/${poemId}`, { content });
    return response.data;
  },

  // 댓글 수정
  updateComment: async (commentId, content) => {
    const response = await api.put(`/api/comments/${commentId}`, { content });
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (commentId) => {
    const response = await api.delete(`/api/comments/${commentId}`);
    return response.data;
  },

  // 북마크 추가
  addBookmark: async (poemId) => {
    try {
      // 입력값 검증
      if (!poemId) {
        console.error('유효하지 않은 시 ID:', poemId);
        throw new Error('유효하지 않은 시 ID입니다.');
      }
      
      // 문자열로 확실하게 변환
      let normalizedPoemId = String(poemId);
      
      // 특수문자 검사
      if (/[^a-zA-Z0-9]/.test(normalizedPoemId)) {
        console.warn('ID에 특수문자가 포함되어 있습니다:', normalizedPoemId);
      }
      
      console.log('북마크 추가 요청:', {
        원본ID: poemId,
        변환ID: normalizedPoemId
      });
      
      const url = `/api/bookmarks/poems/${normalizedPoemId}`;
      console.log(`API 호출 URL: ${url}`);
      
      const response = await api.post(url);
      console.log('북마크 추가 성공 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('북마크 추가 오류:', error);
      if (error.response) {
        console.error('서버 응답 상태:', error.response.status);
        console.error('서버 응답 데이터:', error.response.data);
      }
      throw error;
    }
  },

  // 북마크 제거
  removeBookmark: async (poemId) => {
    try {
      // 입력값 검증
      if (!poemId) {
        console.error('유효하지 않은 시 ID:', poemId);
        throw new Error('유효하지 않은 시 ID입니다.');
      }
      
      // 문자열로 확실하게 변환
      let normalizedPoemId = String(poemId);
      
      // 특수문자 검사
      if (/[^a-zA-Z0-9]/.test(normalizedPoemId)) {
        console.warn('ID에 특수문자가 포함되어 있습니다:', normalizedPoemId);
      }
      
      console.log('북마크 제거 요청:', {
        원본ID: poemId,
        변환ID: normalizedPoemId
      });
      
      const url = `/api/bookmarks/poems/${normalizedPoemId}`;
      console.log(`API 호출 URL: ${url}`);
      
      const response = await api.delete(url);
      console.log('북마크 제거 성공 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('북마크 제거 오류:', error);
      if (error.response) {
        console.error('서버 응답 상태:', error.response.status);
        console.error('서버 응답 데이터:', error.response.data);
      }
      throw error;
    }
  },

  // 북마크 상태 확인
  checkBookmarkStatus: async (poemId) => {
    try {
      // 입력값 검증
      if (!poemId) {
        console.warn('유효하지 않은 시 ID로 북마크 상태 확인 시도');
        return { isBookmarked: false };
      }
      
      // 문자열로 확실하게 변환
      let normalizedPoemId = String(poemId);
      
      console.log('북마크 상태 확인 요청:', {
        원본ID: poemId,
        변환ID: normalizedPoemId
      });
      
      const url = `/api/bookmarks/${normalizedPoemId}/status`;
      console.log(`API 호출 URL: ${url}`);
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('북마크 상태 확인 오류:', error);
      return { isBookmarked: false };
    }
  },

  // 북마크한 시 목록 조회
  getBookmarkedPoems: async () => {
    try {
      const response = await api.get(`/api/bookmarks/my`);
      return response.data;
    } catch (error) {
      console.error('북마크 목록 조회 오류:', error);
      return [];
    }
  },

  // 감정 태그 생성
  createEmotionTag: async (tagData) => {
    try {
      console.log('감정 태그 생성 요청:', tagData);
      const response = await api.post('/api/hashtags/emotions', tagData);
      console.log('감정 태그 생성 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('감정 태그 생성 오류:', error.response?.data || error.message);
      throw error;
    }
  },

  // 감정 태그 조회
  getEmotionTags: async () => {
    try {
      console.log('감정 태그 조회 요청');
      const response = await api.get('/api/hashtags/emotions');
      console.log('감정 태그 조회 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('감정 태그 조회 오류:', error.response?.data || error.message);
      return [];
    }
  }
};

export default interactionService; 