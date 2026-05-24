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
import {UI, uiStyles} from '../theme/ui';
import BackButton from '../components/navigation/BackButton';
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
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => goBackSafe(navigation)} />

          <View style={styles.headerRight}>
            <Pressable
              style={({pressed}) => [
                styles.headerIconBtn,
                styles.headerIconSpacing,
                pressed && styles.headerBtnPressed,
              ]}
              onPress={handleShare}>
              <Text style={styles.headerIcon}>↗</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.headerIconBtn,
                pressed && styles.headerBtnPressed,
              ]}
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
            <View style={styles.savedListPill}>
              <Text style={styles.savedList}>Profile in 4 saved list</Text>
            </View>

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

            <View style={styles.avatarRing}>
              <Image
                source={{uri: profileCard.profileImage}}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.name}>{profileCard.name}</Text>
            <Text style={styles.meta}>
              Tenure Id : FGR45IH · Male · Year : 1999
            </Text>

            <View style={styles.ratePill}>
              <Text style={styles.rateText}>₹ {profileCard.ratePerHour}/H</Text>
              <View style={styles.rateInfoBadge}>
                <Text style={styles.infoIcon}>i</Text>
              </View>
            </View>

            <Text style={styles.role}>Shopping Partner</Text>

            <View style={styles.locationRow}>
              <View style={styles.mapPinWrap}>
                <Text style={styles.mapPin}>📍</Text>
              </View>
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
            <Text style={styles.updateMoreArrow}>→</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.galleryBar,
              pressed && styles.galleryBarPressed,
            ]}
            onPress={() =>
              navigation.navigate('Gallery', {title: 'My Gallery'})
            }>
            <View style={styles.galleryLeft}>
              <Text style={styles.galleryIcon}>🖼</Text>
              <Text style={styles.galleryText}>Gallery</Text>
            </View>
            <Text style={styles.galleryChevron}>›</Text>
          </Pressable>

          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconWrap}>
                <Text style={styles.sectionIcon}>🕐</Text>
              </View>
              <Text style={styles.sectionTitle}>Available Time</Text>
            </View>

            <View style={styles.timeRangePill}>
              <Text style={styles.timeRange}>05:30 PM TO 05:30 PM</Text>
            </View>

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

          <View style={styles.socialSection}>
            <Text style={styles.socialSectionTitle}>Social links</Text>
            <View style={styles.socialGrid}>
              <Pressable
                style={({pressed}) => [
                  styles.socialPill,
                  styles.youtubePill,
                  pressed && styles.socialPillPressed,
                ]}>
                <Text style={styles.socialEmoji}>▶</Text>
                <Text style={styles.socialLabel}>You tube</Text>
              </Pressable>

              <Pressable
                style={({pressed}) => [
                  styles.socialPill,
                  styles.instagramPill,
                  pressed && styles.socialPillPressed,
                ]}>
                <Text style={styles.socialEmoji}>📷</Text>
                <Text style={styles.socialLabel}>Instagram</Text>
              </Pressable>

              <Pressable
                style={({pressed}) => [
                  styles.socialPill,
                  styles.websitePill,
                  pressed && styles.socialPillPressed,
                ]}>
                <Text style={styles.socialEmoji}>🌐</Text>
                <Text style={styles.socialLabel}>Own website</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.reviewsCard}>
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

const cardShadow = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 3},
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bgCream,
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.borderInput,
    ...cardShadow,
  },
  headerIconSpacing: {
    marginRight: 10,
  },
  headerBtnPressed: {
    opacity: 0.88,
  },
  headerIcon: {
    fontSize: 17,
    color: UI.brand,
    fontWeight: '800',
  },
  scroll: {
    paddingBottom: 48,
  },
  profileCard: {
    backgroundColor: UI.card,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: UI.border,
    ...cardShadow,
  },
  savedListPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F7FA',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#C5DCE6',
    marginBottom: 16,
  },
  savedList: {
    fontSize: 12,
    color: UI.brand,
    fontWeight: '700',
  },
  editFab: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: UI.brandMuted,
    ...cardShadow,
  },
  editFabText: {
    fontSize: 16,
    color: UI.brand,
    fontWeight: '600',
  },
  editFabPressed: {
    opacity: 0.85,
    transform: [{scale: 0.96}],
  },
  avatarRing: {
    padding: 3,
    borderRadius: 60,
    borderWidth: 2.5,
    borderColor: UI.brand,
    marginBottom: 14,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: UI.cardMuted,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: UI.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  meta: {
    fontSize: 13,
    color: UI.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FA',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C5DCE6',
  },
  rateText: {
    fontSize: 18,
    fontWeight: '800',
    color: UI.brand,
    marginRight: 10,
  },
  rateInfoBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.borderPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: UI.textMuted,
    fontStyle: 'italic',
  },
  role: {
    fontSize: 16,
    fontWeight: '700',
    color: UI.textSecondary,
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.bgCream,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: UI.borderInput,
  },
  mapPinWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mapPin: {
    fontSize: 15,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: UI.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  languageChip: {
    backgroundColor: UI.bgCream,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: UI.borderInput,
  },
  languageText: {
    fontSize: 13,
    color: UI.textSecondary,
    fontWeight: '600',
  },
  updateMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EDF8',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#B8C9E8',
  },
  updateMorePressed: {
    opacity: 0.9,
  },
  updateMoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: UI.brandMuted,
  },
  updateMoreArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: UI.brandMuted,
    marginLeft: 8,
  },
  galleryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: UI.border,
    ...cardShadow,
  },
  galleryBarPressed: {
    opacity: 0.94,
  },
  galleryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryText: {
    fontSize: 16,
    fontWeight: '700',
    color: UI.text,
    marginLeft: 10,
  },
  galleryIcon: {
    fontSize: 18,
  },
  galleryChevron: {
    fontSize: 24,
    color: UI.textHint,
    fontWeight: '300',
  },
  sectionCard: {
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: UI.border,
    ...cardShadow,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionIcon: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: UI.text,
  },
  timeRangePill: {
    alignSelf: 'flex-start',
    backgroundColor: UI.brand,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UI.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.borderPill,
  },
  dayChipActive: {
    backgroundColor: UI.brand,
    borderColor: UI.brand,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '800',
    color: UI.textMuted,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  socialSection: {
    marginBottom: 16,
  },
  socialSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.textMuted,
    marginBottom: 12,
    marginLeft: 4,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...cardShadow,
  },
  socialPillPressed: {
    opacity: 0.9,
  },
  youtubePill: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F5D0D0',
  },
  instagramPill: {
    backgroundColor: '#F8F0FF',
    borderColor: '#E8D4F5',
  },
  websitePill: {
    width: '100%',
    backgroundColor: '#EEF6FF',
    borderColor: '#C5DCE6',
  },
  socialEmoji: {
    fontSize: 17,
    marginRight: 10,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.text,
  },
  reviewsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: UI.border,
    ...cardShadow,
  },
  commentsButton: {
    backgroundColor: UI.chip,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: UI.borderInput,
  },
  commentsButtonPressed: {
    opacity: 0.88,
  },
  commentsText: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.text,
  },
  reviewsBadge: {
    alignItems: 'flex-end',
  },
  reviewsPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: UI.brand,
  },
  reviewsText: {
    fontSize: 12,
    color: UI.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: UI.overlay,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuDropdown: {
    backgroundColor: UI.card,
    borderRadius: 16,
    minWidth: 168,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: UI.border,
    ...cardShadow,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemPressed: {
    backgroundColor: UI.bgCream,
  },
  menuLogoutText: {
    fontSize: 16,
    color: UI.danger,
    fontWeight: '700',
  },
});
