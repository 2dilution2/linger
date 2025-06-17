import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 색상 팔레트
export const colors = {
  primary: '#0080ff',
  primaryDark: '#0066cc',
  primaryLight: '#66b3ff',
  secondary: '#ff6b6b',
  background: '#ffffff',
  surface: '#f9f9f9',
  error: '#d32f2f',
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#e0e0e0',
  divider: '#f0f0f0',
  disabled: '#dddddd',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};

// 타이포그래피
export const typography = {
  fontFamily: Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif',
  fontFamilyBold: Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'sans-serif-medium',
  
  // 폰트 사이즈
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  headline: 17,
  body: 16,
  callout: 15,
  subhead: 14,
  footnote: 13,
  caption1: 12,
  caption2: 11,
};

// 간격
export const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
  
  // 화면 가장자리 기본 패딩
  screenPadding: 16,
};

// 그림자 (iOS와 Android 각각에 맞게 최적화)
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    android: {
      elevation: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    android: {
      elevation: 4,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
  }),
};

// 테두리 반경
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 20,
  round: 1000, // 원형 버튼 등에 사용
};

// 레이아웃
export const layout = {
  // 화면 크기
  window: {
    width,
    height,
  },
  
  // 아이폰 X 이상 모델 확인
  isIphoneX: Platform.OS === 'ios' && (height > 800 || width > 800),
  
  // 상태 바 높이 (대략적인 값)
  statusBarHeight: Platform.OS === 'ios' ? (height > 800 ? 44 : 20) : 0,
  
  // 탭 바 높이
  tabBarHeight: Platform.OS === 'ios' ? (height > 800 ? 90 : 60) : 60,
  tabBarPadding: Platform.OS === 'ios' ? (height > 800 ? 30 : 10) : 10,
  
  // 헤더 높이
  headerHeight: 56,
};

// 공통 컨테이너 스타일
export const containers = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginVertical: spacing.small,
    ...shadows.small,
  },
};

// 공통 버튼 스타일
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// 공통 텍스트 스타일
export const texts = {
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.title2,
    color: colors.text,
    marginBottom: spacing.small,
  },
  subtitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.headline,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  body: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: typography.caption1,
    color: colors.textLight,
  },
  error: {
    fontFamily: typography.fontFamily,
    fontSize: typography.footnote,
    color: colors.error,
    marginTop: spacing.tiny,
  },
};

// 입력 필드 스타일
export const inputs = {
  container: {
    marginBottom: spacing.medium,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.tiny,
  },
  field: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.medium,
    fontFamily: typography.fontFamily,
    fontSize: typography.body,
    color: colors.text,
  },
  multiline: {
    minHeight: 100,
    paddingTop: spacing.medium,
    paddingBottom: spacing.medium,
    textAlignVertical: 'top',
  },
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  layout,
  containers,
  buttons,
  texts,
  inputs,
}; 