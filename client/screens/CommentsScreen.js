import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { interactionService } from '../services';

export function CommentsScreen({ route, navigation }) {
  const { poemId } = route.params;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const user = useSelector(selectUser);
  const flatListRef = useRef(null);
  
  // 네비게이션 옵션 설정 (헤더 설정)
  useEffect(() => {
    navigation.setOptions({
      title: '댓글',
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity 
          style={{ marginLeft: 16, padding: 8 }} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
    
    // 뒤로가기 이벤트 처리 (안드로이드 하드웨어 버튼)
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      console.log('댓글 화면 이탈');
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // 초기 로드
  useEffect(() => {
    fetchComments();
  }, [poemId]);
  
  // 새로고침용 함수
  const handleRefresh = () => {
    console.log('댓글 새로고침 시작');
    setRefreshing(true);
    
    // 직접 loadComments 호출
    loadComments();
  };
  
  // 댓글 목록 가져오기 (내부 함수)
  const loadComments = async () => {
    try {
      const commentData = await interactionService.getComments(poemId);
      console.log('서버에서 받은 댓글 데이터:', commentData.map(c => ({ 
        id: c._id, 
        commentId: c.commentId,
        penname: c.penname 
      })));
      setComments(commentData);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      Alert.alert('오류', '댓글을 불러오는데 실패했습니다.');
    } finally {
      console.log('댓글 새로고침 완료');
      setRefreshing(false);
    }
  };
  
  // 댓글 목록 초기 로드 (로딩 인디케이터 포함)
  const fetchComments = async () => {
    setLoading(true);
    await loadComments();
    setLoading(false);
  };
  
  // 댓글 작성
  const postComment = async () => {
    if (!newComment.trim()) return;
    
    setSendingComment(true);
    try {
      const result = await interactionService.addComment(poemId, newComment.trim());
      
      // 서버에서 반환된 결과에 penname 추가하고 commentId 추가 (문자열 보장)
      const commentWithPenname = {
        ...result,
        penname: user?.penname || '익명',
        commentId: typeof result._id === 'object' ? result._id.toString() : String(result._id || '')
      };
      
      console.log('새로 추가된 댓글:', {
        id: commentWithPenname._id,
        commentId: commentWithPenname.commentId,
        commentIdType: typeof commentWithPenname.commentId,
        penname: commentWithPenname.penname
      });
      
      setComments([...comments, commentWithPenname]);
      setNewComment('');
      
      // 자동 스크롤 처리
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSendingComment(false);
    }
  };
  
  // 댓글 수정 모드 시작
  const startEditComment = (comment) => {
    console.log('수정 시작 - 댓글:', comment.commentId, '타입:', typeof comment.commentId);
    setEditingId(comment.commentId);
    setEditText(comment.content);
  };
  
  // 댓글 수정 취소
  const cancelEditComment = () => {
    console.log('수정 취소');
    setEditingId(null);
    setEditText('');
  };
  
  // 댓글 수정 완료
  const updateComment = async (commentId) => {
    if (!editText.trim()) return;
    
    setSendingComment(true);
    try {
      console.log('댓글 수정 요청:', commentId, '타입:', typeof commentId);
      const result = await interactionService.updateComment(commentId, editText.trim());
      
      // commentId를 문자열로 보장하고 result 객체에 추가
      const updatedCommentId = typeof commentId === 'string' ? commentId : String(commentId || '');
      const updatedComment = {
        ...result,
        commentId: updatedCommentId
      };
      
      console.log('댓글 수정 결과:', {
        원본ID: result._id,
        추가된commentId: updatedCommentId,
        타입: typeof updatedCommentId
      });
      
      // 업데이트된 댓글로 state 변경, commentId로 정확히 찾기
      setComments(comments.map(comment => {
        const currentCommentId = String(comment.commentId || '');
        return currentCommentId === updatedCommentId ? updatedComment : comment;
      }));
      
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      Alert.alert('오류', '댓글 수정에 실패했습니다.');
    } finally {
      setSendingComment(false);
    }
  };
  
  // 댓글 삭제
  const deleteComment = async (commentId) => {
    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('댓글 삭제 요청:', commentId, '타입:', typeof commentId);
              const stringCommentId = typeof commentId === 'string' ? commentId : String(commentId || '');
              
              await interactionService.deleteComment(stringCommentId);
              
              // commentId를 문자열로 변환하여 비교
              setComments(prevComments => 
                prevComments.filter(comment => String(comment.commentId || '') !== stringCommentId)
              );
              
              console.log('댓글 삭제 완료');
            } catch (error) {
              console.error('댓글 삭제 실패:', error);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // 댓글 신고
  const reportComment = (commentId) => {
    Alert.alert(
      '댓글 신고',
      '이 댓글을 신고하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '신고', 
          style: 'destructive',
          onPress: () => {
            // 여기에 신고 처리 코드 추가
            Alert.alert('알림', '댓글이 신고되었습니다.');
          }
        }
      ]
    );
  };
  
  // 댓글 항목 렌더링
  const renderCommentItem = ({ item }) => {
    // authorId가 문자열이 아닌 객체인 경우 처리
    const authorId = typeof item.authorId === 'object' ? item.authorId?._id : item.authorId;
    const isMyComment = user && (user.id === authorId || user.userId === authorId);
    
    // 확실하게 문자열로 변환하여 비교
    const currentCommentId = String(item.commentId || '');
    const currentEditingId = String(editingId || '');
    const isEditing = currentCommentId && currentEditingId && (currentCommentId === currentEditingId);
    
    console.log(`댓글 ${item.commentId} 렌더링:`, { 
      isEditing,
      editingId: currentEditingId,
      itemCommentId: currentCommentId,
      areEqual: currentCommentId === currentEditingId,
      editingIdType: typeof editingId,
      itemCommentIdType: typeof item.commentId
    });
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.penname || '익명'}</Text>
            <Text style={styles.commentDate}>
              {new Date(item.createdAt).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          
          {isMyComment && !isEditing && (
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => startEditComment(item)}
              >
                <Ionicons name="create-outline" size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteComment(item.commentId)}
              >
                <Ionicons name="trash-outline" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          
          {!isMyComment && !isEditing && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => reportComment(item.commentId)}
            >
              <Ionicons name="flag-outline" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        {isEditing ? (
          <View style={styles.editCommentContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              maxLength={300}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEditComment}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => updateComment(item.commentId)}
                disabled={!editText.trim() || sendingComment}
              >
                {sendingComment && editingId === item.commentId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentContent}>{item.content}</Text>
        )}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080ff" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.commentId || `comment-${Date.now()}`}
          contentContainerStyle={styles.commentsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0080ff']}
              tintColor="#0080ff"
              progressViewOffset={10}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCommentsContainer}>
              <Text style={styles.emptyCommentsText}>
                아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
              </Text>
            </View>
          }
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={300}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newComment.trim() || sendingComment) && styles.sendButtonDisabled
          ]}
          onPress={postComment}
          disabled={!newComment.trim() || sendingComment}
        >
          {sendingComment && !editingId ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsList: {
    padding: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  commentItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  commentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  editCommentContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#0080ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyCommentsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyCommentsText: {
    color: '#888',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#0080ff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
}); 