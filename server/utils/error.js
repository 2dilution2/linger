/**
 * 사용자 정의 에러 생성 함수
 * @param {number} status HTTP 상태 코드
 * @param {string} message 에러 메시지
 * @returns {Error} 생성된 에러 객체
 */
export const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * 요청 검증 실패 에러 생성 함수
 * @param {string} message 에러 메시지
 * @returns {Error} 생성된 에러 객체
 */
export const createValidationError = (message) => {
  return createError(400, message || '입력값이 올바르지 않습니다.');
};

/**
 * 권한 없음 에러 생성 함수
 * @param {string} message 에러 메시지
 * @returns {Error} 생성된 에러 객체
 */
export const createForbiddenError = (message) => {
  return createError(403, message || '권한이 없습니다.');
};

/**
 * 리소스 찾을 수 없음 에러 생성 함수
 * @param {string} message 에러 메시지
 * @returns {Error} 생성된 에러 객체
 */
export const createNotFoundError = (message) => {
  return createError(404, message || '요청한 리소스를 찾을 수 없습니다.');
};

/**
 * 서버 내부 에러 생성 함수
 * @param {string} message 에러 메시지
 * @returns {Error} 생성된 에러 객체
 */
export const createServerError = (message) => {
  return createError(500, message || '서버 내부 오류가 발생했습니다.');
}; 