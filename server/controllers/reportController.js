import Report from '../models/report.js';
import Poem from '../models/poem.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';

// 신고 생성
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    const reporter = req.user._id;

    // 이미 신고한 경우 확인
    const existingReport = await Report.findOne({
      reporter,
      targetType,
      targetId
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: '이미 신고한 대상입니다.'
      });
    }

    // 대상 존재 여부 확인
    let target;
    switch (targetType) {
      case 'poem':
        target = await Poem.findById(targetId);
        break;
      case 'comment':
        target = await Comment.findById(targetId);
        break;
      case 'user':
        target = await User.findById(targetId);
        break;
    }

    if (!target) {
      return res.status(404).json({
        success: false,
        message: '신고 대상이 존재하지 않습니다.'
      });
    }

    // 신고 생성
    const report = new Report({
      reporter,
      targetType,
      targetId,
      reason,
      description
    });

    await report.save();

    // 시나 댓글의 경우 신고자 목록에 추가
    if (targetType === 'poem') {
      await Poem.findByIdAndUpdate(targetId, {
        $addToSet: { reports: reporter }
      });
    } else if (targetType === 'comment') {
      await Comment.findByIdAndUpdate(targetId, {
        $addToSet: { reports: reporter }
      });
    }

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '신고 처리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 신고 목록 조회 (관리자용)
export const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporter', 'penname')
      .lean();

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '신고 목록을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 신고 상태 업데이트 (관리자용)
export const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: '신고를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '신고 상태 업데이트에 실패했습니다.',
      error: error.message
    });
  }
}; 