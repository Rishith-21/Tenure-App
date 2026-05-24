import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getMateProfile, getRoleLabel} from '../data/mateProfiles';
import {useAppDialog} from '../context/DialogContext';
import MateRequestModal, {
  MateRequestForm,
} from '../components/mate/MateRequestModal';
import {MATE_CATEGORIES} from '../constants/mateCategories';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {shareTenureProfile} from '../utils/share';
import BackButton from '../components/navigation/BackButton';
import {goBackSafe} from '../navigation/navigationActions';
const MateProfileScreen = ({navigation, route}: any) => {
  const {showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const userId = route.params?.userId as string;
  const profile = getMateProfile(userId);

  const [isFavorite, setIsFavorite] = useState(
    route.params?.isFavorite ?? false,
  );
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const addSentRequest = useMateRequestsStore(s => s.addSentRequest);

  if (!profile) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Profile not found</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.missingLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const genderLabel =
    profile.gender === 'male' ? 'Male' : 'Female';
  const roleLabel = getRoleLabel(profile.categories);
  const primaryCategory = profile.categories[0] ?? 'Mate';

  const openMessage = () => {
    navigation.navigate('Conversation', {
      chatFlow: 'outgoing_request',
      mateName: profile.name,
      mateTenureId: profile.tenureId,
      mateAvatar: profile.avatar,
      sessionLabel: `${profile.district} · ${primaryCategory}`,
      meetDetails: `meet on 26-12-2026 Pay ${profile.ratePerHour} Per Hour`,
      requestSentAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  };

  const handleSendMateRequest = (form: MateRequestForm) => {
    const categoryLabel =
      MATE_CATEGORIES.find(c => c.id === form.category)?.label ?? form.category;

    addSentRequest({
      mateUserId: userId,
      mateName: profile.name,
      mateTenureId: profile.tenureId,
      mateAvatar: profile.avatar,
      categoryId: form.category,
      categoryLabel,
      meetLocation: form.meetLocation,
      fromDateTime: form.fromDateTime,
      toDateTime: form.toDateTime,
      message: form.message,
    });

    setRequestModalVisible(false);
    showAlert({
      title: 'Request sent',
      message: `Your mate request was sent to ${profile.name}. They will see it in their Requests section.`,
    });
  };

  return (
    <>
      <StatusBar backgroundColor="#F9F9F7" barStyle="dark-content" />

      <View style={[styles.container, {paddingTop: insets.top + 8}]}>
        <View style={styles.header}>
          <BackButton onPress={() => goBackSafe(navigation)} />

          <View style={styles.headerRight}>
            <Pressable
              style={styles.headerBtn}
              onPress={() => setIsFavorite(v => !v)}>
              <Text style={styles.headerBtnIcon}>
                {isFavorite ? '♥' : '♡'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.headerBtn}
              onPress={() =>
                shareTenureProfile({
                  name: profile.name,
                  tenureId: profile.tenureId,
                })
              }>
              <Text style={styles.headerBtnIcon}>↗</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {paddingBottom: insets.bottom + 100},
          ]}>
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Image source={{uri: profile.avatar}} style={styles.avatar} />

              <View style={styles.heroInfo}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.meta}>
                  Tenure Id : {profile.tenureId}
                </Text>
                <Text style={styles.meta}>
                  {genderLabel} · Year : {profile.birthYear}
                </Text>

                <View style={styles.rolePill}>
                  <Text style={styles.roleText}>{roleLabel}</Text>
                </View>
              </View>

              <View style={styles.rateBadge}>
                <Text style={styles.rateText}>₹ {profile.ratePerHour}/H</Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Text style={styles.mapPin}>📍</Text>
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>

            <View style={styles.languageRow}>
              {profile.languages.map(lang => (
                <View key={lang} style={styles.langChip}>
                  <Text style={styles.langText}>{lang}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.messageBtn} onPress={openMessage}>
              <Text style={styles.messageText}>Message</Text>
              <View style={styles.messageIconBubble}>
                <Text style={styles.messageIcon}>💬</Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            style={styles.sectionCard}
            onPress={() =>
              navigation.navigate('Gallery', {
                title: `${profile.name} — Gallery`,
              })
            }>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <Text style={styles.sectionChevron}>›</Text>
          </Pressable>

          <Pressable style={styles.sectionCard}>
            <View>
              <Text style={styles.sectionTitle}>Available time</Text>
              <Text style={styles.sectionSub}>
                {profile.availableTime} · {profile.availableDays.join(', ')}
              </Text>
            </View>
            <Text style={styles.calendarIcon}>📅</Text>
          </Pressable>

          <View style={styles.sectionCard}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>

          <View style={styles.socialGrid}>
            {profile.social.youtube ? (
              <Pressable style={[styles.socialPill, styles.youtube]}>
                <Text style={styles.socialEmoji}>▶</Text>
                <Text style={styles.socialLabel}>You tube</Text>
              </Pressable>
            ) : null}
            {profile.social.instagram ? (
              <Pressable style={[styles.socialPill, styles.instagram]}>
                <Text style={styles.socialEmoji}>📷</Text>
                <Text style={styles.socialLabel}>Instagram</Text>
              </Pressable>
            ) : null}
            {profile.social.website ? (
              <Pressable style={[styles.socialPill, styles.website]}>
                <Text style={styles.socialEmoji}>🌐</Text>
                <Text style={styles.socialLabel}>Own website</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.reviewsRow}>
            <Pressable style={styles.commentsBtn}>
              <Text style={styles.commentsText}>Comments</Text>
            </Pressable>

            <View style={styles.ratingBlock}>
              <Text style={styles.stars}>★★★★☆</Text>
              <Text style={styles.reviewsText}>
                {profile.reviewPercent}% · Based on {profile.reviewCount}{' '}
                Reviews
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {paddingBottom: insets.bottom + 12},
          ]}>
          <Pressable
            style={styles.mateRequestBtn}
            onPress={() => setRequestModalVisible(true)}>
            <Text style={styles.mateRequestText}>Mate Request</Text>
          </Pressable>
        </View>
      </View>

      <MateRequestModal
        visible={requestModalVisible}
        defaultCategoryId={profile.categories[0]}
        profileLocation={profile.location}
        onClose={() => setRequestModalVisible(false)}
        onSend={handleSendMateRequest}
      />
    </>
  );
};

export default MateProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F7',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F7',
  },
  missingText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  missingLink: {
    fontSize: 16,
    color: '#003B57',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  backArrow: {
    fontSize: 28,
    color: '#111111',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E8E0D6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerBtnIcon: {
    fontSize: 20,
    color: '#111111',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  heroCard: {
    backgroundColor: '#E5E7E9',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  heroInfo: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },
  meta: {
    fontSize: 12,
    color: '#555555',
    marginTop: 3,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  rateBadge: {
    backgroundColor: '#003B57',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
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
    marginTop: 12,
  },
  langChip: {
    backgroundColor: '#D8DEE4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 6,
  },
  langText: {
    fontSize: 12,
    color: '#444444',
    fontWeight: '500',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D5D5D5',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginRight: 10,
  },
  messageIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIcon: {
    fontSize: 16,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    textTransform: 'capitalize',
  },
  sectionSub: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },
  sectionChevron: {
    fontSize: 22,
    color: '#999999',
  },
  calendarIcon: {
    fontSize: 20,
  },
  bioText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    flex: 1,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  socialPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  youtube: {},
  instagram: {},
  website: {
    width: '100%',
  },
  socialEmoji: {
    fontSize: 16,
    marginRight: 8,
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
    marginBottom: 8,
  },
  commentsBtn: {
    backgroundColor: '#D8DEE4',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  commentsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  ratingBlock: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: 12,
  },
  stars: {
    fontSize: 14,
    color: '#F5A623',
    letterSpacing: 2,
    marginBottom: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(249, 249, 247, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  mateRequestBtn: {
    backgroundColor: '#003B57',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  mateRequestText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
