import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {getMateProfileFromRequest} from '../data/mateProfiles';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {useAppDialog} from '../context/DialogContext';
import {useTheme} from '../context/ThemeContext';
import RequestMateProfile from '../components/requests/RequestMateProfile';
import {goBackSafe} from '../navigation/navigationActions';
import {formatMeetRange} from '../utils/meetTime';
import {shareTenureProfile} from '../utils/share';

const ReceivedRequestDetailScreen = ({navigation, route}: any) => {
  const {showAlert, showConfirm} = useAppDialog();
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
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

  const isPending = request.status === 'pending';
  const canChat = request.status === 'confirmed';

  const openChat = () => {
    navigation.navigate('Conversation', {
      chatFlow: 'incoming_request',
      mateName: request.mateName,
      mateTenureId: request.mateTenureId,
      mateAvatar: request.mateAvatar,
      sessionLabel: formatMeetRange(request.fromDateTime, request.toDateTime),
      meetDetails: request.categoryLabel,
      requestSentAt: request.sentAt,
      mateUserId: request.mateUserId,
      requestId: request.id,
    });
  };

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
      message: `You accepted ${profile.name}'s request. Open chat to confirm and share OTP.`,
      onClose: () => navigation.goBack(),
    });
  };

  return (
    <RequestMateProfile
      profile={profile}
      request={request}
      navigation={navigation}
      onBack={() => goBackSafe(navigation)}
      onShare={() =>
        shareTenureProfile({
          name: profile.name,
          tenureId: profile.tenureId,
        })
      }
      onOpenChat={canChat ? openChat : undefined}
      footer={
        isPending ? (
          <View style={styles.footerRow}>
            <Pressable
              style={({pressed}) => [
                styles.declineBtn,
                pressed && styles.footerBtnPressed,
              ]}
              onPress={handleDecline}>
              <Text style={styles.declineBtnText}>Sorry</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.acceptBtn,
                pressed && styles.footerBtnPressed,
              ]}
              onPress={handleAccept}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </Pressable>
          </View>
        ) : undefined
      }
    />
  );
};

export default ReceivedRequestDetailScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    missing: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgElevated,
    },
    missingText: {
      fontSize: 16,
      color: c.textMuted,
      marginBottom: 12,
    },
    missingLink: {
      fontSize: 16,
      color: c.brand,
      fontWeight: '700',
    },
    footerRow: {
      flexDirection: 'row',
      gap: 10,
    },
    declineBtn: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: c.chip,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    acceptBtn: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: c.brand,
    },
    footerBtnPressed: {
      opacity: 0.9,
    },
    declineBtnText: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textSecondary,
    },
    acceptBtnText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });
