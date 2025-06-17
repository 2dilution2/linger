import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function TermsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이용약관</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>
          최종 업데이트: 2024년 5월 1일
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제1조 (목적)
          </Text>
          <Text style={styles.paragraph}>
            이 약관은 주식회사 링거("회사")가 제공하는 Linger 서비스 및 이와 관련된 모든 서비스(이하 "서비스")를 이용함에 있어 회사와 회원의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제2조 (정의)
          </Text>
          <View style={styles.numberList}>
            <View style={styles.numberItem}>
              <Text style={styles.number}>1.</Text>
              <Text style={styles.numberText}>
                "서비스"란 회사가 제공하는 Linger 애플리케이션을 통해 이용할 수 있는 시 작성 및 공유 서비스를 말합니다.
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>2.</Text>
              <Text style={styles.numberText}>
                "회원"이란 서비스에 가입하여 고유 계정을 부여받은 자로서, 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 자를 말합니다.
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>3.</Text>
              <Text style={styles.numberText}>
                "콘텐츠"란 회원이 서비스 내에서 작성한 시, 댓글 등의 모든 형태의 정보나 자료를 말합니다.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제3조 (약관의 게시와 개정)
          </Text>
          <View style={styles.numberList}>
            <View style={styles.numberItem}>
              <Text style={styles.number}>1.</Text>
              <Text style={styles.numberText}>
                회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 내 또는 연결화면에 게시합니다.
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>2.</Text>
              <Text style={styles.numberText}>
                회사는 관련법에 위배되지 않는 범위 내에서 이 약관을 개정할 수 있으며, 약관을 개정할 경우 적용 일자 및 개정사유를 명시하여 현행약관과 함께 서비스 내에 그 적용일자 7일 전부터 공지합니다.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제4조 (서비스의 제공 및 변경)
          </Text>
          <Text style={styles.paragraph}>
            회사는 다음과 같은 서비스를 제공합니다:
          </Text>
          <View style={styles.numberList}>
            <View style={styles.numberItem}>
              <Text style={styles.number}>1.</Text>
              <Text style={styles.numberText}>
                시 작성 및 저장 서비스
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>2.</Text>
              <Text style={styles.numberText}>
                시 공유 및 커뮤니티 서비스
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>3.</Text>
              <Text style={styles.numberText}>
                감정 분석 및 캘린더 서비스
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>4.</Text>
              <Text style={styles.numberText}>
                기타 회사가 정하는 서비스
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제5조 (회원의 의무)
          </Text>
          <View style={styles.numberList}>
            <View style={styles.numberItem}>
              <Text style={styles.number}>1.</Text>
              <Text style={styles.numberText}>
                회원은 서비스 이용 시 다음 행위를 하여서는 안 됩니다:
              </Text>
            </View>
            <View style={styles.subList}>
              <View style={styles.subItem}>
                <Text style={styles.subBullet}>a.</Text>
                <Text style={styles.subText}>
                  타인의 정보를 도용하거나 허위 정보를 등록하는 행위
                </Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subBullet}>b.</Text>
                <Text style={styles.subText}>
                  회사가 게시한 정보를 변경하는 행위
                </Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subBullet}>c.</Text>
                <Text style={styles.subText}>
                  서비스를 이용하여 법령, 공공질서, 미풍양속에 반하는 행위
                </Text>
              </View>
              <View style={styles.subItem}>
                <Text style={styles.subBullet}>d.</Text>
                <Text style={styles.subText}>
                  저작권, 상표권 등 타인의 권리를 침해하는 행위
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제6조 (저작권의 귀속 및 이용제한)
          </Text>
          <View style={styles.numberList}>
            <View style={styles.numberItem}>
              <Text style={styles.number}>1.</Text>
              <Text style={styles.numberText}>
                회원이 서비스 내에 게시한 콘텐츠의 저작권은 해당 회원에게 귀속됩니다.
              </Text>
            </View>
            <View style={styles.numberItem}>
              <Text style={styles.number}>2.</Text>
              <Text style={styles.numberText}>
                회원은 자신이 창작한 콘텐츠를 서비스에 게시함으로써, 회사에게 해당 콘텐츠를 서비스 내에서 이용하고 재생산할 수 있는 권리를 부여합니다.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제7조 (서비스 이용제한)
          </Text>
          <Text style={styles.paragraph}>
            회사는 회원이 이용약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 서비스 이용을 제한할 수 있습니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제8조 (면책조항)
          </Text>
          <Text style={styles.paragraph}>
            회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 발생한 분쟁에 대해 책임을 지지 않습니다.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제9조 (관할법원)
          </Text>
          <Text style={styles.paragraph}>
            서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 서울중앙지방법원을 전속 관할법원으로 합니다.
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
  numberList: {
    marginBottom: 12,
  },
  numberItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  number: {
    width: 16,
    fontSize: 14,
    color: '#555',
  },
  numberText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  subList: {
    marginLeft: 16,
    marginTop: 8,
  },
  subItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  subBullet: {
    width: 16,
    fontSize: 14,
    color: '#666',
  },
  subText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
}); 