import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import { swaggerSpec, swaggerUi } from './swagger/swagger.js';
import config from './config/config.js';
import poemRoutes from './routes/poemRoutes.js';
import userRoutes from './routes/userRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import hashTagRoutes from './routes/hashTagRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import followRoutes from './routes/followRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import rabbitmq from './config/rabbitmq.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 미들웨어 설정
const corsOptions = {
  origin: function (origin, callback) {
    // 허용할 출처 목록
    const allowedOrigins = [
      'http://localhost:8081',      // Expo 웹 개발 서버
      'http://localhost:19006',     // Expo 웹 개발 서버 (다른 포트)
      'http://localhost:4003',      // 추가된 localhost 포트
      'exp://localhost:8081',       // Expo Go 앱
      'exp://192.168.0.81:8081',    // 로컬 IP로 실행되는 Expo
      undefined,                    // React Native에서는 origin이 undefined일 수 있음
      'null'                        // 일부 환경에서는 null로 전달될 수 있음
    ];
    
    // origin 없거나 허용된 출처면 허용
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS 오류 - 허용되지 않은 출처:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// 모든 요청에 CORS 헤더 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // OPTIONS 요청에 대한 응답
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 정적 파일 서빙 설정
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Swagger UI 설정
app.use(
  '/api-docs',
  ...swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// MongoDB 연결
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch(err => {
    console.error('MongoDB 연결 오류:', err);
  });

// 라우트 설정
app.use('/api/poems', poemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/hashtags', hashTagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/reports', reportRoutes);

// 404 오류 핸들러
app.use(notFoundHandler);

// 에러 핸들링 미들웨어
app.use(errorHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`[${config.server.mode.toUpperCase()}] 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

export default app;
