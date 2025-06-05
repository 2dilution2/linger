import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  checkFollow,
  getFollowStats
} from '../controllers/followController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/follows/users/{userId}:
 *   post:
 *     tags: [Follows]
 *     summary: 사용자 팔로우
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: 팔로우 성공
 */
router.post('/users/:userId', auth, followUser);

/**
 * @swagger
 * /api/follows/users/{userId}:
 *   delete:
 *     tags: [Follows]
 *     summary: 언팔로우
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 언팔로우 성공
 */
router.delete('/users/:userId', auth, unfollowUser);

/**
 * @swagger
 * /api/follows/following:
 *   get:
 *     tags: [Follows]
 *     summary: 내가 팔로우하는 사용자 목록
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 팔로잉 목록 조회 성공
 */
router.get('/following', auth, getFollowing);

/**
 * @swagger
 * /api/follows/followers:
 *   get:
 *     tags: [Follows]
 *     summary: 나를 팔로우하는 사용자 목록
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 팔로워 목록 조회 성공
 */
router.get('/followers', auth, getFollowers);

/**
 * @swagger
 * /api/follows/users/{userId}/following:
 *   get:
 *     tags: [Follows]
 *     summary: 특정 사용자가 팔로우하는 사용자 목록
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팔로잉 목록 조회 성공
 */
router.get('/users/:userId/following', getFollowing);

/**
 * @swagger
 * /api/follows/users/{userId}/followers:
 *   get:
 *     tags: [Follows]
 *     summary: 특정 사용자를 팔로우하는 사용자 목록
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팔로워 목록 조회 성공
 */
router.get('/users/:userId/followers', getFollowers);

/**
 * @swagger
 * /api/follows/users/{userId}/check:
 *   get:
 *     tags: [Follows]
 *     summary: 팔로우 여부 확인
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팔로우 여부 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 */
router.get('/users/:userId/check', auth, checkFollow);

/**
 * @swagger
 * /api/follows/{userId}/status:
 *   get:
 *     tags: [Follows]
 *     summary: 팔로우 상태 확인 (TODO 규격에 맞춘 엔드포인트)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팔로우 상태 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 */
router.get('/:userId/status', auth, checkFollow);

/**
 * @swagger
 * /api/follows/stats:
 *   get:
 *     tags: [Follows]
 *     summary: 내 팔로우 통계
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 팔로우 통계 조회 성공
 */
router.get('/stats', auth, getFollowStats);

/**
 * @swagger
 * /api/follows/users/{userId}/stats:
 *   get:
 *     tags: [Follows]
 *     summary: 특정 사용자의 팔로우 통계
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팔로우 통계 조회 성공
 */
router.get('/users/:userId/stats', getFollowStats);

export default router; 