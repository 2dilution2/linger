import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// 리덕스 스토어 생성
const store = configureStore({
  reducer: {
    auth: authReducer,
    // 다른 리듀서 추가 가능
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 비직렬화 가능한 값에 대한 경고 무시 (필요에 따라 추가)
        ignoredActions: ['some/action'],
        ignoredPaths: ['some.path'],
      },
    }),
});

export default store; 