import Notification from '../models/notification.js';
import rabbitmq from '../config/rabbitmq.js';

class NotificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await rabbitmq.connect();
      await rabbitmq.consume(rabbitmq.queues.NOTIFICATION, this.processNotification.bind(this));
      this.isInitialized = true;
    } catch (error) {
      console.error('알림 컨슈머 초기화 오류:', error);
    }
  }

  async processNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      console.log('알림이 생성되었습니다:', notification);
    } catch (error) {
      console.error('알림 처리 오류:', error);
      throw error;
    }
  }

  async queueNotification(notificationData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      await rabbitmq.publish(rabbitmq.queues.NOTIFICATION, notificationData);
    } catch (error) {
      console.error('알림 큐잉 오류:', error);
      throw error;
    }
  }
}

const notificationService = new NotificationService();
export default notificationService; 