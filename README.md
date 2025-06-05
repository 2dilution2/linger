# 시가 머무는 순간 (Linger)

> "감정이 머무는 찰나, 시가 된다."
> "where your memories become poems"

## 📱 프로젝트 소개

Linger는 감정이 북받칠 때 누구나 필명으로 시를 쓰고 공유할 수 있는 감성 커뮤니티 플랫폼입니다. 
사용자들은 자신만의 감성적인 배경과 폰트를 선택하여 시를 작성하고, 
다른 사용자들과 감정을 공유하며 소통할 수 있습니다.

## 🚀 주요 기능

### ✍️ 시 작성
- 필명(penname) 기반 익명/공개 활동
- 커스터마이징 가능한 배경 테마 (사진, 그라데이션, 직접 업로드)
- 다양한 감성 폰트 제공 (고딕, 손글씨, 붓글씨 등)
- 감정 태그 시스템 (#기쁨 #그리움 #불안 #사랑)
- 구(句) 기능으로 짧은 감정 표현
  - 한 줄 시 작성
  - 실시간 구 공유
  - 구 모음집 생성
  - 구 기반 감정 분석

### 📅 시가 머문 순간 (후순위)
- 월간 달력 UI로 시 작성 기록 관리
- 감정 기반 색상/아이콘 표시
- 시 미리보기 및 상세 페이지 연동
- 감성 메시지 시스템

### 📖 커뮤니티
- 감정/테마별 피드 분류
- 일간/주간/월간 인기 시 큐레이션
- 댓글, 공감, 즐겨찾기 기능
- 핀 시스템으로 특별한 시 보관
- 구독 기능
  - 시인/작가 구독
  - 구독자 피드
  - 구독 알림
  - 구독자 통계

### 📊 감정 분석(후순위)
- 월간 감정 태그 통계 시각화
- 자주 사용된 단어 분석
- 감정 변화 추적
- 과거 시 회고 기능

### 🤖 AI 보조 기능
- 시 작성 보조
- 감정 기반 추천 시스템
- 유사 감정 사용자 매칭

## 🧭 Linger UI 구조

> 아래는 주요 기능 흐름에 따른 화면 구성입니다.

### 📱 메인 네비게이션 (Bottom Tab)

| 탭 | 화면 구성 |
|----|-----------|
| 🖋 시 쓰기 | WritePoemScreen |
| 📅 시가 머문 순간 | CalendarScreen |
| 💬 커뮤니티 | CommunityFeedScreen |
| 📊 감정 분석 | EmotionAnalyticsScreen |
| 👤 마이페이지 | ProfileScreen |

---

### 🖋 시 쓰기 (`WritePoemScreen`)
- 배경/폰트 선택 (커스터마이징)
- 시 작성 + 감정 태그 선택
- "구" 작성 및 실시간 공유
- AI 보조 기능
- 공개/비공개 전환

### 📅 시가 머문 순간 (`CalendarScreen`)(후순위)
- 달력 기반 시 기록 관리
- 감정 태그 색상 표시
- 시 미리보기 → 상세 이동
- 감성 메시지 제공

### 💬 커뮤니티 (`CommunityFeedScreen`)
- 감정/테마별 피드
- 인기 시 큐레이션
- 댓글, 공감, 핀, 즐겨찾기
- 작가 구독 기능

### 📊 감정 분석 (`EmotionAnalyticsScreen`)(후순위)
- 감정 사용 통계 시각화
- 단어 분석/클라우드
- 감정 변화 추적
- 회고 기능 제공

### 👤 마이페이지 (`ProfileScreen`)
- 나의 시/핀/비공개 목록
- 구독자 / 구독 목록
- 감정 분석 요약
- 설정 (다크모드 등)

---

## 🏗️ 프로젝트 구조

```
linger/
├── client/                 # 프론트엔드 (React Native)
│   ├── assets/             # 이미지, 폰트 등 정적 자산
│   ├── components/         # 공통 컴포넌트 (Button, Modal 등)
│   ├── features/           # 기능 단위 (slice, API 등)
│   ├── hooks/              # 커스텀 훅
│   ├── navigation/         # React Navigation 관련 설정
│   ├── screens/            # 화면 단위 컴포넌트
│   ├── store/              # Redux store 설정
│   ├── styles/             # 전역 스타일 및 테마
│   ├── types/              # 전역 타입 정의
│   ├── utils/              # 유틸 함수
│   └── App.tsx             # 진입점 컴포넌트
│
├── server/                 # 백엔드
│   ├── config/             # 환경변수, DB 연결 설정 등
│   ├── controllers/        # 라우터에서 호출되는 비즈니스 로직
│   ├── middlewares/        # 공통 미들웨어 (auth, error handling 등)
│   ├── models/             # Mongoose 모델
│   ├── routes/             # REST API 라우팅 정의
│   ├── services/           # 서비스 계층 (AI, 감정 분석 등)
│   ├── utils/              # 공통 유틸 함수
│   ├── app.js              # Express 앱 설정
│
├── shared/                 # 클라이언트와 서버 공용 타입 또는 유틸
│   ├── types/              # 공통 타입
│   └── constants.ts        # 공용 상수 정의
│
├── .env                    # 환경 변수 파일
├── .gitignore              # Git 무시 파일
├── README.md               # 프로젝트 설명
└── package.json            # 루트용 스크립트 (concurrently 등)
```

## 🛠️ 기술 스택

### Frontend
- ReactNative
- TypeScript
- Styled-components
- Redux Toolkit

### Backend
- Node.js
- Express
- MongoDB
- JWT

## 📚 추가 기능 계획

### 시집 프로젝트
- TOP 100 시 큐레이션
- 디지털/실물 시집 출간
- 창작자 수익 배분 시스템

### 개인화 기능
- 다크모드/계절 테마
- 커스텀 폰트/배경 마켓
- 시간대 반응형 UI

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참조해주세요.