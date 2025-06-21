import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Dimensions, StyleSheet, View, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 공통 스타일 임포트
import { colors, layout, shadows, typography, spacing } from '../styles/common';

// 스크린 임포트
import { WritePoemScreen } from '../screens/WritePoemScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CommunityFeedScreen } from '../screens/CommunityFeedScreen';
import { EmotionAnalyticsScreen } from '../screens/EmotionAnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// iPhone X 이상 모델 체크
const { height, width } = Dimensions.get('window');
const isIphoneX = Platform.OS === 'ios' && (height > 800 || width > 800);

export function MainNavigator() {
    const insets = useSafeAreaInsets();
    
    return (
      <Tab.Navigator
        initialRouteName="WritePoem"
        screenOptions={({ route }) => ({
          headerShown: false,
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
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: Platform.OS === 'android' 
              ? 60 + (insets.bottom > 0 ? insets.bottom : 0) 
              : (isIphoneX ? 90 : 60),
            paddingBottom: Platform.OS === 'android'
              ? 10
              : (isIphoneX ? 30 : 10),
            paddingTop: 10,
            ...shadows.small,
          },
          tabBarLabelStyle: {
            fontSize: typography.caption1,
            fontFamily: typography.fontFamily,
            marginBottom: Platform.OS === 'android' ? 5 : 0,
          },
          tabBarBackground: () => (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} />
          ),
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen 
          name="WritePoem" 
          component={WritePoemScreen}
          options={{
            title: '시 쓰기',
          }}
        />
        <Tab.Screen 
          name="Calendar" 
          component={CalendarScreen}
          options={{
            title: '시가 머문 순간',
          }}
        />
        <Tab.Screen 
          name="Community" 
          component={CommunityFeedScreen}
          options={{
            title: '커뮤니티',
          }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={EmotionAnalyticsScreen}
          options={{ 
            title: '감정 분석',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: '마이페이지',
          }}
        />
      </Tab.Navigator>
    );
} 