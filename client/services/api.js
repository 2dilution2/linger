import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 개발 서버의 IP 주소 설정
// 로컬 네트워크에서 사용할 IP 주소
const LOCAL_IP = '192.168.0.81';
// localhost 서버
const LOCALHOST = 'localhost';
// 서버 포트
const SERVER_PORT = 4003;

// 환경변수에서 API URL을 가져옴 (환경 별 설정)
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

// API 기본 URL 설정 - Platform에 따라 다르게 설정
const API_BASE_URL = ENV_API_URL || Platform.select({
  // iOS 시뮬레이터: localhost 사용
  ios: `http://${LOCALHOST}:${SERVER_PORT}`,
  // Android 에뮬레이터: 10.0.2.2 (에뮬레이터의 localhost)
  android: `http://10.0.2.2:${SERVER_PORT}`,
  // Expo 웹: localhost 사용
  web: `http://${LOCALHOST}:${SERVER_PORT}`,
  // 기본값 (실제 기기 테스트 등): 로컬 IP 사용
  default: `http://${LOCAL_IP}:${SERVER_PORT}`,
});

console.log(`API 서버 URL: ${API_BASE_URL}, 플랫폼: ${Platform.OS}`);

// 401 에러 발생 시 호출될 콜백 함수
let unauthorizedCallback = null;

// 401 에러 처리 콜백 설정 함수
export const setUnauthorizedCallback = (callback) => {
  unauthorizedCallback = callback;
};

// API 클라이언트 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  // 타임아웃 설정
  timeout: 15000,
  // withCredentials: true - CORS 설정에 따라 필요하면 활성화
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // URL이 없는 경우 처리
      const url = config.url || '알 수 없는 경로';
      
      // 토큰이 없는 상태에서 /api/users/me나 사용자 관련 API 호출이 있다면 요청 차단
      if (!token) {
        // 인증이 필요한 엔드포인트 목록
        const authRequiredEndpoints = [
          '/api/users/me',
          '/api/poems/user/me',
          '/api/users/profile',
          '/api/bookmarks/',
          '/api/likes/',
          '/api/follows/',
          '/api/comments/',
          '/api/notifications/',
          '/api/hashtags/'
        ];
        
        // 요청 URL이 인증 필요 엔드포인트 중 하나라면
        if (authRequiredEndpoints.some(endpoint => url.includes(endpoint))) {
          console.log('로그아웃 상태에서 인증 필요 API 호출 차단:', url);
          // 요청 취소 (대체 Promise 반환)
          return Promise.reject({
            response: {
              status: 401,
              data: { message: '인증이 필요합니다' }
            },
            message: '로그아웃 상태에서 인증 필요 API 호출이 차단되었습니다.',
            url: url
          });
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 간단한 로깅만 유지
      console.log('API 요청:', {
        url,
        method: config.method,
        baseURL: config.baseURL
      });
    } catch (error) {
      console.error('토큰 가져오기 오류:', error);
    }
    return config;
  },
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', {
      url: response.config.url,
      status: response.status
    });
    
    return response;
  },
  async (error) => {
    const errorInfo = {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    };
    
    console.error('API 응답 오류:', errorInfo);
    
    // 401 오류 (인증 실패) 처리
    if (error.response && error.response.status === 401) {
      // 토큰 삭제
      try {
        await AsyncStorage.removeItem('token');
        // 설정된 콜백 함수가 있으면 호출
        if (unauthorizedCallback) {
          unauthorizedCallback();
        }
      } catch (storageError) {
        console.error('토큰 삭제 오류:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 