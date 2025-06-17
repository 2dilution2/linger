import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function PrivacyScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 처리방침</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>
          최종 업데이트: 2024년 5월 1일
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. 개인정보 수집 항목 및 이용 목적
          </Text>
          <Text style={styles.paragraph}>
            Linger("회사")는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>필수 항목:</Text> 이메일 주소, 비밀번호
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>선택 항목:</Text> 프로필 사진, 필명, 자기소개
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>자동 수집 항목:</Text> 기기 정보, IP 주소, 앱 사용 기록
              </Text>
            </View>
          </View>
          <Text style={styles.paragraph}>
            수집한 개인정보는 서비스 제공, 회원 관리, 컨텐츠 제공, 서비스 개선 및 마케팅 활동 등의 목적으로 이용됩니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. 개인정보의 보유 및 이용기간
          </Text>
          <Text style={styles.paragraph}>
            회사는 회원 탈퇴 시 또는 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의해 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 개인정보를 보관합니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. 개인정보의 제3자 제공
          </Text>
          <Text style={styles.paragraph}>
            회사는 이용자의 개인정보를 '개인정보 수집 항목 및 이용 목적'에서 고지한 범위 내에서 사용하며, 이용자의 사전 동의 없이 동 범위를 초과하여 이용하거나 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                이용자가 사전에 동의한 경우
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 요청한 경우
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. 이용자 권리와 행사 방법
          </Text>
          <Text style={styles.paragraph}>
            이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다. 개인정보 조회 및 수정은 '설정 - 프로필 수정'에서 가능하며, 회원 탈퇴(개인정보 삭제)는 '설정 - 계정 삭제'를 통해 가능합니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. 개인정보 보호를 위한 기술적/관리적 조치
          </Text>
          <Text style={styles.paragraph}>
            회사는 이용자의 개인정보를 안전하게 처리하기 위해 다음과 같은 조치를 취하고 있습니다:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                개인정보 암호화 전송 및 저장
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                해킹 등 외부 침입에 대비한 방화벽 등 시스템 구축
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                개인정보 취급자 최소화 및 교육 실시
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. 개인정보 처리방침 변경
          </Text>
          <Text style={styles.paragraph}>
            본 개인정보 처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다. 회사가 개인정보 처리방침을 변경하는 경우 변경 사항은 앱 내 공지사항 또는 이메일을 통해 공지됩니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            7. 개인정보 관련 문의
          </Text>
          <Text style={styles.paragraph}>
            개인정보 보호책임자: 김길동{'\n'}
            이메일: privacy@linger.app{'\n'}
            전화: 02-123-4567
          </Text>
        </View>
      </View>
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
  content: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginBottom: 12,
  },
  bulletList: {
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    color: '#555',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
}); 