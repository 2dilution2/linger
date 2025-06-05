import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Profile 디렉토리 경로
const uploadDir = path.join(__dirname, '../assets/profileImg');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 이메일 해시 생성 함수
const generateEmailHash = (email) => {
  return crypto.createHash('md5').update(email).digest('hex');
};

// 이미지 저장 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const email = req.body.email;
    const emailHash = generateEmailHash(email);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname);
    
    // 형식: {emailHash}-{timestamp}-{randomString}{extension}
    cb(null, `${emailHash}-${timestamp}-${randomString}${extension}`);
  }
});

// 이미지 필터링
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

export default upload; 