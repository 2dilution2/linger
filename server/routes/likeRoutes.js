import express from 'express';
import {
  addLike,
  removeLike,
  getLikesByPoemId,
  getLikesByUserId,
  getLikeStatus
} from '../controllers/likeController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/likes/poems/{poemId}:
 *   post:
 *     tags: [Likes]
 *     summary: 시에 좋아요 추가
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: 좋아요 추가 성공
 */
router.post('/poems/:poemId', auth, addLike);

/**
 * @swagger
 * /api/likes/poems/{poemId}:
 *   delete:
 *     tags: [Likes]
 *     summary: 시 좋아요 취소
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 */
router.delete('/poems/:poemId', auth, removeLike);

/**
 * @swagger
 * /api/likes/poems/{poemId}/users:
 *   get:
 *     tags: [Likes]
 *     summary: 시를 좋아요한 사용자 목록
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 좋아요 목록 조회 성공
 */
router.get('/poems/:poemId/users', getLikesByPoemId);

/**
 * @swagger
 * /api/likes/my:
 *   get:
 *     tags: [Likes]
 *     summary: 내가 좋아요한 시 목록
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 좋아요 목록 조회 성공
 */
router.get('/my', auth, getLikesByUserId);

/**
 * @swagger
 * /api/likes/{poemId}/status:
 *   get:
 *     tags: [Likes]
 *     summary: 시 좋아요 상태 확인
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 좋아요 상태 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isLiked:
 *                   type: boolean
 */
router.get('/:poemId/status', auth, getLikeStatus);

export default router; 