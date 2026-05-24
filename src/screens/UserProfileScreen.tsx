import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {resetToLogin} from '../utils/authNavigation';
import {useAppDialog} from '../context/DialogContext';

const LANGUAGES = ['Kannada', 'English', 'Tulu'];
const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const UserProfileScreen = ({navigation, route}: any) => {
  const {showAlert, showConfirm} = useAppDialog();
  const [selectedDays, setSelectedDays] = useState<string[]>(['SUN']);
  const [menuVisible, setMenuVisible] = useState(false);
  const profileImage = 'https://i.pravatar.cc/300?img=5';

  useFocusEffect(
    useCallback(() => {
      const days = route.params?.selectedDays;
      if (Array.isArray(days) && days.length > 0) {
        setSelectedDays(days);
      }
    }, [route.params?.selectedDays]),
  );

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleShare = () => {
    showAlert({
      title: 'Share profile',
      message: 'Profile link will be available soon.',
    });
  };

  const handleLogout = () => {
    setMenuVisible(false);
    showConfirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      destructive: true,
      onConfirm: () => resetToLogin(navigation),
    });
  };

  return (
    <>
      <StatusBar backgroundColor="#F7F2EA" barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable
              style={[styles.headerIconBtn, styles.headerIconSpacing]}
              onPress={handleShare}>
              <Text style={styles.headerIcon}>↗</Text>
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => setMenuVisible(true)}>
              <Text style={styles.headerIcon}>⋮</Text>
            </Pressable>
          </View>
        </View>

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}>
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}>
            <Pressable onPress={e => e.stopPropagation()}>
              <View style={styles.menuDropdown}>
                <Pressable style={styles.menuItem} onPress={handleLogout}>
                  <Text style={styles.menuLogoutText}>Logout</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <View style={styles.profileCard}>
            <Text style={styles.savedList}>Profile in 4 saved list</Text>

            <Pressable style={styles.editFab}>
              <Text style={styles.editFabText}>✎</Text>
            </Pressable>

            <Image source={{uri: profileImage}} style={styles.avatar} />

            <Text style={styles.name}>Sparrow</Text>
            <Text style={styles.meta}>
              Tenure Id : FGR45IH · Male · Year : 1999
            </Text>

            <View style={styles.ratePill}>
              <Text style={styles.rateText}>₹ 50/H</Text>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </View>

            <Text style={styles.role}>Shopping Partner</Text>

            <View style={styles.locationRow}>
              <Text style={styles.mapPin}>📍</Text>
              <Text style={styles.locationText}>
                India, karnataka, udupi, 576111
              </Text>
            </View>

            <View style={styles.languageRow}>
              {LANGUAGES.map(lang => (
                <View key={lang} style={styles.languageChip}>
                  <Text style={styles.languageText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            style={styles.updateMoreButton}
            onPress={() =>
              navigation.navigate('ProfileUpdateMore', {selectedDays})
            }>
            <Text style={styles.updateMoreText}>Update more</Text>
          </Pressable>

          <Pressable
            style={styles.galleryBar}
            onPress={() =>
              navigation.navigate('Gallery', {title: 'My Gallery'})
            }>
            <Text style={styles.galleryText}>Gallery</Text>
            <Text style={styles.galleryIcon}>🖼</Text>
          </Pressable>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>🕐</Text>
              <Text style={styles.sectionTitle}>Available Time</Text>
            </View>

            <Text style={styles.timeRange}>05:30 PM TO 05:30 PM</Text>

            <View style={styles.daysRow}>
              {WEEK_DAYS.map(day => {
                const active = selectedDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={[styles.dayChip, active && styles.dayChipActive]}>
                    <Text
                      style={[
                        styles.dayText,
                        active && styles.dayTextActive,
                      ]}>
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.socialGrid}>
            <Pressable style={[styles.socialPill, styles.youtubePill]}>
              <Text style={styles.socialEmoji}>▶</Text>
              <Text style={styles.socialLabel}>You tube</Text>
            </Pressable>

            <Pressable style={[styles.socialPill, styles.instagramPill]}>
              <Text style={styles.socialEmoji}>📷</Text>
              <Text style={styles.socialLabel}>Instagram</Text>
            </Pressable>

            <Pressable style={[styles.socialPill, styles.websitePill]}>
              <Text style={styles.socialEmoji}>🌐</Text>
              <Text style={styles.socialLabel}>Own website</Text>
            </Pressable>
          </View>

          <View style={styles.reviewsRow}>
            <Pressable style={styles.commentsButton}>
              <Text style={styles.commentsText}>Comments</Text>
            </Pressable>
            <Text style={styles.reviewsText}>69% Based on 2 Reviews</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EA',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 28,
    color: '#111111',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  headerIconSpacing: {
    marginRight: 10,
  },
  headerIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#E4E8EC',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 18,
  },
  savedList: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#4A7C9E',
    fontWeight: '600',
    marginBottom: 12,
  },
  editFab: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D5D5D5',
  },
  editFabText: {
    fontSize: 16,
    color: '#555555',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 14,
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 10,
  },
  rateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginRight: 8,
  },
  infoIcon: {
    fontSize: 14,
    color: '#888888',
  },
  role: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 14,
  },
  mapPin: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  languageChip: {
    backgroundColor: '#D8DEE4',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  languageText: {
    fontSize: 13,
    color: '#444444',
    fontWeight: '500',
  },
  updateMoreButton: {
    backgroundColor: '#C8D4FF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A8B8F0',
  },
  updateMoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A3A8F',
  },
  galleryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E4E8EC',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 22,
  },
  galleryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  galleryIcon: {
    fontSize: 18,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },
  timeRange: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayChipActive: {
    backgroundColor: '#003B57',
    borderColor: '#003B57',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  youtubePill: {
    backgroundColor: '#FFE8E8',
  },
  instagramPill: {
    backgroundColor: '#F3E4FF',
  },
  websitePill: {
    width: '100%',
    backgroundColor: '#E3F0FF',
  },
  socialEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  reviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentsButton: {
    backgroundColor: '#D8DEE4',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  commentsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  reviewsText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    minWidth: 160,
    paddingVertical: 6,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuLogoutText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
});
