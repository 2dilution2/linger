import express from 'express';
import {
  join,
  login,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getPopularUsers,
  searchUsers
} from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

const options = {
  openapi: '3.0.0',
};

/**
 * @swagger
 * /api/users/join:
 *   post:
 *     tags: [Users]
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - penname
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *               penname:
 *                 type: string
 *                 description: 사용자 필명
 *               bio:
 *                 type: string
 *                 description: 사용자 소개
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: 프로필 이미지 파일
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     profile:
 *                       type: object
 *                       properties:
 *                         penname:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         isPublic:
 *                           type: boolean
 */
router.post('/join', upload.single('profileImage'), join);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags: [Users]
 *     summary: 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 */
router.post('/login', login);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: 사용자 프로필 조회
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 */
router.get('/:userId', getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: 프로필 수정
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               penname:
 *                 type: string
 *               bio:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 */
router.put('/profile', auth, updateUserProfile);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     tags: [Users]
 *     summary: 비밀번호 변경
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 */
router.put('/password', auth, changePassword);

/**
 * @swagger
 * /api/users/popular:
 *   get:
 *     tags: [Users]
 *     summary: 인기 사용자 목록 조회
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 반환할 사용자 수
 *     responses:
 *       200:
 *         description: 인기 사용자 목록 조회 성공
 */
router.get('/popular', getPopularUsers);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Users]
 *     summary: 사용자 검색
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어
 *     responses:
 *       200:
 *         description: 사용자 검색 성공
 */
router.get('/search', searchUsers);

export default router;