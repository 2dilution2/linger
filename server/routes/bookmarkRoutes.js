import express from 'express';
import {
  addBookmark,
  removeBookmark,
  getBookmarksByUserId,
  checkBookmark
} from '../controllers/bookmarkController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/bookmarks/poems/{poemId}:
 *   post:
 *     tags: [Bookmarks]
 *     summary: 시 북마크 추가
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
 *         description: 북마크 추가 성공
 */
router.post('/poems/:poemId', auth, addBookmark);

/**
 * @swagger
 * /api/bookmarks/poems/{poemId}:
 *   delete:
 *     tags: [Bookmarks]
 *     summary: 시 북마크 취소
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
 *         description: 북마크 취소 성공
 */
router.delete('/poems/:poemId', auth, removeBookmark);

/**
 * @swagger
 * /api/bookmarks/my:
 *   get:
 *     tags: [Bookmarks]
 *     summary: 내가 북마크한 시 목록
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 북마크 목록 조회 성공
 */
router.get('/my', auth, getBookmarksByUserId);

/**
 * @swagger
 * /api/bookmarks/poems/{poemId}/check:
 *   get:
 *     tags: [Bookmarks]
 *     summary: 시 북마크 여부 확인
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
 *         description: 북마크 여부 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isBookmarked:
 *                   type: boolean
 */
router.get('/poems/:poemId/check', auth, checkBookmark);

/**
 * @swagger
 * /api/bookmarks/{poemId}/status:
 *   get:
 *     tags: [Bookmarks]
 *     summary: 시 북마크 상태 확인 (TODO 규격에 맞춘 엔드포인트)
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
 *         description: 북마크 상태 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isBookmarked:
 *                   type: boolean
 */
router.get('/:poemId/status', auth, checkBookmark);

export default router; 