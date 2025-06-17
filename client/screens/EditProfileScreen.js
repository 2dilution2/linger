import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUserProfile } from '../store/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../services';

export function EditProfileScreen({ navigation }) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  
  const [penname, setPenname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // 사용자 프로필 정보 로드
    if (user && user.profile) {
      setPenname(user.profile.penname || '');
      setBio(user.profile.bio || '');
      setProfileImage(user.profile.profileImage || null);
      setIsPublic(user.profile.isPublic !== false); // 기본값은 공개
    }
  }, [user]);
  
  // 이미지 선택 함수
  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  // 프로필 저장 함수
  const saveProfile = async () => {
    if (!penname.trim()) {
      Alert.alert('알림', '필명을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      const profileData = {
        penname: penname.trim(),
        bio: bio.trim(),
        isPublic,
        profileImage, // 실제로는 이미지 업로드 처리 필요
      };
      
      const updatedProfile = await userService.updateProfile(profileData);
      dispatch(updateUserProfile(updatedProfile));
      
      Alert.alert('성공', '프로필이 업데이트되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
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
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={selectImage}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {penname ? penname.charAt(0) : '?'}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>필명</Text>
          <TextInput
            style={styles.input}
            value={penname}
            onChangeText={setPenname}
            placeholder="필명을 입력하세요"
            maxLength={20}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>소개</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="자기 소개를 입력하세요"
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>프로필 공개 설정</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.option,
                isPublic && styles.optionSelected
              ]}
              onPress={() => setIsPublic(true)}
            >
              <Text style={[
                styles.optionText,
                isPublic && styles.optionTextSelected
              ]}>공개</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.option,
                !isPublic && styles.optionSelected
              ]}
              onPress={() => setIsPublic(false)}
            >
              <Text style={[
                styles.optionText,
                !isPublic && styles.optionTextSelected
              ]}>비공개</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0080ff" style={styles.loading} />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveButtonText}>저장하기</Text>
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
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0080ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 48,
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0080ff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  form: {
    paddingHorizontal: 16,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#0080ff',
  },
  optionText: {
    color: '#555',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    marginVertical: 24,
  },
}); 