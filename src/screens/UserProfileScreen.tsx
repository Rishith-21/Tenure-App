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
import {shareTenureProfile} from '../utils/share';
import ProfileCardEditSheet, {
  ProfileCardEditValues,
} from '../components/profile/ProfileCardEditSheet';
import {UI} from '../theme/ui';
import {goBackSafe} from '../navigation/navigationActions';

const MY_TENURE_ID = '763GCG76';

const LANGUAGES = ['Kannada', 'English', 'Tulu'];
const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const UserProfileScreen = ({navigation, route}: any) => {
  const {showConfirm} = useAppDialog();
  const [selectedDays, setSelectedDays] = useState<string[]>(['SUN']);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editCardVisible, setEditCardVisible] = useState(false);
  const [profileCard, setProfileCard] = useState<ProfileCardEditValues>({
    name: 'Sparrow',
    profileImage: 'https://i.pravatar.cc/300?img=5',
    ratePerHour: '50',
    location: 'India, karnataka, udupi, 576111',
  });

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
    shareTenureProfile({name: profileCard.name, tenureId: MY_TENURE_ID});
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
      <StatusBar backgroundColor={UI.bg} barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => goBackSafe(navigation)}
            hitSlop={12}
            style={({pressed}) => pressed && styles.headerBtnPressed}>
            <Text style={styles.headerBack}>←</Text>
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable
              onPress={handleShare}
              style={({pressed}) => [
                styles.shareBtn,
                pressed && styles.shareBtnPressed,
              ]}>
              <Text style={styles.shareBtnIcon}>↗</Text>
              <Text style={styles.shareBtnLabel}>Share</Text>
            </Pressable>
            <Pressable
              onPress={() => setMenuVisible(true)}
              hitSlop={12}
              style={({pressed}) => [
                styles.headerAction,
                pressed && styles.headerBtnPressed,
              ]}>
              <Text style={styles.headerActionIcon}>⋮</Text>
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
                <Pressable
                  style={({pressed}) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={handleLogout}>
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

            <Pressable
              style={({pressed}) => [
                styles.editFab,
                pressed && styles.editFabPressed,
              ]}
              onPress={() => setEditCardVisible(true)}
              accessibilityLabel="Edit profile card"
              accessibilityRole="button">
              <Text style={styles.editFabText}>✎</Text>
            </Pressable>

            <Image
              source={{uri: profileCard.profileImage}}
              style={styles.avatar}
            />

            <Text style={styles.name}>{profileCard.name}</Text>
            <Text style={styles.metaLine}>Tenure Id : FGR45IH</Text>
            <Text style={styles.metaLine}>Male Year : 1999</Text>

            <View style={styles.infoPill}>
              <Text style={styles.rateText}>₹ {profileCard.ratePerHour}/H</Text>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.roleText}>Shopping Partner</Text>
            </View>

            <View style={[styles.infoPill, styles.locationPill]}>
              <Text style={styles.mapPin}>📍</Text>
              <Text style={styles.locationText}>{profileCard.location}</Text>
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
            style={({pressed}) => [
              styles.updateMoreButton,
              pressed && styles.updateMorePressed,
            ]}
            onPress={() =>
              navigation.navigate('ProfileUpdateMore', {selectedDays})
            }>
            <Text style={styles.updateMoreText}>Update more</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.galleryBar,
              pressed && styles.galleryBarPressed,
            ]}
            onPress={() =>
              navigation.navigate('Gallery', {title: 'My Gallery'})
            }>
            <Text style={styles.galleryIcon}>🖼</Text>
            <Text style={styles.galleryText}>Gallery</Text>
          </Pressable>

          <View style={styles.availabilityBlock}>
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
            <Pressable
              style={({pressed}) => [
                styles.socialPill,
                pressed && styles.socialPillPressed,
              ]}>
              <Text style={styles.socialEmoji}>▶</Text>
              <Text style={styles.socialLabel}>YouTube</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.socialPill,
                pressed && styles.socialPillPressed,
              ]}>
              <Text style={styles.socialEmoji}>📷</Text>
              <Text style={styles.socialLabel}>Instagram</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.socialPill,
                styles.socialPillWide,
                pressed && styles.socialPillPressed,
              ]}>
              <Text style={styles.socialEmoji}>🌐</Text>
              <Text style={styles.socialLabel}>Own website</Text>
            </Pressable>
          </View>

          <View style={styles.reviewsRow}>
            <Pressable
              style={({pressed}) => [
                styles.commentsButton,
                pressed && styles.commentsButtonPressed,
              ]}>
              <Text style={styles.commentsText}>Comments</Text>
            </Pressable>
            <View style={styles.reviewsBadge}>
              <Text style={styles.reviewsPercent}>69%</Text>
              <Text style={styles.reviewsText}>Based on 2 Reviews</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <ProfileCardEditSheet
        visible={editCardVisible}
        initial={profileCard}
        onClose={() => setEditCardVisible(false)}
        onSave={setProfileCard}
      />
    </>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingTop: 48,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerBack: {
    fontSize: 26,
    color: UI.text,
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  shareBtnPressed: {
    backgroundColor: UI.primaryPressed,
  },
  shareBtnIcon: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  shareBtnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionIcon: {
    fontSize: 20,
    color: UI.text,
    fontWeight: '600',
  },
  headerBtnPressed: {
    opacity: 0.5,
  },
  scroll: {
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: UI.cardMuted,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  savedList: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: UI.brandMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  editFab: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.border,
  },
  editFabText: {
    fontSize: 14,
    color: UI.textSecondary,
  },
  editFabPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: UI.card,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 13,
    color: UI.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 10,
    minWidth: 140,
    gap: 6,
  },
  rateText: {
    fontSize: 16,
    fontWeight: '700',
    color: UI.text,
  },
  infoIcon: {
    fontSize: 14,
    color: UI.textHint,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
    color: UI.text,
  },
  locationPill: {
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  mapPin: {
    fontSize: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: UI.textSecondary,
    lineHeight: 18,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  languageChip: {
    backgroundColor: UI.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  languageText: {
    fontSize: 13,
    color: UI.text,
    fontWeight: '500',
  },
  updateMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4DCE8',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  updateMorePressed: {
    opacity: 0.9,
  },
  updateMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.text,
  },
  galleryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI.cardMuted,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 8,
  },
  galleryBarPressed: {
    opacity: 0.92,
  },
  galleryText: {
    fontSize: 15,
    fontWeight: '600',
    color: UI.text,
  },
  galleryIcon: {
    fontSize: 16,
  },
  availabilityBlock: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.text,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: '600',
    color: UI.text,
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.border,
  },
  dayChipActive: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  dayText: {
    fontSize: 9,
    fontWeight: '700',
    color: UI.textMuted,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  socialPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: UI.border,
  },
  socialPillWide: {
    width: '100%',
  },
  socialPillPressed: {
    opacity: 0.9,
  },
  socialEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: UI.text,
  },
  reviewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  commentsButton: {
    backgroundColor: UI.cardMuted,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  commentsButtonPressed: {
    opacity: 0.88,
  },
  commentsText: {
    fontSize: 14,
    fontWeight: '600',
    color: UI.text,
  },
  reviewsBadge: {
    alignItems: 'flex-end',
  },
  reviewsPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: UI.text,
  },
  reviewsText: {
    fontSize: 12,
    color: UI.textMuted,
    marginTop: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: UI.sheetScrim,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 18,
  },
  menuDropdown: {
    backgroundColor: UI.card,
    borderRadius: 12,
    minWidth: 160,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: UI.border,
  },
  menuItem: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: 'transparent',
  },
  menuLogoutText: {
    fontSize: 15,
    color: UI.danger,
    fontWeight: '600',
  },
});
