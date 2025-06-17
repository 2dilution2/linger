import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { colors, layout, shadows } from '../styles/common';

// 스크린 컴포넌트 임포트
import { WritePoemScreen } from '../screens/WritePoemScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CommunityFeedScreen } from '../screens/CommunityFeedScreen';
import { EmotionAnalyticsScreen } from '../screens/EmotionAnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const isIphoneX = Platform.OS === 'ios' && (height > 800 || width > 800);

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'WritePoem') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          height: layout.tabBarHeight,
          paddingBottom: layout.tabBarPadding,
          paddingTop: 10,
          ...(Platform.OS === 'android' && {
            paddingBottom: 10,
            height: 60,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            ...shadows.medium,
          }),
        },
        tabBarHideOnKeyboard: true, // 키보드가 나타날 때 탭바 숨김
        tabBarBackground: () => (
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'android' ? 5 : 0,
        },
      })}
    >
      <Tab.Screen 
        name="WritePoem" 
        component={WritePoemScreen}
        options={{ title: '시 쓰기' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: '시가 머문 순간' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityFeedScreen}
        options={{ title: '커뮤니티' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={EmotionAnalyticsScreen}
        options={{ title: '감정 분석' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '마이페이지' }}
      />
    </Tab.Navigator>
  );
} 