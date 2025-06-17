import api from './api';

// 시(Poem) 서비스
const poemService = {
  // 모든 시 조회
  getAllPoems: async () => {
    try {
      const response = await api.get('/api/poems');
      return response.data;
    } catch (error) {
      console.error('시 목록 가져오기 실패:', error);
      
      // 서버 오류 발생 시 더미 데이터 반환
      return [
        {
          id: 'poem-1',
          title: '봄날의 꿈',
          content: '봄바람에 흩날리는\n벚꽃처럼 설레이는\n그대를 향한 내 마음',
          authorId: 'user-1',
          author: { penname: '봄의시인' },
          emotionTags: ['설렘', '사랑'],
          likeCount: 24,
          commentCount: 5,
          isBookmarked: false,
          background: '#f9f9f9'
        },
        {
          id: 'poem-2',
          title: '비 오는 날의 기억',
          content: '창가에 부딪히는\n빗방울 소리에\n젖어드는 추억들',
          authorId: 'user-2',
          author: { penname: '빗방울' },
          emotionTags: ['그리움', '우울'],
          likeCount: 13,
          commentCount: 2,
          isBookmarked: false,
          background: '#f0f5ff'
        },
        {
          id: 'poem-3',
          title: '별이 빛나는 밤',
          content: '어둠 속에서도\n반짝이는 별들처럼\n우리의 희망도 빛나리',
          authorId: 'user-3',
          author: { penname: '별빛' },
          emotionTags: ['희망', '위로'],
          likeCount: 43,
          commentCount: 12,
          isBookmarked: false,
          background: '#f5f0ff'
        }
      ];
    }
  },

  // 특정 시 조회
  getPoemById: async (poemId) => {
    try {
      // poemId가 없는 경우 에러 처리
      if (!poemId) {
        console.error('시 ID가 없습니다.');
        throw new Error('유효하지 않은 시 ID입니다.');
      }
      
      console.log(`시 상세 정보 요청. ID: ${poemId}`);
      const response = await api.get(`/api/poems/${poemId}`);
      
      // 응답 데이터 정규화
      const poem = response.data;
      const normalizedPoem = {
        ...poem,
        id: poem._id || poem.id,
        authorId: poem.author?._id || poem.authorId || poem.author
      };
      
      console.log(`시 상세 정보 로드 성공. 제목: ${normalizedPoem.title}`);
      return normalizedPoem;
    } catch (error) {
      console.error('시 데이터 조회 실패:', error.message, error.response?.data);
      throw error;
    }
  },

  // 새 시 작성
  createPoem: async (poemData) => {
    const response = await api.post('/api/poems', poemData);
    return response.data;
  },

  // 시 수정
  updatePoem: async (poemId, poemData) => {
    const response = await api.put(`/api/poems/${poemId}`, poemData);
    return response.data;
  },

  // 시 삭제
  deletePoem: async (poemId) => {
    const response = await api.delete(`/api/poems/${poemId}`);
    return response.data;
  },

  // 특정 사용자의 시 조회
  getUserPoems: async (userId) => {
    try {
      const response = await api.get(`/api/poems/user/${userId}`);
      // 응답 데이터를 정규화하여 ID 형식 일관성 보장
      const normalizedPoems = response.data.map(poem => ({
        ...poem,
        id: poem._id || poem.id, // MongoDB의 _id 또는 이미 있는 id 사용
        authorId: poem.author?._id || poem.authorId || poem.author,
      }));
      return normalizedPoems;
    } catch (error) {
      console.error('사용자 시 조회 오류:', error);
      return [];
    }
  },

  // 시 좋아요 수 조회
  getPoemLikes: async (poemId) => {
    try {
      const response = await api.get(`/api/likes/poems/${poemId}/users`);
      return {
        likes: response.data.length
      };
    } catch (error) {
      console.error('시 좋아요 조회 오류:', error);
      return { likes: 0 };
    }
  },

  // 추천 시 목록 조회
  getRecommendedPoems: async () => {
    try {
      const response = await api.get('/api/poems/recommended');
      return response.data;
    } catch (error) {
      console.error('추천 시 조회 오류:', error);
      // 서버 오류 발생 시 더미 데이터 반환
      return [
        {
          id: 'poem-4',
          title: '가을의 노래',
          content: '단풍잎 물들어가는\n가을의 정원에서\n그대를 기다립니다',
          authorId: 'user-4',
          author: { penname: '가을소년' },
          emotionTags: ['그리움', '사랑'],
          likeCount: 65,
          commentCount: 8,
          isBookmarked: false,
          background: '#fff5f0'
        },
        {
          id: 'poem-5',
          title: '겨울 바다',
          content: '차가운 파도 위에\n흰 눈이 내리는\n겨울 바다의 고요',
          authorId: 'user-5',
          author: { penname: '바다소리' },
          emotionTags: ['평온', '고독'],
          likeCount: 52,
          commentCount: 4,
          isBookmarked: false,
          background: '#f0faff'
        }
      ];
    }
  },

  // 달력 기준 시 조회
  getPoemsByDate: async (year, month) => {
    try {
      const response = await api.get(`/api/poems/calendar?year=${year}&month=${month}`);
      return response.data;
    } catch (error) {
      console.error('날짜별 시 조회 오류:', error);
      
      // 401 인증 오류 발생 시 달력용 더미 데이터 반환
      // 달력 형식: { 날짜: [시 목록] } 형태의 객체
      const dummyData = {};
      
      // 해당 월의 몇몇 날짜에 시 데이터 추가 (예시)
      dummyData[5] = [{
        id: 'poem-10',
        title: '봄비',
        content: '창가에 내리는 봄비\n새싹을 깨우는 소리',
        authorId: 'user-1',
        emotionTags: ['평온', '설렘']
      }];
      
      dummyData[12] = [{
        id: 'poem-11',
        title: '별빛 아래',
        content: '밤하늘 별빛 아래\n꿈꾸는 나의 마음',
        authorId: 'user-1',
        emotionTags: ['희망', '평온']
      }];
      
      dummyData[18] = [{
        id: 'poem-12',
        title: '하루의 끝',
        content: '지나간 하루의 끝\n고요한 밤이 찾아오네',
        authorId: 'user-1',
        emotionTags: ['평온', '감사']
      }];
      
      dummyData[25] = [{
        id: 'poem-13',
        title: '햇살 아래',
        content: '따스한 햇살 아래\n피어나는 작은 기쁨',
        authorId: 'user-1',
        emotionTags: ['기쁨', '감사']
      }, {
        id: 'poem-14',
        title: '바람의 노래',
        content: '귓가를 스치는\n바람의 노래',
        authorId: 'user-1',
        emotionTags: ['그리움', '평온']
      }];
      
      return dummyData;
    }
  },
  
  // 감정 통계 조회
  getEmotionStats: async () => {
    try {
      console.log('감정 통계 데이터 요청');
      const response = await api.get('/api/poems/analytics/emotions');
      console.log('감정 통계 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('감정 통계 조회 오류:', error.response?.data || error.message);
      
      // 오류 시 기본 데이터 반환 (사용자 경험 유지)
      return [
        { name: '기쁨', percentage: 35, color: '#ffd43b' },
        { name: '슬픔', percentage: 25, color: '#74c0fc' },
        { name: '그리움', percentage: 20, color: '#a5d8ff' },
        { name: '사랑', percentage: 15, color: '#ff8787' },
        { name: '불안', percentage: 5, color: '#c0eb75' }
      ];
    }
  },
  
  // 자주 사용된 단어 조회
  getFrequentWords: async () => {
    try {
      console.log('자주 사용된 단어 데이터 요청');
      const response = await api.get('/api/poems/analytics/words');
      console.log('자주 사용된 단어 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('자주 사용된 단어 조회 오류:', error.response?.data || error.message);
      
      // 오류 시 기본 데이터 반환 (사용자 경험 유지)
      return [
        { word: '사랑', count: 42 },
        { word: '꿈', count: 38 },
        { word: '마음', count: 35 },
        { word: '별', count: 30 },
        { word: '기억', count: 27 }
      ];
    }
  }
};

export default poemService; 