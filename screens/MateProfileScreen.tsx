import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getMateProfile} from '../data/mateProfiles';
import {useAppDialog} from '../context/DialogContext';
import {useTheme} from '../context/ThemeContext';
import MatePublicProfileView from '../components/mate/MatePublicProfileView';
import {StickyRequestBar} from '../components/mate/profile';
import MateRequestModal, {
  MateRequestForm,
} from '../components/mate/MateRequestModal';
import {MATE_CATEGORIES} from '../constants/mateCategories';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {shareTenureProfile} from '../utils/share';
import {goBackSafe} from '../navigation/navigationActions';

const MateProfileScreen = ({navigation, route}: any) => {
  const {showAlert} = useAppDialog();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      <View style={[styles.missing, {paddingTop: insets.top}]}>
        <StatusBar backgroundColor={colors.bg} barStyle={colors.statusBar} />
        <Text style={styles.missingText}>Profile not found</Text>
        <Pressable onPress={() => goBackSafe(navigation)}>
          <Text style={styles.missingLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

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
    });

    setRequestModalVisible(false);
    showAlert({
      title: 'Request sent',
      message: `Your mate request was sent to ${profile.name}. Chat opens after they accept, so you can confirm and send OTP.`,
    });
  };

  return (
    <>
      <StatusBar backgroundColor={colors.bg} barStyle={colors.statusBar} />

      <MatePublicProfileView
        profile={profile}
        navigation={navigation}
        onBack={() => goBackSafe(navigation)}
        onShare={() =>
          shareTenureProfile({
            name: profile.name,
            tenureId: profile.tenureId,
          })
        }
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((v: boolean) => !v)}
        footer={
          <StickyRequestBar
            ratePerHour={profile.ratePerHour}
            onPress={() => setRequestModalVisible(true)}
          />
        }
      />

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
  });
