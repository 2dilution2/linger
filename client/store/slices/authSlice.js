import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 초기 상태 정의
const initialState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 로그인 시작
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // 로그인 성공
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
    },
    // 로그인 실패
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // 로그아웃
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
    // 사용자 정보 업데이트
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // 인증 상태 복원
    restoreAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
  },
});

// 액션 내보내기
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  restoreAuth,
} = authSlice.actions;

// 선택자 함수
export const selectAuth = (state) => state.auth;
export const selectIsLoggedIn = (state) => !!state.auth.token;
export const selectUser = (state) => state.auth.user;

// 비동기 액션 생성자들
export const loadStoredAuth = () => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      dispatch(restoreAuth({ token, user }));
    }
  } catch (error) {
    console.error('Failed to load auth state:', error);
  }
};

export const loginUserSuccess = (userData) => async (dispatch) => {
  try {
    // AsyncStorage에 데이터 저장
    await AsyncStorage.setItem('token', userData.token);
    await AsyncStorage.setItem('user', JSON.stringify(userData.user));
    
    // 리듀서 액션 디스패치
    dispatch(loginSuccess(userData));
  } catch (error) {
    console.error('Failed to save auth data:', error);
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // 먼저 리듀서 액션 디스패치 (UI 상태 초기화)
    dispatch(logout());
    
    // 그 다음 AsyncStorage에서 데이터 삭제
    const promises = [
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user')
    ];
    
    // Promise.allSettled를 사용하여 일부 실패해도 계속 진행
    const results = await Promise.allSettled(promises);
    
    // 결과 로깅
    results.forEach((result, index) => {
      const key = index === 0 ? 'token' : 'user';
      if (result.status === 'fulfilled') {
        console.log(`${key} 삭제 성공`);
      } else {
        console.error(`${key} 삭제 실패:`, result.reason);
      }
    });
    
    console.log('로그아웃 처리 완료');
    return true;
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    // 오류가 발생해도 UI는 로그아웃 상태로 유지
    return false;
  }
};

export const updateProfile = (profileData) => async (dispatch, getState) => {
  try {
    dispatch(updateUserProfile(profileData));
    
    // 현재 상태에서 업데이트된 사용자 정보 가져오기
    const updatedUser = getState().auth.user;
    
    // AsyncStorage에 업데이트된 사용자 정보 저장
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Failed to update profile data:', error);
  }
};

export default authSlice.reducer; 