import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { loginStart, loginUserSuccess, loginFailure } from '../store/slices/authSlice';
import { userService } from '../services';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();

  const handleLogin = async () => {
    // 입력 검증
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      dispatch(loginStart());
      
      // 서버 로그인 API 호출
      const response = await userService.login(email, password);
      
      // 로그인 성공
      dispatch(loginUserSuccess({
        token: response.token,
        user: response.user
      }));
      
      // 로그인 성공 시 redux 상태가 변경되어 App.js에서 자동으로 MainNavigator로 라우팅됨
    } catch (error) {
      console.error('로그인 실패:', error);
      
      // 오류 메시지 표시
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
      Alert.alert('로그인 실패', errorMessage);
      
      dispatch(loginFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      dispatch(loginStart());
      
      // 가상의 구글 로그인 성공 응답
      const mockResponse = {
        token: 'google-mock-token-123456',
        user: {
          id: '123',
          email: 'google_user@example.com',
          name: '구글 사용자',
          profileImage: 'https://example.com/default-profile.jpg'
        }
      };
      
      // 로그인 성공 처리
      dispatch(loginUserSuccess({
        token: mockResponse.token,
        user: mockResponse.user
      }));
      
    } catch (error) {
      console.error('구글 로그인 실패:', error);
      dispatch(loginFailure('구글 로그인에 실패했습니다.'));
      Alert.alert('로그인 실패', '구글 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#f0f9ff', '#e6f7ff', '#d0edff']}
        style={styles.container}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.innerContainer}
        >
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>로그인</Text>
            <Text style={styles.subtitleText}>당신의 감정을 시로 표현해보세요</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="이메일을 입력하세요"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="none"
                autoComplete="off"
              />
            </View>
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>또는</Text>
              <View style={styles.separatorLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Text style={styles.socialButtonText}>구글로 로그인</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>계정이 없으신가요?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLinkText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0080ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#fff',
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
  },
  formContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0080ff',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0080ff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  separatorText: {
    color: '#888',
    paddingHorizontal: 10,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#555',
    fontSize: 14,
    marginRight: 5,
  },
  signupLinkText: {
    color: '#0080ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 