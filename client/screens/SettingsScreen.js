import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from '../store/slices/authSlice';

export function SettingsScreen({ navigation }) {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // 다크모드 토글
  const toggleDarkMode = () => {
    setDarkModeEnabled(previousState => !previousState);
    // 실제 다크모드 변경은 테마 시스템 구현 후 추가
  };

  // 푸시 알림 토글
  const togglePushNotifications = () => {
    setNotificationEnabled(previousState => !previousState);
    // 실제 푸시 알림 설정은 알림 시스템 구현 후 추가
  };

  // 이메일 알림 토글
  const toggleEmailNotifications = () => {
    setAutoSaveEnabled(previousState => !previousState);
    // 실제 이메일 알림 설정은 알림 시스템 구현 후 추가
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive', 
          onPress: async () => {
            setLoading(true);
            try {
              // logoutUser 액션 디스패치 - AsyncStorage 삭제 및 Redux 상태 초기화
              const result = await dispatch(logoutUser());
              console.log('로그아웃 결과:', result);
              
              // 로그인 화면으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('로그아웃 실패:', error);
              
              // 에러가 발생해도 로그인 화면으로 이동 시도
              try {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (navError) {
                console.error('화면 이동 실패:', navError);
                Alert.alert('오류', '로그아웃 처리 중 오류가 발생했습니다.');
              }
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  // 계정 삭제 처리
  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert('알림', '이 기능은 아직 구현되지 않았습니다.');
          } 
        }
      ]
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>프로필 수정</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Ionicons name="key-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>비밀번호 변경</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        
        <View style={styles.switchItem}>
          <Ionicons name="notifications-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>알림</Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#80c0ff" }}
            thumbColor={notificationEnabled ? "#0080ff" : "#f4f3f4"}
            onValueChange={togglePushNotifications}
            value={notificationEnabled}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 설정</Text>
        
        <View style={styles.switchItem}>
          <Ionicons name="moon-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>다크 모드</Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#80c0ff" }}
            thumbColor={darkModeEnabled ? "#0080ff" : "#f4f3f4"}
            onValueChange={toggleDarkMode}
            value={darkModeEnabled}
          />
        </View>
        
        <View style={styles.switchItem}>
          <Ionicons name="save-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>자동 저장</Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#80c0ff" }}
            thumbColor={autoSaveEnabled ? "#0080ff" : "#f4f3f4"}
            onValueChange={toggleEmailNotifications}
            value={autoSaveEnabled}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정보</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('About')}
        >
          <Ionicons name="information-circle-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>앱 정보</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>개인정보 처리방침</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Terms')}
        >
          <Ionicons name="document-text-outline" size={24} color="#0080ff" style={styles.menuIcon} />
          <Text style={styles.menuText}>이용약관</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.logoutText}>로그아웃</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountText}>계정 삭제</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Linger v1.0.0</Text>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 14,
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    paddingVertical: 14,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: '#ff3b30',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
}); 