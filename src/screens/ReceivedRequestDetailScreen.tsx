import React from 'react';
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
import {
  getMateProfileFromRequest,
  getRoleLabel,
} from '../data/mateProfiles';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {useAppDialog} from '../context/DialogContext';
import {
  calcMeetDurationMinutes,
  formatDurationHuman,
} from '../utils/meetTime';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const ReceivedRequestDetailScreen = ({navigation, route}: any) => {
  const {showAlert, showConfirm} = useAppDialog();
  const insets = useSafeAreaInsets();
  const requestId = route.params?.requestId as string;

  const request = useMateRequestsStore(s => s.getRequestById(requestId));
  const updateRequestStatus = useMateRequestsStore(s => s.updateRequestStatus);

  if (!request) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Request not found</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.missingLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const profile = getMateProfileFromRequest(
    request.mateUserId,
    request.mateName,
    request.mateTenureId,
    request.mateAvatar,
    request.categoryLabel,
    request.meetLocation,
  );

  if (!profile) {
    return null;
  }

  const genderLabel = profile.gender === 'male' ? 'Male' : 'Female';
  const roleLabel = getRoleLabel(profile.categories);
  const isPending = request.status === 'pending';
  const meetDuration = calcMeetDurationMinutes(
    request.fromDateTime,
    request.toDateTime,
  );

  const handleDecline = () => {
    showConfirm({
      title: 'Decline request',
      message: `Let ${profile.name} know you cannot take this request?`,
      confirmText: 'Sorry',
      onConfirm: () => {
        updateRequestStatus(request.id, 'declined');
        showAlert({
          title: 'Request declined',
          message: `${profile.name} has been notified.`,
          onClose: () => navigation.goBack(),
        });
      },
    });
  };

  const handleAccept = () => {
    updateRequestStatus(request.id, 'confirmed');
    showAlert({
      title: 'Request accepted',
      message: `You accepted ${profile.name}'s request. Chat will open once both sides confirm.`,
      onClose: () => navigation.goBack(),
    });
  };

  return (
    <>
      <StatusBar backgroundColor="#F9F9F7" barStyle="dark-content" />

      <View style={[styles.container, {paddingTop: insets.top + 8}]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable style={styles.headerBtn}>
              <Text style={styles.headerBtnIcon}>🔖</Text>
            </Pressable>
            <Pressable
              style={styles.headerBtn}
              onPress={() =>
                showAlert({
                  title: 'Share',
                  message: 'Share this request soon.',
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
            {paddingBottom: insets.bottom + (isPending ? 100 : 40)},
          ]}>
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Image source={{uri: profile.avatar}} style={styles.avatar} />
              <View style={styles.heroInfo}>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.meta}>Tenure Id : {profile.tenureId}</Text>
                <Text style={styles.meta}>
                  {genderLabel} Year : {profile.birthYear}
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

            <Pressable
              style={styles.messageBtn}
              onPress={() =>
                showAlert({
                  title: 'Message',
                  message: 'Chat opens after you accept the request.',
                })
              }>
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

          <View style={styles.sectionCard}>
            <View style={styles.availableHeader}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.sectionTitle}>Available Time</Text>
            </View>
            <Text style={styles.availableTime}>{profile.availableTime}</Text>
            <View style={styles.daysRow}>
              {WEEKDAYS.map(day => {
                const active = profile.availableDays.includes(day);
                return (
                  <View
                    key={day}
                    style={[styles.dayChip, active && styles.dayChipActive]}>
                    <Text
                      style={[
                        styles.dayText,
                        active && styles.dayTextActive,
                      ]}>
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>

          <View style={styles.socialGrid}>
            {profile.social.youtube ? (
              <View style={styles.socialPill}>
                <Text style={styles.socialEmoji}>▶</Text>
                <Text style={styles.socialLabel}>You tube</Text>
              </View>
            ) : null}
            {profile.social.instagram ? (
              <View style={styles.socialPill}>
                <Text style={styles.socialEmoji}>📷</Text>
                <Text style={styles.socialLabel}>Instagram</Text>
              </View>
            ) : null}
            {profile.social.website ? (
              <View style={[styles.socialPill, styles.websitePill]}>
                <Text style={styles.socialEmoji}>🌐</Text>
                <Text style={styles.socialLabel}>Own website</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.reviewsRow}>
            <View style={styles.commentsBtn}>
              <Text style={styles.commentsText}>Comments</Text>
            </View>
            <View style={styles.ratingBlock}>
              <Text style={styles.reviewsText}>
                {profile.reviewPercent} % Based on {profile.reviewCount} reviews
              </Text>
            </View>
          </View>

          <View style={styles.requestDetailsCard}>
            <View style={styles.requestRow}>
              <Text style={styles.requestPin}>📍</Text>
              <Text style={styles.requestRowText}>{request.meetLocation}</Text>
            </View>

            <Text style={styles.requestLabel}>Date : Time</Text>
            <Text style={styles.requestDateTime}>
              {request.fromDateTime} TO {request.toDateTime}
            </Text>
            {meetDuration && meetDuration > 0 ? (
              <View style={styles.durationPill}>
                <Text style={styles.requestDuration}>
                  Duration: {formatDurationHuman(meetDuration)}
                </Text>
              </View>
            ) : null}

            <Text style={styles.requestLabel}>Request</Text>
            <View style={styles.requestTypePill}>
              <Text style={styles.requestTypeText}>{request.categoryLabel}</Text>
            </View>

            {request.message ? (
              <View style={styles.requestMessageRow}>
                <Text style={styles.requestMsgIcon}>💬</Text>
                <Text style={styles.requestMessage}>{request.message}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {isPending ? (
          <View
            style={[
              styles.footer,
              {paddingBottom: insets.bottom + 12},
            ]}>
            <Pressable style={styles.sorryBtn} onPress={handleDecline}>
              <Text style={styles.footerBtnText}>Sorry</Text>
            </Pressable>
            <Pressable style={styles.acceptBtn} onPress={handleAccept}>
              <Text style={styles.footerBtnText}>Accept</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </>
  );
};

export default ReceivedRequestDetailScreen;

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
  },
  headerBtnIcon: {
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  heroCard: {
    backgroundColor: '#E5E7E9',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 6,
  },
  langText: {
    fontSize: 12,
    color: '#444444',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },
  sectionChevron: {
    position: 'absolute',
    right: 18,
    top: 16,
    fontSize: 22,
    color: '#999999',
  },
  availableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  availableTime: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 14,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dayChipActive: {
    backgroundColor: '#003B57',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  bioText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
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
  websitePill: {
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
    marginBottom: 16,
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
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  requestDetailsCard: {
    backgroundColor: '#F5E0D4',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  requestPin: {
    fontSize: 16,
    marginRight: 8,
  },
  requestRowText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  requestLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 6,
  },
  requestDateTime: {
    fontSize: 14,
    color: '#222222',
    marginBottom: 8,
  },
  durationPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F7FA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C5DCE6',
  },
  requestDuration: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003B57',
  },
  requestTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  requestTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textTransform: 'capitalize',
  },
  requestMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requestMsgIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  requestMessage: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(249, 249, 247, 0.96)',
  },
  sorryBtn: {
    flex: 1,
    backgroundColor: '#003B57',
    marginRight: 6,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#003B57',
    marginLeft: 6,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
