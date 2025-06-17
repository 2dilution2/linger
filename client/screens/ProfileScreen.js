import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { poemService, userService } from '../services';

export function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('myPoems');
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [poemsLoading, setPoemsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const user = useSelector(selectUser);
  
  // 프로필 데이터 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const userId = user?.id || 'me';
        const profileData = await userService.getUserProfile(userId);
        setUserData(profileData);
      } catch (error) {
        console.error('프로필 정보 가져오기 실패:', error);
        Alert.alert('오류', '프로필 정보를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // 사용자 시 데이터 가져오기
  useEffect(() => {
    const fetchUserPoems = async () => {
      setPoemsLoading(true);
      try {
        const userId = user?.id || 'me';
        const userPoems = await poemService.getUserPoems(userId);
        
        // 서버 데이터 포맷 가공
        const formattedPoems = userPoems.map(poem => ({
          id: poem.id || poem._id,
          title: poem.title,
          date: new Date(poem.createdAt).toLocaleDateString('ko-KR'),
          isPrivate: !poem.isPublic,
          isPinned: poem.isPinned || false,
          preview: poem.content.substring(0, 30) + (poem.content?.length > 30 ? '...' : ''),
          content: poem.content,
          likesCount: poem.likesCount || poem.likes?.length || 0,
          isLiked: poem.isLiked || false,
          isBookmarked: poem.isBookmarked || false,
          commentCount: poem.commentCount || poem.comments?.length || 0
        }));
        
        console.log('시 데이터 로드 완료:', formattedPoems.length, '개의 시 로드됨');
        if (formattedPoems.length > 0) {
          console.log('첫 번째 시 ID:', formattedPoems[0].id);
        }
        
        setPoems(formattedPoems);
      } catch (error) {
        console.error('시 데이터 가져오기 실패:', error);
        setPoems([]);
      } finally {
        setPoemsLoading(false);
      }
    };
    
    fetchUserPoems();
  }, [user]);
  
  // 설정 화면으로 이동
  const goToSettings = () => {
    navigation.navigate('Settings');
  };
  
  // 시 상세 화면으로 이동
  const viewPoemDetail = (poemId) => {
    console.log('시 상세 화면으로 이동 시도:', poemId);
    if (!poemId) {
      console.error('유효하지 않은 시 ID:', poemId);
      Alert.alert('오류', '시 정보를 불러올 수 없습니다.');
      return;
    }
    
    try {
      navigation.navigate('PoemDetail', { poemId });
      console.log('PoemDetail 화면으로 이동 성공');
    } catch (error) {
      console.error('화면 이동 오류:', error);
      Alert.alert('오류', '시 상세 화면으로 이동할 수 없습니다.');
    }
  };
  
  const renderTabContent = () => {
    if (poemsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080ff" />
        </View>
      );
    }
    
    if (poems.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="document-text-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>아직 작성한 시가 없습니다.</Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('WritePoem')}
          >
            <Text style={styles.emptyStateButtonText}>시 작성하기</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    switch (activeTab) {
      case 'myPoems':
        return (
          <View style={styles.tabContent}>
            {poems.map((poem) => (
              <TouchableOpacity 
                key={poem.id} 
                style={styles.poemItem} 
                onPress={() => viewPoemDetail(poem.id)}
              >
                <View style={styles.poemItemHeader}>
                  <Text style={styles.poemTitle}>{poem.title}</Text>
                  <View style={styles.poemBadges}>
                    {poem.isPinned && (
                      <View style={styles.pinnedBadge}>
                        <Text style={styles.pinnedText}>핀</Text>
                      </View>
                    )}
                    {poem.isPrivate && (
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateText}>비공개</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.poemDate}>{poem.date}</Text>
                <Text style={styles.poemPreview}>{poem.preview}</Text>
                <View style={styles.poemStats}>
                  <View style={styles.statItem}>
                    <Ionicons 
                      name={poem.isLiked ? "heart" : "heart-outline"} 
                      size={16} 
                      color={poem.isLiked ? "#ff4757" : "#666"} 
                    />
                    <Text style={styles.statCount}>{poem.likesCount || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#666" />
                    <Text style={styles.statCount}>{poem.commentCount || 0}</Text>
                  </View>
                  {poem.isBookmarked && (
                    <View style={styles.statItem}>
                      <Ionicons name="bookmark" size={16} color="#0080ff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'pinned':
        const pinnedPoems = poems.filter(poem => poem.isPinned);
        if (pinnedPoems.length === 0) {
          return (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="bookmark-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>아직 핀한 시가 없습니다.</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('Community')}
              >
                <Text style={styles.emptyStateButtonText}>시 둘러보기</Text>
              </TouchableOpacity>
            </View>
          );
        }
        return (
          <View style={styles.tabContent}>
            {pinnedPoems.map((poem) => (
              <TouchableOpacity 
                key={poem.id} 
                style={styles.poemItem}
                onPress={() => viewPoemDetail(poem.id)}
              >
                <View style={styles.poemItemHeader}>
                  <Text style={styles.poemTitle}>{poem.title}</Text>
                  <View style={styles.poemBadges}>
                    <View style={styles.pinnedBadge}>
                      <Text style={styles.pinnedText}>핀</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.poemDate}>{poem.date}</Text>
                <Text style={styles.poemPreview}>{poem.preview}</Text>
                <View style={styles.poemStats}>
                  <View style={styles.statItem}>
                    <Ionicons 
                      name={poem.isLiked ? "heart" : "heart-outline"} 
                      size={16} 
                      color={poem.isLiked ? "#ff4757" : "#666"} 
                    />
                    <Text style={styles.statCount}>{poem.likesCount || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#666" />
                    <Text style={styles.statCount}>{poem.commentCount || 0}</Text>
                  </View>
                  {poem.isBookmarked && (
                    <View style={styles.statItem}>
                      <Ionicons name="bookmark" size={16} color="#0080ff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'private':
        const privatePoems = poems.filter(poem => poem.isPrivate);
        if (privatePoems.length === 0) {
          return (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="eye-off-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>비공개 시가 없습니다.</Text>
            </View>
          );
        }
        return (
          <View style={styles.tabContent}>
            {privatePoems.map((poem) => (
              <TouchableOpacity 
                key={poem.id} 
                style={styles.poemItem}
                onPress={() => viewPoemDetail(poem.id)}
              >
                <View style={styles.poemItemHeader}>
                  <Text style={styles.poemTitle}>{poem.title}</Text>
                  <View style={styles.poemBadges}>
                    <View style={styles.privateBadge}>
                      <Text style={styles.privateText}>비공개</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.poemDate}>{poem.date}</Text>
                <Text style={styles.poemPreview}>{poem.preview}</Text>
                <View style={styles.poemStats}>
                  <View style={styles.statItem}>
                    <Ionicons 
                      name={poem.isLiked ? "heart" : "heart-outline"} 
                      size={16} 
                      color={poem.isLiked ? "#ff4757" : "#666"} 
                    />
                    <Text style={styles.statCount}>{poem.likesCount || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#666" />
                    <Text style={styles.statCount}>{poem.commentCount || 0}</Text>
                  </View>
                  {poem.isBookmarked && (
                    <View style={styles.statItem}>
                      <Ionicons name="bookmark" size={16} color="#0080ff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'subscribed':
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>아직 구독한 작가가 없습니다.</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Community')}
            >
              <Text style={styles.emptyStateButtonText}>작가 찾아보기</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.screenLoadingContainer}>
        <ActivityIndicator size="large" color="#0080ff" />
      </View>
    );
  }
  
  const profile = userData?.profile || {};
  const penname = profile.penname || (user ? user.email?.split('@')[0] : '사용자');
  const joinDate = userData 
    ? `${new Date(userData.createdAt).getFullYear()}년 ${new Date(userData.createdAt).getMonth() + 1}월부터` 
    : '';
  const poemCount = poems.length;
  const subscriberCount = userData?.subscriberCount || 0;
  const subscribeCount = userData?.subscribeCount || 0;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity style={styles.headerButton} onPress={goToSettings}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {profile.profileImage ? (
            <Image 
              source={{ uri: profile.profileImage }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>{penname.charAt(0)}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.penname}>{penname}</Text>
        <Text style={styles.joinDate}>{joinDate}</Text>
        
        <View style={styles.statsContainer}>
          <View key="stat-poems" style={styles.statItem}>
            <Text style={styles.statValue}>{poemCount}</Text>
            <Text style={styles.statLabel}>시</Text>
          </View>
          <View key="divider-1" style={styles.statDivider} />
          <View key="stat-subscribers" style={styles.statItem}>
            <Text style={styles.statValue}>{subscriberCount}</Text>
            <Text style={styles.statLabel}>구독자</Text>
          </View>
          <View key="divider-2" style={styles.statDivider} />
          <View key="stat-subscribes" style={styles.statItem}>
            <Text style={styles.statValue}>{subscribeCount}</Text>
            <Text style={styles.statLabel}>구독</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'myPoems' ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab('myPoems')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'myPoems' ? styles.activeTabText : null
              ]}
            >
              내 시
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'pinned' ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab('pinned')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'pinned' ? styles.activeTabText : null
              ]}
            >
              핀
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'private' ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab('private')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'private' ? styles.activeTabText : null
              ]}
            >
              비공개
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'subscribed' ? styles.activeTab : null
            ]}
            onPress={() => setActiveTab('subscribed')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'subscribed' ? styles.activeTabText : null
              ]}
            >
              구독 중
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {renderTabContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screenLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    marginLeft: 'auto',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0080ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  penname: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  emotionSummaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0080ff',
  },
  emotionSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0080ff',
  },
  emotionSummaryText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  emotionSummaryButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,128,255,0.1)',
    borderRadius: 20,
  },
  emotionSummaryButtonText: {
    fontSize: 12,
    color: '#0080ff',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0080ff',
  },
  tabText: {
    fontSize: 15,
    color: '#888',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#0080ff',
  },
  tabContent: {
    padding: 16,
    paddingBottom: 40,
  },
  poemItem: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  poemItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  poemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  poemBadges: {
    flexDirection: 'row',
  },
  pinnedBadge: {
    backgroundColor: '#ffd43b',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginLeft: 6,
  },
  pinnedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  privateBadge: {
    backgroundColor: '#adb5bd',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginLeft: 6,
  },
  privateText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  poemDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  poemPreview: {
    fontSize: 14,
    color: '#444',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  poemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCount: {
    marginLeft: 4,
  },
}); 