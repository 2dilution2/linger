import api from './api';

// 사용자 서비스
const userService = {
  // 로그인
  login: async (email, password) => {
    const response = await api.post('/api/users/login', { email, password });
    return response.data;
  },

  // 회원가입
  register: async (userData) => {
    try {
      console.log('회원가입 요청 시작:', userData);
      
      // 이미지가 있는 경우 FormData 사용, 없으면 일반 JSON 요청
      if (userData.profileImage) {
        console.log('이미지 있음, FormData 사용');
        const formData = new FormData();
        
        // FormData에 사용자 정보 추가
        Object.keys(userData).forEach(key => {
          if (key === 'profileImage' && userData[key]) {
            formData.append(key, userData[key]);
            console.log('이미지 추가:', key, typeof userData[key]);
          } else if (userData[key] !== undefined) {
            formData.append(key, userData[key]);
            console.log('데이터 추가:', key, userData[key]);
          }
        });
        
        // 서버 요청
        const response = await api.post('/api/users/join', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('회원가입 성공 (FormData):', response.data);
        return response.data;
      } else {
        // 이미지 없을 때 일반 JSON 요청
        console.log('이미지 없음, JSON 요청');
        const response = await api.post('/api/users/join', userData);
        console.log('회원가입 성공 (JSON):', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('회원가입 요청 오류:', error);
      console.log('에러 세부정보:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // 사용자 프로필 조회
  getUserProfile: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (profileData) => {
    try {
      // 이미지가 있는 경우 FormData 사용, 없으면 일반 JSON 요청
      if (profileData.profileImage && typeof profileData.profileImage === 'object') {
        const formData = new FormData();
        
        // FormData에 프로필 정보 추가
        Object.keys(profileData).forEach(key => {
          if (key === 'profileImage' && profileData[key]) {
            formData.append(key, profileData[key]);
          } else if (profileData[key] !== undefined) {
            formData.append(key, profileData[key]);
          }
        });
        
        // 서버 요청
        const response = await api.put('/api/users/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      } else {
        // 이미지 없을 때 일반 JSON 요청
        const response = await api.put('/api/users/profile', profileData);
        return response.data;
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      throw error;
    }
  },

  // 비밀번호 변경
  changePassword: async (passwordData) => {
    const response = await api.put('/api/users/password', passwordData);
    return response.data;
  },
  
  // 필명 중복 체크
  checkPennameAvailability: async (penname) => {
    try {
      const response = await api.get(`/api/users/check-penname?penname=${encodeURIComponent(penname)}`);
      return response.data;
    } catch (error) {
      console.error('필명 중복 확인 오류:', error);
      if (error.response && error.response.status === 409) {
        return { available: false, message: '이미 사용 중인 필명입니다.' };
      }
      throw error;
    }
  }
};

export default userService; 