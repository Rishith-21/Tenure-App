import React, {useMemo} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';
import {
  formatMateShortMeta,
  formatProfileLocation,
} from '../../../utils/mateProfileDisplay';
import {PROFILE_CARD_RADIUS, cardShadow} from './styles';
import ProfileTrustBadges from './ProfileTrustBadges';

type Props = {
  name: string;
  avatarUri: string;
  galleryImages: string[];
  professionLine: string;
  district: string;
  fullLocation: string;
  tenureId: string;
  gender: 'male' | 'female';
  age: number;
  mateTypesLine: string;
  availabilityHint?: string | null;
  verified?: boolean;
  trusted?: boolean;
  onAvatarPress: () => void;
  onGalleryPress: () => void;
};

const MatePassportHero = ({
  name,
  avatarUri,
  galleryImages,
  professionLine,
  district,
  fullLocation,
  tenureId,
  gender,
  age,
  mateTypesLine,
  availabilityHint,
  verified,
  trusted,
  onAvatarPress,
  onGalleryPress,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const locationLine = formatProfileLocation(district, fullLocation);
  const metaLine = [
    formatMateShortMeta(gender, age),
    tenureId,
  ]
    .filter(Boolean)
    .join(' · ');
  const galleryPreviewImages = galleryImages.length > 0 ? galleryImages : [];

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <Pressable
          onPress={onAvatarPress}
          accessibilityRole="imagebutton"
          accessibilityLabel="View profile photo"
          style={styles.avatarPress}>
          <Image source={{uri: avatarUri}} style={styles.avatar} />
        </Pressable>

        <Text style={styles.name}>{name}</Text>
        <ProfileTrustBadges verified={verified} trusted={trusted} />
        {professionLine ? (
          <Text style={styles.role}>{professionLine}</Text>
        ) : null}
        {locationLine ? (
          <Text style={styles.location}>{locationLine}</Text>
        ) : null}
        <Text style={styles.meta}>{metaLine}</Text>

        {availabilityHint ? (
          <View style={styles.availRow}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>{availabilityHint}</Text>
          </View>
        ) : null}

        {mateTypesLine ? (
          <Text style={styles.mateLine}>{mateTypesLine}</Text>
        ) : null}

        <Pressable
          onPress={onGalleryPress}
          style={({pressed}) => [
            styles.galleryStrip,
            pressed && styles.galleryPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open photo gallery">
          <Text style={styles.galleryLabel}>Gallery</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryScroll}>
            {galleryPreviewImages.map((uri, index) => (
              <Image
                key={`${uri}-${index}`}
                source={{uri}}
                style={styles.galleryThumb}
              />
            ))}
          </ScrollView>
          <Text style={styles.galleryChevron}>›</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default MatePassportHero;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    outer: {
      marginTop: 4,
      paddingTop: 28,
    },
    card: {
      borderRadius: PROFILE_CARD_RADIUS,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingTop: 52,
      paddingBottom: 14,
      paddingHorizontal: 18,
      alignItems: 'center',
      ...cardShadow(c),
    },
    avatarPress: {
      position: 'absolute',
      top: -36,
      alignSelf: 'center',
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 3,
      borderColor: c.card,
      backgroundColor: c.chip,
    },
    name: {
      fontSize: 22,
      fontWeight: '600',
      color: c.text,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    role: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    location: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
    meta: {
      fontSize: 12,
      color: c.textHint,
      marginTop: 6,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    availRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: c.meetConfirmedCardBg,
    },
    availDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.success,
    },
    availText: {
      fontSize: 12,
      fontWeight: '500',
      color: c.success,
    },
    mateLine: {
      fontSize: 13,
      color: c.brandDark,
      marginTop: 10,
      textAlign: 'center',
      lineHeight: 18,
    },
    galleryStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      gap: 8,
    },
    galleryPressed: {
      opacity: 0.92,
    },
    galleryLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textHint,
      width: 52,
    },
    galleryScroll: {
      flex: 1,
      gap: 8,
    },
    galleryThumb: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: c.chip,
    },
    galleryChevron: {
      fontSize: 20,
      color: c.textHint,
      fontWeight: '300',
    },
  });
