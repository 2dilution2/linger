import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { poemService, socialService, interactionService } from '../services';

export function CommunityFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchPoems();
  }, [activeTab]);
  
  const handleRefresh = () => {
    console.log('커뮤니티 새로고침 시작');
    setRefreshing(true);
    
    loadPoemData();
  };
  
  const loadPoemData = async () => {
    try {
      let poemData = [];
      
      switch (activeTab) {
        case 'all':
          poemData = await poemService.getAllPoems();
          break;
        case 'trending':
          poemData = await poemService.getRecommendedPoems();
          break;
        case 'following':
          poemData = await socialService.getFollowingPoems();
          break;
        default:
          poemData = await poemService.getAllPoems();
      }
      
      console.log('시 데이터 로드:', poemData.length, '개 항목');
      
      // 각 시에 대해 좋아요, 댓글 수 별도 조회
      const normalizedPoems = await Promise.all(poemData.map(async poem => {
        // MongoDB의 _id를 id로 변환
        const id = poem._id || poem.id;
        // 작성자 ID 추출
        const authorId = poem.author?._id || poem.authorId;
        
        // 좋아요 수 추출 (기존 데이터 또는 별도 API 호출)
        let likesCount = poem.likesCount || poem.likes?.length || 0;
        
        // 댓글 수 추출 (기존 데이터 또는 별도 API 호출)
        let commentCount = poem.commentCount || poem.comments?.length || 0;
        
        // 좋아요 수가 0이고 별도 조회가 필요한 경우
        if (likesCount === 0 && id) {
          try {
            const likesData = await poemService.getPoemLikes(id);
            likesCount = likesData.likes || likesData.count || 0;
          } catch (error) {
            console.error('좋아요 수 조회 실패:', id, error);
          }
        }
        
        // 댓글 수가 0이고 별도 조회가 필요한 경우
        if (commentCount === 0 && id) {
          try {
            const commentsData = await interactionService.getComments(id);
            commentCount = commentsData.length || 0;
          } catch (error) {
            console.error('댓글 수 조회 실패:', id, error);
          }
        }

        console.log(`시 ID: ${id}, 좋아요: ${likesCount}, 댓글: ${commentCount}`);
        
        return {
          ...poem,
          id,
          authorId,
          likesCount,
          commentCount
        };
      }));
      
      setPoems(normalizedPoems);
    } catch (error) {
      console.error('시 목록 가져오기 실패:', error);
      Alert.alert('오류', '시 목록을 불러오는데 실패했습니다.');
      setPoems([]);
    } finally {
      console.log('커뮤니티 새로고침 완료');
      setRefreshing(false);
    }
  };
  
  const fetchPoems = () => {
    setLoading(true);
    loadPoemData().finally(() => {
      setLoading(false);
    });
  };
  
  const handleAuthorSubscribe = async (authorId) => {
    try {
      await socialService.followUser(authorId);
      fetchPoems();
    } catch (error) {
      console.error('구독 처리 실패:', error);
      Alert.alert('오류', '구독 처리에 실패했습니다.');
    }
  };
  
  const handleBookmark = async (poemId) => {
    try {
      const poemIndex = poems.findIndex(p => p.id === poemId);
      if (poemIndex === -1) return;
      
      const poem = poems[poemIndex];
      
      if (poem.isBookmarked) {
        await interactionService.removeBookmark(poemId);
      } else {
        await interactionService.addBookmark(poemId);
      }
      
      const updatedPoems = [...poems];
      updatedPoems[poemIndex] = {
        ...poem,
        isBookmarked: !poem.isBookmarked
      };
      
      setPoems(updatedPoems);
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      Alert.alert('오류', '북마크 처리에 실패했습니다.');
    }
  };
  
  const handlePoemPress = (poemId) => {
    navigation.navigate('PoemDetail', { poemId });
  };
  
  const renderItem = ({ item }) => {
    console.log('Item ID:', item.id);
    console.log('좋아요 수:', item.likesCount);
    console.log('댓글 수:', item.commentCount);
    
    return (
      <TouchableOpacity 
        style={[styles.postCard, { backgroundColor: item.background || '#f9f9f9' }]}
        onPress={() => handlePoemPress(item.id)}
      >
        <View style={styles.postHeader}>
          <Text style={styles.authorName}>{item.author?.penname || '익명'}</Text>
          <TouchableOpacity 
            style={styles.followButton}
            onPress={() => handleAuthorSubscribe(item.authorId)}
          >
            <Text style={styles.followText}>구독</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postPreview}>{item.content?.substring(0, 100) + (item.content?.length > 100 ? '...' : '')}</Text>
        
        <View style={styles.tagsContainer}>
          {item.emotionTags?.map((tag, index) => (
            <Text key={`${item.id}-tag-${index}`} style={styles.tagText}>
              #{tag}
            </Text>
          ))}
        </View>
        
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.likesCount || 0}</Text>
            <Text style={styles.statLabel}>공감</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.commentCount || 0}</Text>
            <Text style={styles.statLabel}>댓글</Text>
          </View>
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={() => handleBookmark(item.id)}
          >
            <Ionicons 
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={item.isBookmarked ? "#0080ff" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'all' ? styles.activeTab : null
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'all' ? styles.activeTabText : null
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'trending' ? styles.activeTab : null
          ]}
          onPress={() => setActiveTab('trending')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'trending' ? styles.activeTabText : null
            ]}
          >
            인기
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'following' ? styles.activeTab : null
          ]}
          onPress={() => setActiveTab('following')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'following' ? styles.activeTabText : null
            ]}
          >
            구독
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080ff" />
        </View>
      ) : (
        <FlatList
          data={poems}
          renderItem={renderItem}
          keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0080ff']}
              tintColor="#0080ff"
              progressViewOffset={10}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>표시할 시가 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
  },
  header: {
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0080ff',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#0080ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  postCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  followButton: {
    backgroundColor: 'rgba(0,128,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  followText: {
    fontSize: 12,
    color: '#0080ff',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postPreview: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#0080ff',
    marginRight: 8,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  bookmarkButton: {
    marginLeft: 'auto',
  },
}); 