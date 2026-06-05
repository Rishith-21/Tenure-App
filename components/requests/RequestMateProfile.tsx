import React, {useMemo} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {MatePublicProfile} from '../../data/mateProfiles';
import {MateRequest} from '../../types/mateRequest';
import MatePublicProfileView from '../mate/MatePublicProfileView';
import {useTheme} from '../../context/ThemeContext';
import MateRequestMeetCard from './MateRequestMeetCard';
import RequestStatusBadges from './RequestStatusBadges';

type Props = {
  profile: MatePublicProfile;
  request: MateRequest;
  navigation: {navigate: (name: string, params?: object) => void};
  onBack: () => void;
  onShare: () => void;
  onOpenChat?: () => void;
  footer?: React.ReactNode;
};

const RequestMateProfile = ({
  profile,
  request,
  navigation,
  onBack,
  onShare,
  onOpenChat,
  footer,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <StatusBar backgroundColor={colors.bg} barStyle={colors.statusBar} />

      <MatePublicProfileView
        profile={profile}
        navigation={navigation}
        onBack={onBack}
        onShare={onShare}
        footer={footer}
        contentPaddingBottom={footer ? 120 : 28}
        headerSlot={<RequestStatusBadges request={request} />}
        bodyPrefix={
          <View style={styles.requestBlock}>
            <MateRequestMeetCard request={request} />
            {onOpenChat ? (
              <Pressable
                style={({pressed}) => [
                  styles.chatBtn,
                  pressed && styles.chatBtnPressed,
                ]}
                onPress={onOpenChat}>
                <Text style={styles.chatBtnText}>Open chat</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </>
  );
};

export default RequestMateProfile;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    requestBlock: {
      gap: 12,
    },
    chatBtn: {
      backgroundColor: c.brand,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    chatBtnPressed: {
      backgroundColor: c.primaryPressed,
    },
    chatBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
