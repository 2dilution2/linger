import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 설정
const NODE_ENV = process.env.NODE_ENV || 'local';
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(__dirname, '..', envFile);

// 환경별 .env 파일 로드
console.log(`환경: ${NODE_ENV}, .env 파일: ${envPath}`);
dotenv.config({ path: envPath });

// 환경 변수가 로드되지 않으면 기본 .env 파일도 시도
if (!process.env.SENTRY_DSN) {
  const defaultEnvPath = path.resolve(__dirname, '..', '..', '.env');
  console.log(`기본 .env 파일 시도: ${defaultEnvPath}`);
  dotenv.config({ path: defaultEnvPath });
}

const config = {
  server: {
    port: process.env.PORT || 4003,
    mode: NODE_ENV
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/linger',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '1d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:4003'
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  }
};

export default config;
