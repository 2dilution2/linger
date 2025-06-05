import express from 'express';
import {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPoemId,
  likeComment,
  unlikeComment
} from '../controllers/commentController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/comments/poems/{poemId}:
 *   post:
 *     tags: [Comments]
 *     summary: 시에 댓글 작성
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 */
router.post('/poems/:poemId', auth, createComment);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     summary: 댓글 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 */
router.put('/:commentId', auth, updateComment);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: 댓글 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 */
router.delete('/:commentId', auth, deleteComment);

/**
 * @swagger
 * /api/comments/poems/{poemId}:
 *   get:
 *     tags: [Comments]
 *     summary: 시의 댓글 목록
 *     parameters:
 *       - in: path
 *         name: poemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 */
router.get('/poems/:poemId', getCommentsByPoemId);

/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   post:
 *     tags: [Comments]
 *     summary: 댓글 좋아요
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 댓글 좋아요 성공
 */
router.post('/:commentId/like', auth, likeComment);

/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   delete:
 *     tags: [Comments]
 *     summary: 댓글 좋아요 취소
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 댓글 좋아요 취소 성공
 */
router.delete('/:commentId/like', auth, unlikeComment);

export default router; 