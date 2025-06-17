import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { poemService, interactionService } from '../services';

// 영어 감정 태그를 한글로 변환하는 함수
const getEmotionTagName = (tag) => {
  // 이미 한글이면 그대로 반환
  if (/[가-힣]/.test(tag)) {
    return tag;
  }
  
  // 영어 -> 한글 매핑
  const tagMap = {
    'joy': '기쁨',
    'happy': '행복',
    'love': '사랑',
    'flutter': '설렘',
    'peace': '평온',
    'gratitude': '감사',
    'hope': '희망',
    'sad': '슬픔',
    'miss': '그리움',
    'lonely': '외로움',
    'depressed': '우울',
    'anxiety': '불안',
    'anger': '분노',
    'regret': '후회',
    'despair': '절망',
    'empty': '공허'
  };
  
  return tagMap[tag.toLowerCase()] || tag;
};

export function PoemDetailScreen({ route, navigation }) {
  // route.params가 없거나 poemId가 없는 경우 처리
  const poemId = route.params?.poemId;
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [error, setError] = useState(null);
  
  const user = useSelector(selectUser);

  // 네비게이션 옵션 설정
  useEffect(() => {
    navigation.setOptions({
      headerShown: false // 기본 헤더 숨기기
    });
  }, [navigation]);

  // poemId가 없으면 에러 설정
  useEffect(() => {
    if (!poemId) {
      setError('유효하지 않은 시 ID입니다.');
      setLoading(false);
      return;
    }
    loadPoemData();
  }, [poemId]);

  // 시 데이터 로드
  const loadPoemData = async () => {
    // poemId가 없으면 로드하지 않음
    if (!poemId) {
      console.error('시 ID가 없습니다');
      setError('유효하지 않은 시 ID입니다.');
      setLoading(false);
      return;
    }
    
    console.log('시 데이터 로드 시작. 시 ID:', poemId);
    setLoading(true);
    setError(null);
    
    try {
      // 시 정보 가져오기
      const poemData = await poemService.getPoemById(poemId);
      console.log('시 데이터 로드 성공:', poemData.title);
      
      // 감정 태그가 있으면 영어->한글 변환 처리
      if (poemData.emotionTags && poemData.emotionTags.length > 0) {
        console.log('원본 감정 태그:', poemData.emotionTags);
        // 감정 태그 정보 로드 (태그 이름 변환을 위해)
        try {
          const emotionTags = await interactionService.getEmotionTags();
          // ID-이름 매핑 생성
          const tagMap = {};
          emotionTags.forEach(tag => {
            tagMap[tag.id] = tag.name;
          });
          
          // 태그 변환 적용
          poemData.emotionTags = poemData.emotionTags.map(tag => {
            // ID인 경우 이름으로 변환, 그 외에는 그대로 사용
            if (tagMap[tag]) {
              return tagMap[tag];
            }
            // 이미 태그 이름인 경우 그대로 사용
            return tag;
          });
          
          console.log('변환된 감정 태그:', poemData.emotionTags);
        } catch (tagError) {
          console.error('감정 태그 로드 실패:', tagError);
          // 에러가 발생해도 시 로드는 계속 진행
        }
      }
      
      setPoem(poemData);
      
      // 좋아요 상태 확인
      const likeStatus = await interactionService.checkLikeStatus(poemId);
      setIsLiked(likeStatus.isLiked);
      
      // 북마크 상태 확인
      const bookmarkStatus = await interactionService.checkBookmarkStatus(poemId);
      setIsBookmarked(bookmarkStatus.isBookmarked);
      
      // 좋아요 수 가져오기
      try {
        const likes = await poemService.getPoemLikes(poemId);
        console.log('좋아요 수 조회 결과:', likes);
        // 서버 응답 형식에 따라 다르게 처리
        if (likes && typeof likes === 'object') {
          const likesCount = likes.count || likes.likes || 0;
          console.log('설정할 좋아요 수:', likesCount);
          setLikeCount(likesCount);
        } else {
          setLikeCount(0);
        }
      } catch (likeError) {
        console.error('좋아요 수 조회 실패:', likeError);
        setLikeCount(poemData.likeCount || 0);
      }
      
      // 댓글 수 가져오기
      const comments = await interactionService.getComments(poemId);
      setCommentCount(comments.length || 0);
    } catch (error) {
      console.error('시 데이터 로드 실패:', error.message, error.response?.data);
      setError('시 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 좋아요 토글
  const toggleLike = async () => {
    if (!poemId || !poem) {
      console.error('유효하지 않은 시 ID로 좋아요 시도');
      Alert.alert('오류', '시 정보를 찾을 수 없습니다.');
      return;
    }
    
    try {
      // 서버 요청 전 UI 먼저 업데이트 (낙관적 업데이트)
      const wasLiked = isLiked;
      setIsLiked(!isLiked);
      if (isLiked) {
        setLikeCount(Math.max(0, likeCount - 1));
      } else {
        setLikeCount(likeCount + 1);
      }
      
      // 시 ID 확보 - 가장 신뢰할 수 있는 ID 사용
      const normalizedPoemId = poem.id || poem._id || poemId;
      
      console.log(`좋아요 토글 정보:`, {
        시ID: normalizedPoemId,
        현재상태: wasLiked ? '좋아요 → 취소' : '취소 → 좋아요'
      });
      
      // 서버 요청
      if (wasLiked) {
        await interactionService.removeLike(normalizedPoemId);
      } else {
        await interactionService.addLike(normalizedPoemId);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      if (error.response) {
        console.error('좋아요 오류 서버 응답:', {
          상태: error.response.status,
          데이터: error.response.data
        });
      }
      
      // 에러 발생 시 UI 상태 원복
      setIsLiked(isLiked);
      if (isLiked) {
        setLikeCount(likeCount);
      } else {
        setLikeCount(Math.max(0, likeCount - 1));
      }
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  // 북마크 토글
  const toggleBookmark = async () => {
    if (!poemId || !poem) {
      console.error('유효하지 않은 시 ID로 북마크 시도');
      Alert.alert('오류', '시 정보를 찾을 수 없습니다.');
      return;
    }
    
    try {
      // 서버 요청 전 UI 먼저 업데이트 (낙관적 업데이트)
      const wasBookmarked = isBookmarked;
      setIsBookmarked(!isBookmarked);
      
      // 시 ID 확보 - 가장 신뢰할 수 있는 ID 사용
      const normalizedPoemId = poem.id || poem._id || poemId;
      
      console.log(`북마크 토글 정보:`, {
        시ID: normalizedPoemId,
        현재상태: wasBookmarked ? '북마크 → 취소' : '취소 → 북마크'
      });
      
      // 서버 요청
      if (wasBookmarked) {
        await interactionService.removeBookmark(normalizedPoemId);
      } else {
        await interactionService.addBookmark(normalizedPoemId);
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      if (error.response) {
        console.error('북마크 오류 서버 응답:', {
          상태: error.response.status,
          데이터: error.response.data
        });
      }
      
      // 에러 발생 시 UI 상태 원복
      setIsBookmarked(isBookmarked);
      Alert.alert('오류', '북마크 처리에 실패했습니다.');
    }
  };

  // 공유하기
  const sharePoem = async () => {
    if (!poem) return;
    
    try {
      await Share.share({
        message: `"${poem.title}" by ${poem.pennameAtCreation || '익명'}\n\n${poem.content}\n\nLinger 앱에서 더 많은 시를 만나보세요.`,
        title: poem.title
      });
    } catch (error) {
      console.error('공유 실패:', error);
      Alert.alert('오류', '공유에 실패했습니다.');
    }
  };
  
  // 재시도 함수
  const retryLoading = () => {
    loadPoemData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0080ff" />
      </View>
    );
  }

  if (error || !poem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '시를 찾을 수 없습니다.'}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={retryLoading}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {/* 내 시인 경우 수정 버튼 표시 */}
          {user && user.id === poem.author?._id && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('WritePoem', { poemId: poem.id, mode: 'edit' })}
            >
              <Ionicons name="create-outline" size={24} color="#0080ff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={sharePoem}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.poemCard}>
          <Text style={styles.title}>{poem.title}</Text>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>by {poem.pennameAtCreation || '익명'}</Text>
            <Text style={styles.date}>
              {new Date(poem.createdAt).toLocaleDateString('ko-KR')}
            </Text>
          </View>
          
          <Text style={styles.poemText}>{poem.content}</Text>
          
          {poem.emotionTags && poem.emotionTags.length > 0 && (
            <View style={styles.tagContainer}>
              {poem.emotionTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{getEmotionTagName(tag)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={toggleLike}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#ff4757" : "#333"} 
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Comments', { poemId })}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={toggleBookmark}
        >
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked ? "#0080ff" : "#333"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  poemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  authorName: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  poemText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
}); 