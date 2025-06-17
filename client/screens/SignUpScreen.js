import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { loginUserSuccess } from '../store/slices/authSlice';
import { userService } from '../services';

export function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [penname, setPenname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPennameChecking, setIsPennameChecking] = useState(false);
  const [isPennameAvailable, setIsPennameAvailable] = useState(null);
  const [pennameMessage, setPennameMessage] = useState('');
  
  const dispatch = useDispatch();
  
  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return false;
    }
    
    if (!penname.trim()) {
      Alert.alert('알림', '필명을 입력해주세요.');
      return false;
    }
    
    if (isPennameAvailable === false) {
      Alert.alert('알림', '이미 사용 중인 필명입니다. 다른 필명을 입력해주세요.');
      return false;
    }
    
    if (isPennameAvailable === null) {
      Alert.alert('알림', '필명 중복 확인을 해주세요.');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return false;
    }
    
    if (password.length < 8) {
      Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return false;
    }
    
    return true;
  };
  
  const handleSignUp = async () => {
    if (!validateInputs()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const userData = {
        email,
        password,
        penname
      };
      
      console.log('회원가입 요청 시작:', userData);
      
      // 회원가입 API 호출
      const response = await userService.register(userData);
      
      console.log('회원가입 성공 응답:', response);
      
      // 회원가입 성공 시 로그인 처리 (자동 로그인)
      dispatch(loginUserSuccess({
        token: response.token,
        user: response.user
      }));
      
      // 회원가입 성공 메시지
      Alert.alert('성공', '회원가입이 완료되었습니다.');
      
    } catch (error) {
      console.error('회원가입 실패:', error);
      console.log('에러 상세 정보:', error.response?.data || error.message);
      
      // 오류 메시지 표시
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.';
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 필명 변경 시 중복 체크 상태 초기화
  const handlePennameChange = (text) => {
    setPenname(text);
    setIsPennameAvailable(null);
    setPennameMessage('');
  };
  
  // 필명 중복 체크
  const checkPennameAvailability = async () => {
    if (!penname.trim()) {
      setPennameMessage('필명을 입력해주세요.');
      return;
    }
    
    try {
      setIsPennameChecking(true);
      const result = await userService.checkPennameAvailability(penname);
      setIsPennameAvailable(result.available);
      setPennameMessage(result.message || (result.available ? '사용 가능한 필명입니다.' : '이미 사용 중인 필명입니다.'));
    } catch (error) {
      console.error('필명 중복 확인 오류:', error);
      setIsPennameAvailable(false);
      setPennameMessage('필명 확인 중 오류가 발생했습니다.');
    } finally {
      setIsPennameChecking(false);
    }
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleGoBack}
              >
                <Text style={styles.backButtonText}>← 뒤로</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>회원가입</Text>
              <View style={styles.backButtonPlaceholder} />
            </View>
            
            <Text style={styles.subtitle}>나만의 필명으로 시적 여정을 시작하세요</Text>
            
            <View style={styles.formContainer}>
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
                <Text style={styles.inputLabel}>필명</Text>
                <View style={styles.pennameInputContainer}>
                  <TextInput
                    style={styles.pennameInput}
                    placeholder="다른 사용자에게 보여질 필명을 입력하세요"
                    value={penname}
                    onChangeText={handlePennameChange}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.checkButton,
                      isPennameChecking && styles.checkingButton
                    ]}
                    onPress={checkPennameAvailability}
                    disabled={isPennameChecking || !penname.trim()}
                  >
                    {isPennameChecking ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.checkButtonText}>중복확인</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {pennameMessage ? (
                  <Text 
                    style={[
                      styles.pennameMessage, 
                      isPennameAvailable === true ? styles.availableMessage : 
                      isPennameAvailable === false ? styles.unavailableMessage : null
                    ]}
                  >
                    {pennameMessage}
                  </Text>
                ) : (
                  <Text style={styles.inputDescription}>
                    필명은 나중에 변경할 수 있습니다.
                  </Text>
                )}
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
                <Text style={styles.inputDescription}>
                  8자 이상의 문자와 숫자를 포함해야 합니다.
                </Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 확인</Text>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="none"
                  autoComplete="off"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>가입하기</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                가입하면 Linger의{' '}
                <Text style={styles.termsHighlight}>이용약관</Text> 및{' '}
                <Text style={styles.termsHighlight}>개인정보처리방침</Text>에 
                동의하는 것으로 간주됩니다.
              </Text>
            </View>
          </ScrollView>
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
    padding: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 10,
    width: 50,
  },
  backButtonPlaceholder: {
    width: 50,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0080ff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 24,
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
  inputDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  signUpButton: {
    backgroundColor: '#0080ff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 10,
    marginBottom: 40,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
  termsHighlight: {
    color: '#0080ff',
    textDecorationLine: 'underline',
  },
  pennameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pennameInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  checkButton: {
    padding: 10,
    backgroundColor: '#0080ff',
    borderRadius: 10,
  },
  checkingButton: {
    backgroundColor: '#888',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pennameMessage: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
  availableMessage: {
    color: '#0080ff',
  },
  unavailableMessage: {
    color: 'red',
  },
}); 