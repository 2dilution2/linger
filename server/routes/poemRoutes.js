import express from 'express';
import {
  getAllPoems,
  getPoemById,
  createPoem,
  updatePoem,
  deletePoem,
  getUserPoems,
  getRecommendedPoems,
  getMyPoems,
  getFollowingFeed,
  getCalendarPoems,
  getEmotionStats,
  getFrequentWords
} from '../controllers/poemController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/poems:
 *   get:
 *     tags: [Poems]
 *     summary: 모든 시 조회
 *     responses:
 *       200:
 *         description: 시 목록 조회 성공
 */
router.get('/', getAllPoems);

/**
 * @swagger
 * /api/poems/recommended:
 *   get:
 *     tags: [Poems]
 *     summary: 추천 시 목록 조회
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 반환할 시 개수
 *     responses:
 *       200:
 *         description: 추천 시 목록 조회 성공
 */
router.get('/recommended', getRecommendedPoems);

/**
 * @swagger
 * /api/poems/feed:
 *   get:
 *     tags: [Poems]
 *     summary: 구독자 피드 조회 (팔로우한 작가의 시)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 시 개수
 *     responses:
 *       200:
 *         description: 구독자 피드 조회 성공
 */
router.get('/feed', auth, getFollowingFeed);

/**
 * @swagger
 * /api/poems/calendar:
 *   get:
 *     tags: [Poems]
 *     summary: 날짜별 시 조회 (캘린더 뷰)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: 년도
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: 월 (1-12)
 *     responses:
 *       200:
 *         description: 날짜별 시 조회 성공
 */
router.get('/calendar', auth, getCalendarPoems);

/**
 * @swagger
 * /api/poems/user/{userId}:
 *   get:
 *     tags: [Poems]
 *     summary: 특정 사용자의 시 조회
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 시 목록 조회 성공
 */
router.get('/user/:userId', getUserPoems);

/**
 * @swagger
 * /api/poems/{id}:
 *   get:
 *     tags: [Poems]
 *     summary: 특정 시 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 시 조회 성공
 */
router.get('/:id', getPoemById);

/**
 * @swagger
 * /api/poems:
 *   post:
 *     tags: [Poems]
 *     summary: 새 시 작성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               emotionTags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *               background:
 *                 type: string
 *                 enum: [gradient, photo, custom]
 *                 default: gradient
 *                 description: 배경 타입 (gradient, photo, custom)
 *               backgroundImage:
 *                 type: string
 *                 description: 배경 이미지 URL (background가 photo 또는 custom인 경우 필수)
 *               font:
 *                 type: string
 *                 enum: [gothic, handwriting, brush]
 *                 default: gothic
 *                 description: 폰트 타입 (gothic, handwriting, brush)
 *     responses:
 *       201:
 *         description: 시 작성 성공
 */
router.post('/', auth, createPoem);

/**
 * @swagger
 * /api/poems/{id}:
 *   put:
 *     tags: [Poems]
 *     summary: 시 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               emotionTags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *               background:
 *                 type: string
 *                 enum: [gradient, photo, custom]
 *                 description: 배경 타입 (gradient, photo, custom)
 *               backgroundImage:
 *                 type: string
 *                 description: 배경 이미지 URL (background가 photo 또는 custom인 경우 필수)
 *               font:
 *                 type: string
 *                 enum: [gothic, handwriting, brush]
 *                 description: 폰트 타입 (gothic, handwriting, brush)
 *     responses:
 *       200:
 *         description: 시 수정 성공
 */
router.put('/:id', auth, updatePoem);

/**
 * @swagger
 * /api/poems/{id}:
 *   delete:
 *     tags: [Poems]
 *     summary: 시 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 시 삭제 성공
 */
router.delete('/:id', auth, deletePoem);

/**
 * @swagger
 * /api/poems/my:
 *   get:
 *     tags: [Poems]
 *     summary: 내가 작성한 시 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 시 목록 조회 성공
 */
router.get('/my', auth, getMyPoems);

/**
 * @swagger
 * /api/poems/analytics/emotions:
 *   get:
 *     tags: [Poems]
 *     summary: 사용자의 감정 태그 사용 통계 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 감정 태그 통계 조회 성공
 */
router.get('/analytics/emotions', auth, getEmotionStats);

/**
 * @swagger
 * /api/poems/analytics/words:
 *   get:
 *     tags: [Poems]
 *     summary: 사용자가 자주 사용한 단어 통계 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 단어 통계 조회 성공
 */
router.get('/analytics/words', auth, getFrequentWords);

export default router; 