import User from '../models/user.js';
import UserProfile from '../models/userProfile.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 회원가입
export const join = async (req, res) => {
  try {
    const { email, password, penname, bio } = req.body;
    const profileImage = req.file ? `../assets/profileImg/${req.file.filename}` : '../assets/profileImg/defaultImg.png';

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 필명 중복 확인
    const existingProfile = await UserProfile.findOne({ penname });
    if (existingProfile) {
      return res.status(400).json({ message: '이미 존재하는 필명입니다.' });
    }

    const user = new User({
      email,
      password,
      provider: 'local',
      providerId: email,
      isActive: true
    });

    await user.save();

    // UserProfile 생성
    const userProfile = new UserProfile({
      userId: user._id,
      penname,
      bio: bio || '',
      profileImage,
      isPublic: true
    });

    await userProfile.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user._id,
        penname: user.penname
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        provider: user.provider,
        isActive: user.isActive,
        profile: {
          penname: userProfile.penname,
          bio: userProfile.bio,
          profileImage: userProfile.profileImage,
          isPublic: userProfile.isPublic
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 로그인
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // UserProfile에서 penname 가져오기
    const userProfile = await UserProfile.findOne({ userId: user._id });
    if (!userProfile) {
      return res.status(404).json({ message: '사용자 프로필을 찾을 수 없습니다.' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        penname: userProfile.penname
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        penname: userProfile.penname
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자 정보 조회
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자 정보 수정
export const updateUserProfile = async (req, res) => {
  try {
    const { penname, bio, isPublic } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    user.penname = penname || user.penname;
    user.bio = bio || user.bio;
    user.isPublic = isPublic !== undefined ? isPublic : user.isPublic;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 비밀번호 변경
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 인기 사용자 목록 조회 (팔로워 수 기준)
export const getPopularUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 각 사용자의 팔로워 수 집계
    const popularUsers = await User.aggregate([
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'followingId',
          as: 'followers'
        }
      },
      {
        $lookup: {
          from: 'userprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          email: 1,
          penname: 1,
          profileImage: '$profile.profileImage',
          bio: '$profile.bio',
          followerCount: { $size: '$followers' }
        }
      },
      { $sort: { followerCount: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json(popularUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 사용자 검색 API
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: '검색어를 입력해주세요.' });
    }
    
    const users = await User.find({
      $or: [
        { penname: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('_id email penname');
    
    // 프로필 정보 가져오기
    const userIds = users.map(user => user._id);
    const profiles = await UserProfile.find({ userId: { $in: userIds } });
    
    // 사용자 정보와 프로필 정보 합치기
    const result = users.map(user => {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      return {
        _id: user._id,
        email: user.email,
        penname: user.penname,
        profileImage: profile?.profileImage || null,
        bio: profile?.bio || null
      };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 