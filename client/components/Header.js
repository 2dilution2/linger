import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles, { colors, spacing, typography, layout } from '../styles/common';

/**
 * 공통 헤더 컴포넌트
 * @param {string} title - 헤더 제목
 * @param {boolean} showBack - 뒤로가기 버튼 표시 여부 (기본값: true)
 * @param {function} onBackPress - 뒤로가기 버튼 클릭 시 실행할 함수 (기본값: navigation.goBack)
 * @param {React.ReactNode} rightComponent - 오른쪽에 표시할 컴포넌트
 * @param {boolean} transparent - 투명 배경 여부 (기본값: false)
 * @param {string} titleColor - 제목 색상 (기본값: colors.text)
 * @param {string} iconColor - 아이콘 색상 (기본값: colors.text)
 * @param {Object} style - 추가 스타일
 */
export function Header({
  title,
  showBack = true,
  onBackPress,
  rightComponent,
  transparent = false,
  titleColor = colors.text,
  iconColor = colors.text,
  style,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 뒤로가기 버튼 클릭 핸들러
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <View
      style={[
        headerStyles.container,
        transparent ? headerStyles.transparent : headerStyles.solid,
        { paddingTop: insets.top > 0 ? insets.top : StatusBar.currentHeight || 0 },
        style,
      ]}
    >
      <View style={headerStyles.content}>
        {/* 왼쪽 영역 (뒤로가기 버튼) */}
        <View style={headerStyles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              style={headerStyles.backButton}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* 중앙 영역 (제목) */}
        <View style={headerStyles.titleContainer}>
          <Text 
            style={[headerStyles.title, { color: titleColor }]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        
        {/* 오른쪽 영역 (액션 버튼) */}
        <View style={headerStyles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
}

// 헤더 액션 버튼 컴포넌트
export function HeaderButton({ iconName, onPress, color = colors.text }) {
  return (
    <TouchableOpacity
      style={headerStyles.actionButton}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name={iconName} size={24} color={color} />
    </TouchableOpacity>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  solid: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
  },
  leftContainer: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.headline,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
  },
});

export default Header; 