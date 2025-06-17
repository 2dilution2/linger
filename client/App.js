import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, Text, BackHandler, View } from 'react-native';
import { NavigationContainer, CommonActions, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { SafeAreaProvider, SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';

// 스크린 임포트
import { MainNavigator } from './navigation/MainNavigator';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { PoemDetailScreen } from './screens/PoemDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { ChangePasswordScreen } from './screens/ChangePasswordScreen';
import { CommentsScreen } from './screens/CommentsScreen';
import { AboutScreen } from './screens/AboutScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { TermsScreen } from './screens/TermsScreen';
import { WritePoemScreen } from './screens/WritePoemScreen';

// Redux 스토어 임포트
import store from './store';
import { selectIsLoggedIn, loadStoredAuth, selectUser, logout } from './store/slices/authSlice';
import { setUnauthorizedCallback } from './services/api';

// 공통 스타일 임포트
import { colors, containers, spacing, shadows } from './styles/common';

// 네비게이션 테마 설정
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

// 루트 스택 네비게이터
const Stack = createNativeStackNavigator();

// 오류 발생 시 표시할 컴포넌트
const ErrorFallback = ({ error }) => (
  <View style={[containers.centered, { padding: spacing.medium }]}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>오류가 발생했습니다</Text>
    <Text style={{ textAlign: 'center', marginBottom: 20 }}>{error?.message || '알 수 없는 오류가 발생했습니다'}</Text>
    <Text style={{ color: '#666' }}>앱을 다시 시작해보세요</Text>
  </View>
);

// 메인 애플리케이션 컴포넌트
const MainApp = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  // 네비게이션 레퍼런스 생성
  const navigationRef = useRef(null);

  // 로그인 상태가 변경될 때 네비게이션 처리
  useEffect(() => {
    if (navigationRef.current) {
      if (isLoggedIn) {
        console.log('로그인 상태 감지: Main 화면으로 이동');
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      } else {
        console.log('로그아웃 상태 감지: Login 화면으로 이동');
        // 로그아웃 시 API 호출 취소 상태 업데이트
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // 앱 시작 시 저장된 인증 상태 불러오기
    dispatch(loadStoredAuth());
    
    // 401 에러 발생 시 로그아웃 처리 및 로그인 화면으로 이동
    setUnauthorizedCallback(() => {
      dispatch(logout());
      // 네비게이션 ref를 통해 리셋
      if (navigationRef.current) {
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    });

    // 안드로이드 뒤로가기 처리
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (navigationRef.current) {
          // 뒤로갈 수 있는 상태인지 확인
          const canGoBack = navigationRef.current.canGoBack();
          if (canGoBack) {
            navigationRef.current.goBack();
            return true;
          }
        }
        return false; // 기본 동작 수행
      }
    );

    return () => backHandler.remove();
  }, [dispatch]);

  // 네비게이션 상태 변경 시 로깅 (필요시)
  const handleNavigationStateChange = (state) => {
    if (state && state.routes && state.index >= 0) {
      const route = state.routes[state.index];
      console.log(`화면 이동: ${route.name}`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaViewRN style={containers.safeArea}>
        <NavigationContainer 
          ref={navigationRef}
          theme={MyTheme}
          onStateChange={handleNavigationStateChange}
          fallback={<Text>로딩 중...</Text>}
        >
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              gestureEnabled: true,
              animationEnabled: true,
              animation: 'slide_from_right',
              gestureDirection: 'horizontal',
              headerStyle: {
                backgroundColor: colors.background,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              },
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
                color: colors.text,
              },
              headerLeftContainerStyle: {
                paddingLeft: spacing.medium,
              },
              headerRightContainerStyle: {
                paddingRight: spacing.medium,
              },
              // 안드로이드에서 네비게이션 바 겹침 방지
              contentStyle: {
                backgroundColor: colors.background,
                ...(Platform.OS === 'android' && {
                  paddingBottom: 10, // 안드로이드 네비게이션 바 높이 (줄임)
                }),
              },
            }}
            initialRouteName={isLoggedIn ? "Main" : "Login"}
          >
            {/* 인증 관련 화면 */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            
            {/* 메인 네비게이터 */}
            <Stack.Screen 
              name="Main" 
              component={MainNavigator} 
              options={{ gestureEnabled: false }}
            />
            
            {/* 공통 화면들 */}
            <Stack.Screen name="PoemDetail" component={PoemDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen 
              name="Comments" 
              component={CommentsScreen}
              options={{ 
                headerShown: true,
                title: '댓글'
              }}
            />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen 
              name="WritePoem" 
              component={WritePoemScreen}
              options={{ 
                headerShown: false,
                title: '시 쓰기'
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaViewRN>
    </SafeAreaProvider>
  );
};

// 앱 컴포넌트
export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}

