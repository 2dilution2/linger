/**
 * 중앙 집중식 에러 핸들링 미들웨어
 * 모든 에러를 이 미들웨어로 전달하여 사용자에게 적절한 응답을 제공합니다.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('에러 발생:', err);

  // 기본 에러 응답
  const errorResponse = {
    message: err.message || '서버 오류가 발생했습니다.',
    status: err.status || 500
  };

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(errorResponse.status).json(errorResponse);
};

/**
 * Not Found (404) 에러 핸들러
 * 존재하지 않는 API 엔드포인트에 대한 요청 처리
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export default {
  errorHandler,
  notFoundHandler
}; 