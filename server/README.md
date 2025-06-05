# Linger - 시 공유 플랫폼 백엔드

## 기술 스택

- Node.js
- Express.js
- MongoDB
- RabbitMQ
- JWT 인증

## 주요 기능

### 1. 사용자 관리
- 회원가입/로그인
- 프로필 관리
- 팔로우/팔로잉

### 2. 시 관리
- 시 작성/수정/삭제
- 배경 및 폰트 커스터마이징
  - 배경 타입: 그라데이션, 기본 제공 사진, 사용자 업로드
  - 폰트 타입: 고딕체, 손글씨체, 붓글씨체
- 해시태그 관리
- 좋아요/북마크
- 인기도 기반 정렬

### 3. 댓글 시스템
- 댓글 작성/수정/삭제
- 댓글 좋아요

### 4. 알림 시스템
- 실시간 알림 (RabbitMQ 기반)
- 좋아요/댓글/팔로우 알림

### 5. 신고 시스템
- 시/댓글/사용자 신고
- 신고 사유: 스팸, 부적절한 내용, 저작권 침해, 기타
- 관리자용 신고 처리 기능

## API 엔드포인트

### 인증
- `POST /api/users/register` - 회원가입
- `POST /api/users/login` - 로그인
- `GET /api/users/me` - 내 정보 조회

### 사용자
- `GET /api/users/:userId` - 사용자 정보 조회
- `PUT /api/users/profile` - 프로필 수정
- `GET /api/users/:userId/poems` - 사용자의 시 목록 조회

### 시
- `POST /api/poems` - 시 작성
- `GET /api/poems/:poemId` - 시 상세 조회
- `PUT /api/poems/:poemId` - 시 수정
- `DELETE /api/poems/:poemId` - 시 삭제
- `GET /api/poems` - 시 목록 조회 (페이지네이션, 정렬 옵션)

### 좋아요
- `POST /api/likes/poems/:poemId` - 시 좋아요
- `DELETE /api/likes/poems/:poemId` - 시 좋아요 취소
- `GET /api/likes/poems/:poemId` - 시 좋아요 상태 확인

### 댓글
- `POST /api/comments/poems/:poemId` - 댓글 작성
- `GET /api/comments/poems/:poemId` - 댓글 목록 조회
- `PUT /api/comments/:commentId` - 댓글 수정
- `DELETE /api/comments/:commentId` - 댓글 삭제

### 북마크
- `POST /api/bookmarks/poems/:poemId` - 시 북마크
- `DELETE /api/bookmarks/poems/:poemId` - 시 북마크 취소
- `GET /api/bookmarks/my` - 내 북마크 목록 조회
- `GET /api/bookmarks/poems/:poemId/check` - 북마크 상태 확인

### 팔로우
- `POST /api/follows/users/:userId` - 사용자 팔로우
- `DELETE /api/follows/users/:userId` - 사용자 언팔로우
- `GET /api/follows/following` - 내 팔로잉 목록
- `GET /api/follows/followers` - 내 팔로워 목록
- `GET /api/follows/users/:userId/check` - 팔로우 상태 확인

### 알림
- `GET /api/notifications` - 알림 목록 조회
- `PUT /api/notifications/:notificationId/read` - 알림 읽음 처리
- `PUT /api/notifications/read-all` - 모든 알림 읽음 처리
- `DELETE /api/notifications/:notificationId` - 알림 삭제
- `GET /api/notifications/unread/count` - 읽지 않은 알림 개수 조회

### 신고
- `POST /api/reports` - 신고 생성
- `GET /api/reports` - 신고 목록 조회 (관리자용)
- `PUT /api/reports/:reportId` - 신고 상태 업데이트 (관리자용)

## 환경 설정

### 필수 환경 변수
```
# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/linger

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# RabbitMQ 설정
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# 서버 설정
PORT=4003
NODE_ENV=development
```

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 수정하여 필요한 설정을 입력
```

3. 서버 실행
```bash
npm run dev
```

## 보안

- 모든 API는 JWT 토큰 기반 인증을 사용
- 비밀번호는 bcrypt로 해시화하여 저장
- 민감한 정보는 환경 변수로 관리
- 관리자 권한 확인 미들웨어 구현

## 에러 처리

- 모든 API는 일관된 에러 응답 형식 사용
- HTTP 상태 코드와 함께 에러 메시지 제공
- 상세한 에러 로깅

## 성능 최적화

- MongoDB 인덱스 사용
- 페이지네이션 구현
- RabbitMQ를 통한 비동기 알림 처리
- 인기도 기반 캐싱

## API 문서

Swagger UI를 통해 API 문서 확인 가능:
```
http://localhost:4003/api-docs
``` 