import Notification from '../models/notification.js';
import notificationService from '../services/notificationService.js';

// 알림 서비스 초기화
notificationService.initialize().catch(err => {
  console.error('알림 서비스 초기화 실패:', err);
});

// 알림 목록 조회
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'penname');

    const total = await Notification.countDocuments({ recipientId: req.user._id });

    res.status(200).json({
      notifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 알림 읽음 처리
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 모든 알림 읽음 처리
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: '모든 알림이 읽음 처리되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 알림 삭제
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: '알림을 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '알림이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 읽지 않은 알림 개수 조회
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 