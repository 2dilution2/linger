import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import UserProfile from '../models/userProfile.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    
    // 사용자 프로필 정보가 없는 경우 프로필에서 penname 조회하여 추가
    if (!req.user.penname) {
      try {
        const userProfile = await UserProfile.findOne({ userId: req.user.userId });
        if (userProfile) {
          req.user.penname = userProfile.penname;
        } else {
          req.user.penname = '사용자'; // 프로필이 없는 경우 기본값 설정
        }
      } catch (profileError) {
        console.error('사용자 프로필 조회 실패:', profileError);
        // 프로필 조회 실패 시 기본값 설정
        req.user.penname = '사용자';
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}; 