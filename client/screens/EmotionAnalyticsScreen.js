import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { poemService, interactionService } from '../services';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function EmotionAnalyticsScreen() {
  const [emotions, setEmotions] = useState([]);
  const [frequentWords, setFrequentWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('ko-KR', { month: 'long' })
  );
  
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    setLoading(true);
    await loadAnalyticsData();
    setLoading(false);
  };
  
  const loadAnalyticsData = async () => {
    try {
      // 감정 통계 데이터 가져오기
      console.log('감정 통계 데이터 요청 시작');
      const emotionStats = await poemService.getEmotionStats();
      console.log('감정 통계 데이터 수신 완료:', emotionStats.length, '개 항목');
      setEmotions(emotionStats);
      
      // 자주 사용한 단어 가져오기
      console.log('자주 사용한 단어 데이터 요청 시작');
      const wordStats = await poemService.getFrequentWords();
      console.log('자주 사용한 단어 데이터 수신 완료:', wordStats.length, '개 단어');
      setFrequentWords(wordStats);
    } catch (error) {
      console.error('감정 분석 데이터 가져오기 실패:', error);
      
      // 401 오류인 경우 로그인 화면으로 이동
      if (error.response && error.response.status === 401) {
        try {
          // 토큰 삭제
          await AsyncStorage.removeItem('token');
          // 리덕스 상태 초기화
          dispatch(logout());
          
          // 알림 후 로그인 화면으로 이동
          Alert.alert(
            '로그인 필요',
            '세션이 만료되었습니다. 다시 로그인해주세요.',
            [{ 
              text: '로그인', 
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }]
                });
              } 
            }]
          );
        } catch (storageError) {
          console.error('로그아웃 처리 오류:', storageError);
        }
      } else {
        Alert.alert('오류', '감정 분석 데이터를 불러오는데 실패했습니다.');
      }
      
      // 오류 시 빈 데이터 설정
      setEmotions([]);
      setFrequentWords([]);
    } finally {
      console.log('감정분석 새로고침 완료');
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    console.log('감정분석 새로고침 시작');
    setRefreshing(true);
    
    loadAnalyticsData();
  };
  
  const renderEmotionChart = () => {
    if (emotions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 감정 데이터가 충분하지 않습니다.</Text>
          <Text style={styles.emptySubtext}>더 많은 시를 작성하고 감정 태그를 추가해보세요.</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.chartContainer}>
        {emotions.map((emotion, index) => (
          <View key={index} style={styles.chartRow}>
            <View style={styles.chartLabelContainer}>
              <Text style={styles.chartLabel}>{emotion.name}</Text>
            </View>
            <View style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    width: `${emotion.percentage}%`,
                    backgroundColor: emotion.color || '#0080ff'
                  }
                ]}
              />
              <Text style={styles.chartValue}>{emotion.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  const renderWordCloud = () => {
    if (frequentWords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 단어 데이터가 충분하지 않습니다.</Text>
          <Text style={styles.emptySubtext}>더 많은 시를 작성하면 자주 사용하는 단어를 분석해 드릴게요.</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.wordCloudContainer}>
        {frequentWords.map((word, index) => (
          <View 
            key={index} 
            style={[
              styles.wordItem,
              { 
                fontSize: Math.max(14, Math.min(24, 14 + (word.count / 5))),
                backgroundColor: `rgba(0, 128, 255, ${0.2 + (index / frequentWords.length) * 0.6})`
              }
            ]}
          >
            <Text style={styles.wordText}>{word.word}</Text>
            <Text style={styles.wordCount}>{word.count}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0080ff" />
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#0080ff']}
          tintColor="#0080ff"
          progressViewOffset={10}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>감정 분석</Text>
        <Text style={styles.headerSubtitle}>당신의 시에 담긴 감정을 분석해 드려요</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{currentMonth} 감정 분포</Text>
        {renderEmotionChart()}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>자주 사용한 단어</Text>
        {renderWordCloud()}
      </View>
      
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>감정 인사이트</Text>
        <Text style={styles.insightText}>
          {emotions.length > 0
            ? `이번 달에는 '${emotions[0]?.name || '기쁨'}'을 가장 많이 느끼셨네요. ${
                emotions[0]?.name === '기쁨' || emotions[0]?.name === '행복' || emotions[0]?.name === '사랑'
                  ? '긍정적인 감정이 가득한 시간을 보내고 계시네요.'
                  : emotions[0]?.name === '슬픔' || emotions[0]?.name === '우울' || emotions[0]?.name === '외로움'
                  ? '감정을 시로 표현하는 것은 치유의 과정이 될 수 있어요.'
                  : '감정의 흐름을 알아보세요.'
              }`
            : '아직 작성한 시가 충분하지 않아요. 더 많은 시를 작성하면 감정 분석 결과를 볼 수 있어요.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabelContainer: {
    width: 80,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#efefef',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartBar: {
    height: '100%',
  },
  chartValue: {
    position: 'absolute',
    right: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  wordCloudContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  wordItem: {
    margin: 4,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  wordText: {
    color: '#333',
    fontWeight: 'bold',
  },
  wordCount: {
    fontSize: 10,
    color: '#666',
  },
  insightCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0080ff',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0080ff',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
}); 