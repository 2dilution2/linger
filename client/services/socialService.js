import api from './api';

// 소셜 서비스 (팔로우, 알림 등)
const socialService = {
  // 사용자 팔로우
  followUser: async (userId) => {
    const response = await api.post(`/api/follows/users/${userId}`);
    return response.data;
  },

  // 사용자 언팔로우
  unfollowUser: async (userId) => {
    const response = await api.delete(`/api/follows/users/${userId}`);
    return response.data;
  },

  // 팔로우 상태 확인
  checkFollowStatus: async (userId) => {
    try {
      const response = await api.get(`/api/follows/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('팔로우 상태 확인 오류:', error);
      return { isFollowing: false };
    }
  },

  // 팔로워 목록 조회
  getFollowers: async (userId) => {
    try {
      const response = await api.get(`/api/follows/users/${userId}/followers`);
      return response.data;
    } catch (error) {
      console.error('팔로워 목록 조회 오류:', error);
      return [];
    }
  },

  // 팔로잉 목록 조회
  getFollowing: async (userId) => {
    try {
      const response = await api.get(`/api/follows/users/${userId}/following`);
      return response.data;
    } catch (error) {
      console.error('팔로잉 목록 조회 오류:', error);
      return [];
    }
  },

  // 팔로우한 사용자들의 시 조회
  getFollowingPoems: async () => {
    try {
      const response = await api.get('/api/poems/feed');
      return response.data.poems || response.data; // 서버 응답 구조에 따라 다르게 처리
    } catch (error) {
      console.error('팔로잉 시 목록 조회 오류:', error);
      
      // 서버 오류 발생 시 더미 데이터 반환
      return [
        {
          id: 'poem-6',
          title: '햇살의 기억',
          content: '창가에 내리는 햇살\n따스한 온기에\n그리운 그 날의 기억',
          authorId: 'user-6',
          author: { penname: '햇살소녀' },
          emotionTags: ['그리움', '평온'],
          likeCount: 18,
          commentCount: 3,
          isBookmarked: true,
          background: '#fffbf0'
        },
        {
          id: 'poem-7',
          title: '밤하늘의 별',
          content: '어두운 밤하늘에\n반짝이는 별들처럼\n내 마음속 빛나는 희망',
          authorId: 'user-7',
          author: { penname: '밤하늘' },
          emotionTags: ['희망', '감사'],
          likeCount: 32,
          commentCount: 7,
          isBookmarked: false,
          background: '#f0f0ff'
        }
      ];
    }
  },

  // 알림 목록 조회
  getNotifications: async () => {
    try {
      const response = await api.get('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('알림 목록 조회 오류:', error);
      return [];
    }
  },

  // 알림 읽음 처리
  markNotificationRead: async (notificationId) => {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // 모든 알림 읽음 처리
  markAllNotificationsRead: async () => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },

  // 사용자 신고
  reportUser: async (userId, reason) => {
    const response = await api.post(`/api/reports/user/${userId}`, { reason });
    return response.data;
  },

  // 시 신고
  reportPoem: async (poemId, reason) => {
    const response = await api.post(`/api/reports/poem/${poemId}`, { reason });
    return response.data;
  },

  // 댓글 신고
  reportComment: async (commentId, reason) => {
    const response = await api.post(`/api/reports/comment/${commentId}`, { reason });
    return response.data;
  },

  // 인기 사용자 목록 조회
  getPopularUsers: async () => {
    try {
      const response = await api.get('/api/users/popular');
      return response.data;
    } catch (error) {
      console.error('인기 사용자 목록 조회 오류:', error);
      return [];
    }
  },

  // 사용자 검색
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      return [];
    }
  }
};

export default socialService; 