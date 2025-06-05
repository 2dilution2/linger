import express from 'express';
import {
  addHashTag,
  removeHashTag,
  getHashTagsByPoemId,
  searchPoemsByTag,
  getPopularTags,
  getEmotionTags,
  createEmotionTag
} from '../controllers/hashTagController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/hashtags/poems/{poemId}:
 *   post:
 *     tags: [HashTags]
 *     summary: 시에 해시태그 추가
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tag
 *             properties:
 *               tag:
 *                 type: string
 *     responses:
 *       201:
 *         description: 해시태그 추가 성공
 */
router.post('/poems/:poemId', auth, addHashTag);

/**
 * @swagger
 * /api/hashtags/poems/{poemId}/{tagId}:
 *   delete:
 *     tags: [HashTags]
 *     summary: 시의 해시태그 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 해시태그 삭제 성공
 */
router.delete('/poems/:poemId/:tagId', auth, removeHashTag);

/**
 * @swagger
 * /api/hashtags/poems/{poemId}:
 *   get:
 *     tags: [HashTags]
 *     summary: 시의 해시태그 목록
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 해시태그 목록 조회 성공
 */
router.get('/poems/:poemId', getHashTagsByPoemId);

/**
 * @swagger
 * /api/hashtags/search/{tag}:
 *   get:
 *     tags: [HashTags]
 *     summary: 태그로 시 검색
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 시 검색 성공
 */
router.get('/search/:tag', searchPoemsByTag);

/**
 * @swagger
 * /api/hashtags/popular:
 *   get:
 *     tags: [HashTags]
 *     summary: 인기 태그 목록
 *     responses:
 *       200:
 *         description: 인기 태그 목록 조회 성공
 */
router.get('/popular', getPopularTags);

/**
 * @swagger
 * /api/hashtags/emotions:
 *   get:
 *     tags: [HashTags]
 *     summary: 감정 태그 목록 조회
 *     description: 시스템에서 제공하는 기본 감정 태그와 인기 감정 태그 목록 조회
 *     responses:
 *       200:
 *         description: 감정 태그 목록 조회 성공
 */
router.get('/emotions', getEmotionTags);

/**
 * @swagger
 * /api/hashtags/emotions:
 *   post:
 *     tags: [HashTags]
 *     summary: 감정 태그 추가
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 감정 태그 추가 성공
 */
router.post('/emotions', createEmotionTag);

export default router; 