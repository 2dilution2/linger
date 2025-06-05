import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/reportController.js';
import { auth } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: 신고 생성
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - reason
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [poem, comment, user]
 *               targetId:
 *                 type: string
 *               reason:
 *                 type: string
 *                 enum: [spam, inappropriate, copyright, other]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 신고가 성공적으로 생성됨
 *       400:
 *         description: 이미 신고한 대상
 *       404:
 *         description: 신고 대상이 존재하지 않음
 */
router.post('/', auth, createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: 신고 목록 조회 (관리자용)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved]
 *         description: 신고 상태 필터
 *     responses:
 *       200:
 *         description: 신고 목록 조회 성공
 */
router.get('/', auth, isAdmin, getReports);

/**
 * @swagger
 * /api/reports/{reportId}:
 *   put:
 *     summary: 신고 상태 업데이트 (관리자용)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, resolved]
 *     responses:
 *       200:
 *         description: 신고 상태 업데이트 성공
 *       404:
 *         description: 신고를 찾을 수 없음
 */
router.put('/:reportId', auth, isAdmin, updateReportStatus);

export default router; 