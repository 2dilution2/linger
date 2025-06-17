import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function AboutScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>앱 정보</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.appInfoContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>L</Text>
          </View>
        </View>
        <Text style={styles.appName}>Linger</Text>
        <Text style={styles.appVersion}>버전 1.0.0</Text>
        <Text style={styles.appDescription}>
          시를 통해 머무르는 감정의 공간
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 소개</Text>
        <Text style={styles.sectionText}>
          Linger는 일상 속에서 느끼는 감정을 시로 표현하고, 다른 사람들과 나눌 수 있는 플랫폼입니다. 
          바쁜 일상 속에서도 잠시 '머무르며(Linger)' 자신의 감정을 돌아보고, 
          아름다운 언어로 표현하는 경험을 제공합니다.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 기능</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="create-outline" size={22} color="#0080ff" />
            <Text style={styles.featureText}>감정을 담은 시 작성</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="share-social-outline" size={22} color="#0080ff" />
            <Text style={styles.featureText}>시 공유 및 커뮤니티</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="calendar-outline" size={22} color="#0080ff" />
            <Text style={styles.featureText}>감정 캘린더</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics-outline" size={22} color="#0080ff" />
            <Text style={styles.featureText}>감정 분석</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>고객 지원</Text>
        <TouchableOpacity 
          style={styles.supportItem}
          onPress={() => Linking.openURL('mailto:support@linger.app')}
        >
          <Ionicons name="mail-outline" size={22} color="#0080ff" />
          <Text style={styles.supportText}>support@linger.app</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.supportItem}
          onPress={() => Linking.openURL('https://linger.app/support')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#0080ff" />
          <Text style={styles.supportText}>자주 묻는 질문</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>법적 정보</Text>
        <TouchableOpacity 
          style={styles.legalItem}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.legalText}>개인정보 처리방침</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.legalItem}
          onPress={() => navigation.navigate('Terms')}
        >
          <Text style={styles.legalText}>이용약관</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.copyright}>© 2024 Linger. All rights reserved.</Text>
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
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#0080ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#555',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supportText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#0080ff',
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legalText: {
    fontSize: 15,
    color: '#555',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
  },
}); 