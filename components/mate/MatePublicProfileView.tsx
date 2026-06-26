import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MatePublicProfile, getRoleLabel} from '../../data/mateProfiles';
import ProfilePhotoViewer from '../profile/ProfilePhotoViewer';
import {useTheme} from '../../context/ThemeContext';
import {
  hasAadhaarVerification,
  isTrustedMember,
} from '../../utils/mateProfileBadges';
import {
  buildComfortZoneItems,
  formatAvailabilityHint,
  formatMateTypesLine,
  formatShortAvailDays,
  formatVehicleLine,
  vehicleIconFor,
} from '../../utils/mateProfileDisplay';
import {getMateSocialLinks} from '../../utils/mateSocialLinks';
import {
  AvailabilityCard,
  ComfortItem,
  LanguageChip,
  MatePassportHero,
  MateTypeChip,
  ProfileHeader,
  ReviewSummaryCard,
  SectionCard,
  SocialLinkCard,
  TrustMetricPill,
} from './profile';
import {
  PROFILE_H_PADDING,
  PROFILE_SECTION_GAP,
  createProfileSharedStyles,
} from './profile/styles';

type Props = {
  profile: MatePublicProfile;
  navigation: {navigate: (name: string, params?: object) => void};
  onBack: () => void;
  onShare: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  footer?: React.ReactNode;
  contentPaddingBottom?: number;
  headerSlot?: React.ReactNode;
  bodyPrefix?: React.ReactNode;
};

const STICKY_FOOTER_SPACE = 108;

const MatePublicProfileView = ({
  profile,
  navigation,
  onBack,
  onShare,
  isFavorite = false,
  onToggleFavorite,
  footer,
  contentPaddingBottom,
  headerSlot,
  bodyPrefix,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shared = useMemo(() => createProfileSharedStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [photoOpen, setPhotoOpen] = useState(false);

  const roleLabel = getRoleLabel(profile.categories);
  const showTrusted = isTrustedMember(
    profile.reviewPercent,
    profile.reviewCount,
  );
  const showVerified = hasAadhaarVerification(profile.aadhaarVerified);
  const professionLine = profile.professions.join(' · ');
  const headlineSubtitle = professionLine || roleLabel;
  const mateTypesLine = formatMateTypesLine(profile.categories);
  const availabilityHint = formatAvailabilityHint(profile.availableDays);
  const hasSchedule = profile.availableDays.length > 0;

  const socialLinks = getMateSocialLinks(profile.social);
  const comfortItems = buildComfortZoneItems(profile);
  const scrollBottom =
    contentPaddingBottom ??
    insets.bottom + (footer ? STICKY_FOOTER_SPACE : 28);

  return (
    <>
      <View style={styles.screen}>
        <View style={styles.headerOverlay}>
          <ProfileHeader
            onBack={onBack}
            onShare={onShare}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 52,
              paddingBottom: scrollBottom,
            },
          ]}>
          {headerSlot ? <View style={styles.slot}>{headerSlot}</View> : null}

          <MatePassportHero
            name={profile.name}
            avatarUri={profile.avatar}
            galleryImages={profile.gallery}
            professionLine={headlineSubtitle}
            district={profile.district}
            fullLocation={profile.location}
            tenureId={profile.tenureId}
            gender={profile.gender}
            age={profile.age}
            mateTypesLine={mateTypesLine}
            availabilityHint={availabilityHint}
            verified={showVerified}
            trusted={showTrusted}
            onAvatarPress={() => setPhotoOpen(true)}
            onGalleryPress={() =>
              navigation.navigate('Gallery', {
                title: `${profile.name} — Gallery`,
                images: profile.gallery,
                canEdit: false,
                persistProfile: false,
              })
            }
          />

          <View style={styles.metricsRow}>
            <TrustMetricPill
              value={`${profile.reviewPercent}%`}
              label="Trust score"
              accent
            />
            <TrustMetricPill
              value={String(profile.reviewCount)}
              label={
                profile.reviewCount === 1 ? 'review' : 'reviews'
              }
            />
            <TrustMetricPill
              value={`₹${profile.ratePerHour}`}
              label="per hour"
            />
            {hasSchedule ? (
              <TrustMetricPill
                value={formatShortAvailDays(profile.availableDays)}
                label="available"
              />
            ) : null}
          </View>

          {bodyPrefix ? <View style={styles.section}>{bodyPrefix}</View> : null}

          <View style={styles.section}>
            <SectionCard title="Mate Identity">
              {profile.categories.length > 0 ? (
                <View style={styles.chipGrid}>
                  {profile.categories.map(cat => (
                    <MateTypeChip key={cat} label={cat} />
                  ))}
                </View>
              ) : (
                <Text style={shared.emptyCopy}>
                  Mate types will appear once this profile is updated.
                </Text>
              )}
            </SectionCard>
          </View>

          <View style={styles.section}>
            <SectionCard title="Companion Note">
              {profile.bio?.trim() ? (
                <Text style={styles.companionText}>{profile.bio.trim()}</Text>
              ) : (
                <Text style={shared.emptyCopy}>
                  This mate has not added a companion note yet.
                </Text>
              )}
            </SectionCard>
          </View>

          <View style={styles.section}>
            <SectionCard title="Comfort Zone">
              {comfortItems.length > 0 ? (
                comfortItems.map((item, index) => (
                  <ComfortItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    last={index === comfortItems.length - 1}
                  />
                ))
              ) : (
                <Text style={shared.emptyCopy}>
                  Comfort preferences are not shared on this profile yet.
                </Text>
              )}
              <Text style={shared.sectionHint}>
                Tenure encourages public meetups and clear boundaries before
                you send a request.
              </Text>
            </SectionCard>
          </View>

          <View style={styles.section}>
            <SectionCard title="Availability">
              <AvailabilityCard
                days={profile.availableDays}
                timeRange={profile.availableTime}
                statusLabel={availabilityHint}
              />
            </SectionCard>
          </View>

          <View style={styles.section}>
            <SectionCard title="Languages">
              {profile.languages.length > 0 ? (
                <>
                  <View style={styles.langRow}>
                    {profile.languages.map(lang => (
                      <LanguageChip key={lang} language={lang} />
                    ))}
                  </View>
                  <Text style={shared.sectionHint}>
                    Can communicate comfortably in these languages.
                  </Text>
                </>
              ) : (
                <Text style={shared.emptyCopy}>
                  Languages not listed on this profile.
                </Text>
              )}
            </SectionCard>
          </View>

          {professionLine || profile.vehicles.length > 0 ? (
            <View style={styles.section}>
              <SectionCard title="Professional details">
                {professionLine ? (
                  <Text style={styles.profession}>{professionLine}</Text>
                ) : null}
                {profile.vehicles.map((vehicle, index) => (
                  <View
                    key={`${vehicle.id}-${index}`}
                    style={[
                      styles.vehicleRow,
                      index > 0 && styles.vehicleRowSpaced,
                    ]}>
                    <Text style={styles.vehicleIcon}>
                      {vehicleIconFor(vehicle.id)}
                    </Text>
                    <Text style={styles.vehicleText}>
                      {formatVehicleLine(vehicle)}
                    </Text>
                  </View>
                ))}
              </SectionCard>
            </View>
          ) : null}

          {socialLinks.length > 0 ? (
            <View style={styles.section}>
              <SectionCard title="Social links">
                {socialLinks.map(link => (
                  <SocialLinkCard key={link.platformId} link={link} />
                ))}
              </SectionCard>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionCard title="Reviews">
              <ReviewSummaryCard
                trustPercent={profile.reviewPercent}
                reviewCount={profile.reviewCount}
                trusted={showTrusted}
                verified={showVerified}
              />
            </SectionCard>
          </View>

          <Text style={styles.safety}>
            For safety, keep requests and communication inside Tenure.
          </Text>
        </ScrollView>

        {footer ? (
          <View style={styles.footerFloat}>{footer}</View>
        ) : null}
      </View>

      <ProfilePhotoViewer
        visible={photoOpen}
        uri={profile.avatar}
        name={profile.name}
        onClose={() => setPhotoOpen(false)}
      />
    </>
  );
};

export default MatePublicProfileView;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.bgElevated,
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
    },
    scroll: {
      paddingHorizontal: PROFILE_H_PADDING,
    },
    slot: {
      marginBottom: PROFILE_SECTION_GAP,
    },
    metricsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: PROFILE_SECTION_GAP,
      marginBottom: 4,
    },
    section: {
      marginTop: PROFILE_SECTION_GAP,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    companionText: {
      fontSize: 15,
      color: c.textSecondary,
      lineHeight: 23,
    },
    profession: {
      fontSize: 15,
      fontWeight: '500',
      color: c.text,
      lineHeight: 22,
    },
    vehicleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 10,
    },
    vehicleRowSpaced: {
      marginTop: 8,
    },
    vehicleIcon: {
      fontSize: 16,
    },
    vehicleText: {
      fontSize: 14,
      color: c.textMuted,
    },
    langRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    safety: {
      fontSize: 12,
      color: c.textHint,
      textAlign: 'center',
      lineHeight: 17,
      marginTop: PROFILE_SECTION_GAP,
      marginBottom: 8,
      paddingHorizontal: 12,
    },
    footerFloat: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
  });
