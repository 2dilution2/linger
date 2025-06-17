import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services';

export function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 비밀번호 변경 함수
  const changePassword = async () => {
    // 입력값 검증
    if (!currentPassword.trim()) {
      Alert.alert('알림', '현재 비밀번호를 입력해주세요.');
      return;
    }
    
    if (!newPassword.trim()) {
      Alert.alert('알림', '새 비밀번호를 입력해주세요.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('알림', '새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    setLoading(true);
    
    try {
      await userService.changePassword({
        currentPassword,
        newPassword
      });
      
      Alert.alert('성공', '비밀번호가 변경되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      
      let errorMessage = '비밀번호 변경에 실패했습니다.';
      if (error.response && error.response.status === 401) {
        errorMessage = '현재 비밀번호가 올바르지 않습니다.';
      }
      
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>현재 비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="현재 비밀번호"
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons 
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>새 비밀번호</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="새 비밀번호"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.passwordHint}>
            비밀번호는 8자 이상이어야 합니다.
          </Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>새 비밀번호 확인</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="새 비밀번호 확인"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <Text style={styles.errorText}>
              비밀번호가 일치하지 않습니다.
            </Text>
          )}
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0080ff" style={styles.loading} />
      ) : (
        <TouchableOpacity 
          style={[
            styles.changeButton,
            !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword
              ? styles.changeButtonDisabled 
              : null
          ]} 
          onPress={changePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
        >
          <Text style={styles.changeButtonText}>비밀번호 변경</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  changeButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    marginVertical: 24,
  },
}); 