import Follow from '../models/follows.js';
import User from '../models/user.js';
import UserProfile from '../models/userProfile.js';
import Notification from '../models/notification.js';

// 팔로우하기
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    // 자신을 팔로우하는지 확인
    if (userId === followerId) {
      return res.status(400).json({ message: '자신을 팔로우할 수 없습니다.' });
    }

    // 팔로우할 사용자가 존재하는지 확인
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 이미 팔로우했는지 확인
    const existingFollow = await Follow.findOne({ followerId, followingId: userId });
    if (existingFollow) {
      return res.status(400).json({ message: '이미 팔로우한 사용자입니다.' });
    }

    // 팔로우 생성
    const follow = new Follow({
      followerId,
      followingId: userId
    });
    await follow.save();

    // 알림 생성
    const notification = new Notification({
      recipientId: userId,
      senderId: followerId,
      type: 'new_follower',
      entityId: followerId,
      entityType: 'user',
      message: `${req.user.penname}님이 회원님을 팔로우합니다.`
    });
    await notification.save();

    res.status(201).json({ message: '사용자를 팔로우했습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 언팔로우하기
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    // 팔로우 찾기
    const follow = await Follow.findOne({ followerId, followingId: userId });
    if (!follow) {
      return res.status(404).json({ message: '팔로우 관계를 찾을 수 없습니다.' });
    }

    // 팔로우 삭제
    await Follow.findByIdAndDelete(follow._id);

    res.json({ message: '사용자 팔로우를 취소했습니다.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 내가 팔로우하는 사용자 목록
export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    const follows = await Follow.find({ followerId: userId });
    const followingIds = follows.map(follow => follow.followingId);
    
    const followingProfiles = await UserProfile.find({ 
      userId: { $in: followingIds }
    });
    
    res.json(followingProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 나를 팔로우하는 사용자 목록
export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    const follows = await Follow.find({ followingId: userId });
    const followerIds = follows.map(follow => follow.followerId);
    
    const followerProfiles = await UserProfile.find({ 
      userId: { $in: followerIds }
    });
    
    res.json(followerProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 팔로우 여부 확인
export const checkFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const follow = await Follow.findOne({ followerId, followingId: userId });
    
    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 팔로우 통계
export const getFollowStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    const followingCount = await Follow.countDocuments({ followerId: userId });
    const followerCount = await Follow.countDocuments({ followingId: userId });
    
    res.json({
      following: followingCount,
      followers: followerCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 