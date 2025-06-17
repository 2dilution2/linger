import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser, selectIsLoggedIn } from '../store/slices/authSlice';
import { poemService } from '../services';

export function CalendarScreen({ navigation }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const user = useSelector(selectUser);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  
  // onRefresh 함수와 fetchMonthData 분리 (이름도 변경)
  // 새로고침용 함수
  const handleRefresh = () => {
    console.log('달력 새로고침 시작');
    setRefreshing(true);
    
    // 직접 fetchCalendarData 호출
    fetchCalendarData();
  };
  
  // 달력 데이터 가져오기
  const fetchCalendarData = async () => {
    if (!isLoggedIn) {
      setCalendarData({});
      setRefreshing(false);
      return;
    }
    
    try {
      const data = await poemService.getPoemsByDate(currentYear, currentMonth + 1);
      setCalendarData(data);
    } catch (error) {
      console.error('달력 데이터 가져오기 실패:', error);
      // 401 오류인 경우 로그인 화면으로 이동
      if (error.response && error.response.status === 401) {
        Alert.alert(
          '로그인 필요',
          '달력 기능을 사용하려면 로그인이 필요합니다.',
          [{ text: '로그인', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('오류', '달력 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('달력 새로고침 완료');
    }
  };
  
  // 최초 로드 및 월 변경 시 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    fetchCalendarData().finally(() => {
      setLoading(false);
    });
  }, [currentMonth, currentYear, isLoggedIn]);
  
  // 이전 달로 이동
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // 다음 달로 이동
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // 달력 일 항목 선택
  const handleDaySelect = async (day) => {
    setSelectedDay(day);
    
    // 서버 응답이 객체 형태로 오기 때문에 배열이 아닌 객체에서 데이터 조회
    const dayData = calendarData[day];
    if (dayData && dayData.length > 0) {
      try {
        setLoading(true);
        // 해당 날짜의 첫번째 시를 선택
        const poemId = dayData[0].id;
        const poem = await poemService.getPoemById(poemId);
        setSelectedPoem(poem);
      } catch (error) {
        console.error('시 가져오기 실패:', error);
        Alert.alert('오류', '시 데이터를 불러오는데 실패했습니다.');
        setSelectedPoem(null);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedPoem(null);
    }
  };
  
  // 현재 월의 일수 계산
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // 현재 월의 1일의 요일 계산 (0: 일요일, 6: 토요일)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // 달력 그리드 생성
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    
    // 첫째 주 이전의 빈 칸
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }
    
    // 실제 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      // 서버 응답이 객체 형태로 오기 때문에 배열이 아닌 객체에서 데이터 조회
      const hasPoem = !!calendarData[day] && calendarData[day].length > 0;
      
      days.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.day,
            hasPoem && styles.hasPoem,
            selectedDay === day && styles.selectedDay,
          ]}
          onPress={() => handleDaySelect(day)}
        >
          <Text style={[
            styles.dayText,
            selectedDay === day && styles.selectedDayText,
          ]}>
            {day}
          </Text>
          {hasPoem && <View style={styles.poemIndicator} />}
        </TouchableOpacity>
      );
    }
    
    return days;
  };
  
  // 월 이름 가져오기
  const getMonthName = (month) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month];
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>시가 머문 순간</Text>
      </View>
      
      {!isLoggedIn ? (
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>
            달력 기능을 사용하려면 로그인이 필요합니다.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>로그인하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Ionicons name="chevron-back" size={24} color="#0080ff" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{currentYear}년 {getMonthName(currentMonth)}</Text>
            <TouchableOpacity onPress={goToNextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#0080ff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekDays}>
            <Text style={styles.weekDay}>일</Text>
            <Text style={styles.weekDay}>월</Text>
            <Text style={styles.weekDay}>화</Text>
            <Text style={styles.weekDay}>수</Text>
            <Text style={styles.weekDay}>목</Text>
            <Text style={styles.weekDay}>금</Text>
            <Text style={styles.weekDay}>토</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0080ff" />
            </View>
          ) : (
            <>
              <View style={styles.calendarGrid}>
                {renderCalendarGrid()}
              </View>
              
              <ScrollView 
                style={styles.poemContainer}
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
                {selectedPoem ? (
                  <View style={styles.poemCard}>
                    <Text style={styles.poemTitle}>{selectedPoem.title}</Text>
                    <Text style={styles.poemDate}>
                      {new Date(selectedPoem.createdAt).toLocaleDateString('ko-KR')}
                    </Text>
                    <Text style={styles.poemContent}>{selectedPoem.content}</Text>
                  </View>
                ) : selectedDay ? (
                  <View style={styles.noPoemMessage}>
                    <Text style={styles.noPoemText}>이 날에는 작성된 시가 없습니다.</Text>
                    <TouchableOpacity 
                      style={styles.writePoemButton}
                      onPress={() => navigation.navigate('WritePoem')}
                    >
                      <Text style={styles.writePoemText}>시 작성하기</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noPoemMessage}>
                    <Text style={styles.noPoemText}>날짜를 선택하여 시를 확인하세요.</Text>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: '#555',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#eee',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  hasPoem: {
    backgroundColor: '#f3f9ff',
  },
  selectedDay: {
    backgroundColor: '#0080ff',
  },
  dayText: {
    fontSize: 16,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  poemIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0080ff',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poemContainer: {
    flex: 1,
    marginTop: 20,
  },
  poemCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  poemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  poemDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  poemContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  noPoemMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noPoemText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  writePoemButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  writePoemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 