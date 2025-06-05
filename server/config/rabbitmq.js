import amqp from 'amqplib';

const rabbitmqConfig = {
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: process.env.RABBITMQ_PORT || 5672,
  username: process.env.RABBITMQ_USERNAME || 'guest',
  password: process.env.RABBITMQ_PASSWORD || 'guest',
};

class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = {
      NOTIFICATION: 'notification_queue',
    };
  }

  async connect() {
    try {
      const connectionString = `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`;
      this.connection = await amqp.connect(connectionString);
      this.channel = await this.connection.createChannel();

      // 알림 큐 선언
      await this.channel.assertQueue(this.queues.NOTIFICATION, {
        durable: true, // 서버 재시작 후에도 큐 유지
      });

      console.log('RabbitMQ가 연결되었습니다.');
    } catch (error) {
      console.error('RabbitMQ 연결 오류:', error);
      throw error;
    }
  }

  async publish(queue, message) {
    if (!this.channel) {
      throw new Error('RabbitMQ 채널이 초기화되지 않았습니다.');
    }

    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        { persistent: true } // 메시지 영속성 보장
      );
    } catch (error) {
      console.error('메시지 발행 오류:', error);
      throw error;
    }
  }

  async consume(queue, callback) {
    if (!this.channel) {
      throw new Error('RabbitMQ 채널이 초기화되지 않았습니다.');
    }

    try {
      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const message = JSON.parse(msg.content.toString());
            await callback(message);
            this.channel.ack(msg); // 메시지 처리 완료 확인
          } catch (error) {
            console.error('메시지 처리 오류:', error);
            this.channel.nack(msg); // 메시지 처리 실패, 재시도
          }
        }
      });
    } catch (error) {
      console.error('메시지 소비 오류:', error);
      throw error;
    }
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

const rabbitmq = new RabbitMQ();
export default rabbitmq; 