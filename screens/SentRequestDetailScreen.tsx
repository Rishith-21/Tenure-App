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

const SentRequestDetailScreen = ({navigation, route}: any) => {
  const {showAlert, showConfirm} = useAppDialog();
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const requestId = route.params?.requestId as string;

  const request = useMateRequestsStore(s => s.getRequestById(requestId));
  const cancelSentRequest = useMateRequestsStore(s => s.cancelSentRequest);

  if (!request || request.direction !== 'sent') {
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

  const canCancel =
    request.status === 'pending' || request.status === 'confirmed';
  const canChat = request.status === 'confirmed';

  const openChat = () => {
    navigation.navigate('Conversation', {
      chatFlow: 'outgoing_request',
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

  const handleCancelRequest = () => {
    showConfirm({
      title: 'Cancel mate request',
      message: `Withdraw your request to ${profile.name}?`,
      confirmText: 'Cancel request',
      onConfirm: () => {
        cancelSentRequest(request.id);
        showAlert({
          title: 'Request cancelled',
          message: 'Your mate request was withdrawn.',
          onClose: () => navigation.goBack(),
        });
      },
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
        canCancel ? (
          <Pressable
            style={({pressed}) => [
              styles.cancelBtn,
              pressed && styles.cancelBtnPressed,
            ]}
            onPress={handleCancelRequest}>
            <Text style={styles.cancelBtnText}>Cancel mate request</Text>
          </Pressable>
        ) : undefined
      }
    />
  );
};

export default SentRequestDetailScreen;

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
    cancelBtn: {
      backgroundColor: c.warning,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    cancelBtnPressed: {
      opacity: 0.92,
    },
    cancelBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
