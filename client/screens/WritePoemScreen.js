import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { poemService, interactionService } from '../services';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, containers, inputs, buttons, texts, borderRadius, layout, shadows } from '../styles/common';

export function WritePoemScreen({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [emotionTags, setEmotionTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTags, setFetchingTags] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false); // 공개 여부 상태
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 상태
  const [poemId, setPoemId] = useState(null); // 수정할 시 ID
  const insets = useSafeAreaInsets();
  
  // 네비게이션 옵션 설정 - 헤더 숨김 처리
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // 기본 헤더 숨김
    });
  }, [navigation]);
  
  // 초기 데이터 로드 (수정 모드 대응)
  useEffect(() => {
    if (route.params?.mode === 'edit' && route.params?.poemId) {
      // 수정 모드 설정
      setIsEditMode(true);
      setPoemId(route.params.poemId);
      
      // 기존 시 데이터 로드
      const loadPoemData = async () => {
        setLoading(true);
        try {
          const poem = await poemService.getPoemById(route.params.poemId);
          console.log('수정할 시 데이터 로드:', poem);
          
          // 폼 데이터 설정
          setTitle(poem.title || '');
          setContent(poem.content || '');
          setIsPublic(poem.isPublic || false);
          
          // 감정 태그 ID 설정 (문자열 또는 객체 배열 처리)
          if (poem.emotionTags && poem.emotionTags.length > 0) {
            // 서버에서 오는 데이터 형식에 따라 처리
            // 1. ID 문자열 배열인 경우
            if (typeof poem.emotionTags[0] === 'string') {
              setSelectedTags(poem.emotionTags);
            }
            // 2. 객체 배열인 경우 ID 추출
            else if (typeof poem.emotionTags[0] === 'object' && poem.emotionTags[0].id) {
              setSelectedTags(poem.emotionTags.map(tag => tag.id));
            }
            // 3. 태그 이름만 있는 경우 (처리 필요하면 추가)
            else {
              setSelectedTags([]);
            }
          }
        } catch (error) {
          console.error('시 데이터 로드 실패:', error);
          Alert.alert('오류', '시 데이터를 불러오는데 실패했습니다.');
          navigation.goBack(); // 에러 시 이전 화면으로
        } finally {
          setLoading(false);
        }
      };
      
      loadPoemData();
    }
  }, [route.params]);
  
  // 감정 태그 로드
  useEffect(() => {
    const loadEmotionTags = async () => {
      setFetchingTags(true);
      try {
        const tags = await interactionService.getEmotionTags();
        console.log('감정 태그 응답 데이터:', tags);
        setEmotionTags(tags);
      } catch (error) {
        console.error('감정 태그 로드 실패:', error);
        Alert.alert('오류', '감정 태그를 불러오는데 실패했습니다.');
      } finally {
        setFetchingTags(false);
      }
    };
    
    loadEmotionTags();
  }, []);

  // 태그 입력 처리
  const handleTagInput = (text) => {
    setTagInput(text);
    
    // 띄어쓰기나 엔터로 새 태그 생성
    if (text.endsWith(' ') || text.endsWith('\n')) {
      const newTag = text.trim();
      if (newTag) {
        createNewTag(newTag);
        return;
      }
    }
    
    // 자동완성 검색
    if (text.trim()) {
      const filtered = emotionTags.filter(tag => 
        tag.name.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestedTags(filtered);
    } else {
      setSuggestedTags([]);
    }
  };

  // 새 태그 생성
  const createNewTag = async (tagName) => {
    try {
      const response = await interactionService.createEmotionTag({ name: tagName });
      console.log('새 태그 생성 응답:', response);
      
      if (response.id) {
        // 새로 생성된 태그를 목록에 추가
        setEmotionTags(prev => [...prev, response]);
        // 새 태그 선택
        setSelectedTags(prev => [...prev, response.id]);
        // 입력창 초기화
        setTagInput('');
        setSuggestedTags([]);
      }
    } catch (error) {
      console.error('새 태그 생성 실패:', error);
      Alert.alert('오류', '새 태그를 생성하는데 실패했습니다.');
    }
  };

  // 태그 선택
  const selectTag = (tagId) => {
    // 한 번에 하나의 태그만 선택 (기존 태그 목록을 대체)
    setSelectedTags([tagId]);
    setTagInput('');
    setSuggestedTags([]);
  };

  // 선택된 태그 표시
  const renderSelectedTags = () => {
    return selectedTags.map(tagId => {
      const tag = emotionTags.find(t => t.id === tagId);
      if (!tag) return null;
      
      return (
        <TouchableOpacity
          key={`selected-${tagId}`}
          style={localStyles.tagButton}
          onPress={() => toggleTag(tagId)}
        >
          <Text style={localStyles.tagText}>#{tag.name}</Text>
        </TouchableOpacity>
      );
    });
  };

  // 태그 선택/해제 토글
  const toggleTag = (tagId) => {
    // 이미 선택된 태그를 클릭한 경우 선택 해제
    if (selectedTags.includes(tagId)) {
      setSelectedTags([]);
    } else {
      // 새로운 태그 선택 (이전 선택 모두 해제)
      setSelectedTags([tagId]);
    }
  };
  
  // 시 저장 함수
  const savePoem = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const poemData = {
        title: title.trim(),
        content: content.trim(),
        emotionTags: selectedTags,
        isPublic: isPublic,
        // 기본 스타일 설정
        background: 'gradient',
        font: 'gothic'
      };

      let response;
      
      if (isEditMode && poemId) {
        // 수정 모드 - 기존 시 업데이트
        response = await poemService.updatePoem(poemId, poemData);
        Alert.alert(
          '성공', 
          '시가 수정되었습니다.',
          [{ text: '확인', onPress: () => navigation.goBack() }]
        );
      } else {
        // 신규 작성 모드
        response = await poemService.createPoem(poemData);
        Alert.alert(
          '성공', 
          isPublic ? '시가 커뮤니티에 공개되었습니다.' : '시가 저장되었습니다.',
          [{ text: '확인', onPress: () => navigation.navigate('Calendar') }]
        );
      }
      
      console.log('시 저장 응답:', response);
    } catch (error) {
      console.error('시 저장 실패:', error);
      Alert.alert('오류', '시를 저장하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 뒤로가기 처리
  const handleBackPress = () => {
    if (title.trim() || content.trim()) {
      // 작성 중인 내용이 있으면 확인
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 취소하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '나가기', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // 커스텀 헤더 렌더링
  const renderHeader = () => {
    return (
      <View style={localStyles.headerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
        <View style={localStyles.headerContent}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            style={localStyles.headerButton}
            onPress={handleBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          {/* 제목 */}
          <Text style={localStyles.headerTitle}>
            {isEditMode ? "시 수정하기" : "시 쓰기"}
          </Text>
          
          {/* 저장 버튼 */}
          <TouchableOpacity
            style={localStyles.headerButton}
            onPress={savePoem}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="checkmark" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={containers.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 커스텀 헤더 */}
      {renderHeader()}
      
      {loading ? (
        <View style={containers.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[texts.body, { marginTop: spacing.medium }]}>
            {isEditMode ? '시 수정 중...' : '시 저장 중...'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={localStyles.container}
          contentContainerStyle={[
            localStyles.contentContainer,
            { paddingBottom: Math.max(insets.bottom, 20) + (Platform.OS === 'android' ? 60 : 0) }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 제목 입력 */}
          <View style={localStyles.cardContainer}>
            <TextInput
              style={localStyles.titleInput}
              placeholder="제목을 입력하세요"
              placeholderTextColor={colors.textLight}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          {/* 내용 입력 */}
          <View style={localStyles.contentCard}>
            <TextInput
              style={localStyles.contentInput}
              placeholder="이곳에 시를 적어보세요..."
              placeholderTextColor={colors.textLight}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          {/* 감정 태그 섹션 */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>감정 태그</Text>
            
            {fetchingTags ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                {/* 선택된 태그 표시 */}
                <View style={localStyles.selectedTagsContainer}>
                  {renderSelectedTags()}
                </View>
                
                {/* 태그 입력 */}
                <View style={localStyles.tagInputContainer}>
                  <TextInput
                    style={localStyles.tagInput}
                    placeholder="감정 태그 입력 (띄어쓰기로 추가)"
                    placeholderTextColor={colors.textLight}
                    value={tagInput}
                    onChangeText={handleTagInput}
                  />
                </View>
                
                {/* 태그 제안 */}
                {suggestedTags.length > 0 && (
                  <View style={localStyles.suggestedTagsContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={localStyles.suggestedTagsContent}
                    >
                      {suggestedTags.map(tag => (
                        <TouchableOpacity
                          key={`suggestion-${tag.id}`}
                          style={localStyles.suggestionTag}
                          onPress={() => selectTag(tag.id)}
                        >
                          <Text style={localStyles.suggestionText}>#{tag.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
              </>
            )}
          </View>
          
          {/* 커뮤니티 공개 설정 */}
          <View style={localStyles.switchCard}>
            <View style={localStyles.switchContainer}>
              <Text style={texts.body}>커뮤니티에 공개</Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: colors.disabled, true: colors.primaryLight }}
                thumbColor={isPublic ? colors.primary : '#f4f3f4'}
              />
            </View>
            <Text style={localStyles.switchDescription}>
              {isPublic 
                ? '다른 사용자들이 내 시를 볼 수 있습니다.' 
                : '나만 볼 수 있는 개인 시로 저장됩니다.'}
            </Text>
          </View>
          
          {/* 저장 버튼 */}
          <TouchableOpacity
            style={localStyles.saveButton}
            onPress={savePoem}
            activeOpacity={0.8}
          >
            <Text style={localStyles.saveButtonText}>
              {isEditMode ? '수정하기' : '작성하기'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  // 헤더 스타일
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 36 : StatusBar.currentHeight || 0,
  },
  headerContent: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.medium,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: spacing.medium,
    paddingBottom: spacing.xxlarge * 2,
  },
  cardContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    marginBottom: spacing.medium,
    ...shadows.small,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: spacing.small,
    color: colors.text,
  },
  contentCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.large,
    ...shadows.small,
  },
  contentInput: {
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    fontSize: typography.headline,
    fontFamily: typography.fontFamilyBold,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.small,
  },
  tagButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.round,
    marginRight: spacing.small,
    marginBottom: spacing.small,
    ...shadows.small,
  },
  tagText: {
    color: 'white',
    fontSize: typography.subhead,
    fontFamily: typography.fontFamilyBold,
  },
  tagInputContainer: {
    marginBottom: spacing.small,
  },
  tagInput: {
    height: 44,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    ...shadows.small,
  },
  suggestedTagsContainer: {
    marginBottom: spacing.medium,
  },
  suggestedTagsContent: {
    paddingVertical: spacing.small,
  },
  suggestionTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.large,
    marginRight: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    color: colors.text,
    fontSize: typography.subhead,
  },
  popularTagsContainer: {
    marginTop: spacing.medium,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    ...shadows.small,
  },
  tagSectionTitle: {
    fontSize: typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.small,
  },
  popularTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.large,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  selectedPopularTag: {
    backgroundColor: colors.primary,
  },
  popularTagText: {
    color: colors.textSecondary,
    fontSize: typography.caption1,
  },
  selectedPopularTagText: {
    color: 'white',
  },
  switchCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginBottom: spacing.large,
    ...shadows.small,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  switchDescription: {
    fontSize: typography.caption1,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.medium,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});