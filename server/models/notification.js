import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: "알림을 받는 사용자 ID"
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    description: "알림을 발생시킨 사용자 ID (시스템이면 null)"
  },
  type: {
    type: String,
    enum: [
      'new_comment',
      'new_reply',
      'new_follower',
      'poem_liked',
      'poem_bookmarked',
      'system_announcement'
    ],
    required: true,
    description: "알림 종류"
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    description: "관련된 엔티티 (예: 댓글 ID, 시 ID)"
  },
  entityType: {
    type: String,
    enum: ['poem', 'comment', 'user', 'system'],
    default: 'system',
    description: "알림 대상 타입"
  },
  message: {
    type: String,
    default: '',
    description: "커스터마이징된 알림 메시지"
  },
  isRead: {
    type: Boolean,
    default: false,
    description: "읽음 여부"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Notification', notificationSchema);
