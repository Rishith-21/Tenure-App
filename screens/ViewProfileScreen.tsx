import React, {useMemo, useState, useCallback} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Svg, {Circle, Path} from 'react-native-svg';
import BackButton from '../components/navigation/BackButton';
import {goBackSafe} from '../navigation/navigationActions';
import {useTheme} from '../context/ThemeContext';
import {fetchCurrentUser, fetchProfile} from '../utils/api';
import {
  mapApiProfileToView,
  type ViewProfileData,
} from '../utils/profileApiMapper';
import {formatAgeYears} from '../utils/ageFromDob';
import type {AppColors} from '../theme/palettes';
import type {DesignTokens} from '../theme/tokens';

const DAY_LABELS: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

type Status = 'verified' | 'pending' | 'missing' | 'neutral';

function formatTimelineDate(iso: string | null): string {
  if (!iso) return 'Not yet';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const EMPTY_PROFILE: ViewProfileData = mapApiProfileToView(null, null, null);

/* ─── Minimal stroke icons (no emoji) ─────────────────────── */
type IconName =
  | 'edit'
  | 'chevron'
  | 'check'
  | 'clock'
  | 'shield'
  | 'pin'
  | 'star'
  | 'briefcase'
  | 'car'
  | 'globe'
  | 'spark'
  | 'eye';

const Icon = ({
  name,
  color,
  size = 18,
  strokeWidth = 1.75,
}: {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'edit' && (
        <Path d="M4 16.5 15 5.5l3.5 3.5L7.5 20H4v-3.5Z M13 7.5l3.5 3.5" {...common} />
      )}
      {name === 'chevron' && <Path d="M9 6l6 6-6 6" {...common} />}
      {name === 'check' && <Path d="M5 12.5l4.2 4.2L19 7" {...common} />}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={8.2} {...common} />
          <Path d="M12 7.6V12l3 2" {...common} />
        </>
      )}
      {name === 'shield' && (
        <Path
          d="M12 3.2l6.5 2.6v5c0 4.3-2.8 7.2-6.5 8.6-3.7-1.4-6.5-4.3-6.5-8.6v-5L12 3.2Z"
          {...common}
        />
      )}
      {name === 'pin' && (
        <>
          <Path
            d="M12 20.5s6-5.1 6-10.1A6 6 0 0 0 6 10.4c0 5 6 10.1 6 10.1Z"
            {...common}
          />
          <Circle cx={12} cy={10.2} r={2.2} {...common} />
        </>
      )}
      {name === 'star' && (
        <Path
          d="M12 4.2l2.3 4.8 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7L12 4.2Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          fill={color}
        />
      )}
      {name === 'briefcase' && (
        <>
          <Path d="M4 8.5h16v10.5H4z" {...common} />
          <Path d="M9 8.5V6.8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.7" {...common} />
        </>
      )}
      {name === 'car' && (
        <>
          <Path
            d="M5 13.5l1.6-4.6A2 2 0 0 1 8.5 7.5h7a2 2 0 0 1 1.9 1.4l1.6 4.6V18h-2v-1.6H7V18H5v-4.5Z"
            {...common}
          />
          <Circle cx={8} cy={15.8} r={1} {...common} />
          <Circle cx={16} cy={15.8} r={1} {...common} />
        </>
      )}
      {name === 'globe' && (
        <>
          <Circle cx={12} cy={12} r={8.2} {...common} />
          <Path d="M3.8 12h16.4M12 3.8c2.4 2.3 2.4 14.1 0 16.4M12 3.8c-2.4 2.3-2.4 14.1 0 16.4" {...common} />
        </>
      )}
      {name === 'spark' && (
        <Path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z" {...common} />
      )}
      {name === 'eye' && (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...common} />
          <Circle cx={12} cy={12} r={2.6} {...common} />
        </>
      )}
    </Svg>
  );
};

/* ─── Reusable internals ──────────────────────────────────── */

const StatusChip = ({
  label,
  status,
  styles,
  colors,
}: {
  label: string;
  status: Status;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) => {
  const tone =
    status === 'verified'
      ? {bg: hexA(colors.success, 0.1), fg: colors.success, dot: colors.success}
      : status === 'pending'
        ? {bg: hexA(colors.warning, 0.12), fg: colors.warning, dot: colors.warning}
        : status === 'missing'
          ? {bg: hexA(colors.danger, 0.1), fg: colors.danger, dot: colors.danger}
          : {bg: colors.chip, fg: colors.textSecondary, dot: colors.textMuted};
  return (
    <View style={[styles.statusChip, {backgroundColor: tone.bg}]}>
      <View style={[styles.statusDot, {backgroundColor: tone.dot}]} />
      <Text style={[styles.statusChipText, {color: tone.fg}]}>{label}</Text>
    </View>
  );
};

const ServiceChip = ({
  label,
  styles,
}: {
  label: string;
  styles: ReturnType<typeof createStyles>;
}) => (
  <View style={styles.serviceChip}>
    <Text style={styles.serviceChipText}>{label}</Text>
  </View>
);

const SectionCard = ({
  title,
  caption,
  actionLabel,
  onAction,
  children,
  styles,
  colors,
}: {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      <View style={styles.sectionHeadText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          hitSlop={8}
          onPress={onAction}
          style={({pressed}) => [styles.sectionAction, pressed && styles.pressed]}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Icon name="chevron" color={colors.brand} size={14} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
    {children}
  </View>
);

const ReadinessCard = ({
  percent,
  checks,
  styles,
  colors,
}: {
  percent: number;
  checks: {label: string; done: boolean}[];
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) => {
  const statusText =
    percent >= 80 ? 'Strong profile' : percent >= 50 ? 'Looking good' : 'Needs attention';
  return (
    <View style={styles.readiness}>
      <View style={styles.readinessTop}>
        <View style={styles.readinessRing}>
          <Text style={styles.readinessPercent}>{percent}%</Text>
        </View>
        <View style={styles.readinessCopy}>
          <Text style={styles.readinessStatus}>{statusText}</Text>
          <Text style={styles.readinessHint}>
            Complete missing details to receive better requests.
          </Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${percent}%`}]} />
      </View>
      <View style={styles.readinessChips}>
        {checks.map(c => (
          <StatusChip
            key={c.label}
            label={c.label}
            status={c.done ? 'verified' : 'pending'}
            styles={styles}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
};

const TrustRow = ({
  icon,
  label,
  status,
  value,
  styles,
  colors,
  isLast,
}: {
  icon: IconName;
  label: string;
  status: Status;
  value?: string;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
  isLast?: boolean;
}) => {
  const statusLabel =
    value ??
    (status === 'verified'
      ? 'Verified'
      : status === 'pending'
        ? 'Pending'
        : status === 'missing'
          ? 'Missing'
          : '');
  return (
    <View style={[styles.trustRow, !isLast && styles.trustRowBorder]}>
      <View style={styles.trustIconWrap}>
        <Icon name={icon} color={colors.brand} size={18} />
      </View>
      <Text style={styles.trustLabel}>{label}</Text>
      <StatusChip
        label={statusLabel}
        status={status}
        styles={styles}
        colors={colors}
      />
    </View>
  );
};

const DetailCard = ({
  icon,
  title,
  value,
  filled,
  actionLabel,
  onPress,
  styles,
  colors,
}: {
  icon: IconName;
  title: string;
  value: string;
  filled: boolean;
  actionLabel: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.detailCard, pressed && styles.pressed]}>
    <View style={styles.detailIconWrap}>
      <Icon name={icon} color={colors.brand} size={18} />
    </View>
    <Text style={styles.detailTitle}>{title}</Text>
    <Text
      style={[styles.detailValue, !filled && styles.detailValueEmpty]}
      numberOfLines={2}>
      {value}
    </Text>
    <Text style={styles.detailAction}>{filled ? 'Edit' : actionLabel}</Text>
  </Pressable>
);

const TimelineItem = ({
  label,
  value,
  isLast,
  styles,
  colors,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineGutter}>
      <View style={styles.timelineDot} />
      {!isLast ? <View style={styles.timelineLine} /> : null}
    </View>
    <View style={styles.timelineBody}>
      <Text style={styles.timelineLabel}>{label}</Text>
      <Text style={styles.timelineValue}>{value}</Text>
    </View>
  </View>
);

const EmptyState = ({
  text,
  actionLabel,
  onPress,
  styles,
}: {
  text: string;
  actionLabel?: string;
  onPress?: () => void;
  styles: ReturnType<typeof createStyles>;
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{text}</Text>
    {actionLabel && onPress ? (
      <Pressable
        onPress={onPress}
        style={({pressed}) => [styles.emptyBtn, pressed && styles.pressed]}>
        <Text style={styles.emptyBtnText}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

/* ─── Screen ──────────────────────────────────────────────── */

const ViewProfileScreen = ({navigation}: any) => {
  const {colors, tokens} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  const [profile, setProfile] = useState<ViewProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadData = async () => {
        setLoading(true);
        try {
          const [fetchedProfile, currentUser] = await Promise.all([
            fetchProfile(),
            fetchCurrentUser(),
          ]);
          if (active) {
            setProfile(
              mapApiProfileToView(
                fetchedProfile,
                currentUser?.phone ?? null,
                currentUser?.createdAt ?? null,
              ),
            );
          }
        } catch (err) {
          console.log('Failed to fetch profile in ViewProfileScreen:', err);
          if (active) {
            setProfile(mapApiProfileToView(null, null, null));
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };
      loadData();
      return () => {
        active = false;
      };
    }, [])
  );

  const u = profile;
  const displayName = u.name || 'Add your name';
  const displayAge = formatAgeYears(u.age);
  const displayLocation = u.location || 'Add location';
  const displayTenureId = u.tenureId || 'Not assigned';
  const displayRate = u.rate ? `₹${u.rate}` : '—';

  /* ── Navigation handlers (reuse existing routes) ──────── */
  const goEditProfile = () => navigation.navigate('UserProfile');
  const goVerification = () =>
    navigation.navigate('SettingsDetail', {itemId: 'verification'});
  const previewAsRequester = () => {
    // TODO: open dedicated requester-preview mode when available.
    navigation.navigate('UserProfile');
  };

  /* ── Derived data ─────────────────────────────────────── */
  const roleLine =
    u.categories.length > 0
      ? u.categories.slice(0, 3).join('  •  ')
      : 'Add the company you offer';

  const isAvailable = u.days.length > 0;

  const readinessChecks = useMemo(
    () => [
      {label: 'Bio', done: u.about.trim().length > 0},
      {label: 'Categories', done: u.categories.length > 0},
      {label: 'Aadhaar', done: u.aadhaarVerified},
      {label: 'Profession', done: u.professions.length > 0},
      {label: 'Availability', done: u.days.length > 0},
      {label: 'Photo', done: Boolean(u.avatar)},
    ],
    [u],
  );

  const readinessPercent = Math.round(
    (readinessChecks.filter(c => c.done).length / readinessChecks.length) * 100,
  );

  const verificationPending =
    !u.aadhaarVerified || !u.phoneVerified || !u.emailVerified || !u.photoVerified;

  const ratingDisplay = u.ratingValue != null ? u.ratingValue.toFixed(1) : 'New';
  const availableDaysLabel = u.days.map(d => DAY_LABELS[d] ?? d).join(', ');

  const requesterSummary =
    u.categories.length > 0 && u.location
      ? `${displayName} is available for ${u.categories.slice(0, 3).join(', ')} requests around ${u.location}.`
      : u.categories.length > 0
        ? `${displayName} is available for ${u.categories.slice(0, 3).join(', ')} requests.`
        : `${displayName} is setting up their companion profile on Tenure.`;

  return (
    <View style={styles.screen}>
      {/* 1. Header */}
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>View Profile</Text>
          <Text style={styles.headerSubtitle}>Your public companion passport</Text>
        </View>
        <Pressable
          onPress={goEditProfile}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({pressed}) => [styles.headerEdit, pressed && styles.pressed]}>
          <Icon name="edit" color={colors.brand} size={18} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.spacing.lg,
          paddingTop: tokens.spacing.md,
          paddingBottom: insets.bottom + 108,
        }}>
        {/* 2. Tenure Passport hero */}
        <View style={styles.passport}>
          <View style={styles.passportTopRow}>
            <Text style={styles.passportLabel}>TENURE PASSPORT</Text>
            <View style={styles.passportStatus}>
              <View style={styles.passportStatusDot} />
              <Text style={styles.passportStatusText}>
                {isAvailable ? 'Ready for requests' : 'Profile active'}
              </Text>
            </View>
          </View>

          <View style={styles.passportIdentity}>
            {u.avatar ? (
              <Image source={{uri: u.avatar}} style={styles.passportAvatar} />
            ) : (
              <View style={[styles.passportAvatar, styles.passportAvatarPlaceholder]}>
                <Text style={styles.passportAvatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.passportInfo}>
              <View style={styles.passportNameRow}>
                <Text style={styles.passportName} numberOfLines={1}>
                  {displayName}
                </Text>
                {displayAge ? (
                  <Text style={styles.passportAge}>{displayAge}</Text>
                ) : null}
                {u.aadhaarVerified ? (
                  <View style={styles.verifiedBadge}>
                    <Icon name="check" color="#FFFFFF" size={11} strokeWidth={2.4} />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.passportLocationRow}>
                <Icon name="pin" color={colors.textMuted} size={13} />
                <Text style={styles.passportLocation}>{displayLocation}</Text>
              </View>
              <Text style={styles.passportTenureId}>Tenure ID · {displayTenureId}</Text>
            </View>
          </View>

          <Text style={styles.passportRole}>{roleLine}</Text>

          <View style={styles.passportDivider} />

          <View style={styles.passportStats}>
            <View style={styles.passportStat}>
              <Text style={styles.passportStatValue}>{displayRate}</Text>
              <Text style={styles.passportStatLabel}>per hour</Text>
            </View>
            <View style={styles.passportStatSep} />
            <View style={styles.passportStat}>
              <View style={styles.ratingRow}>
                <Icon name="star" color={colors.rating} size={14} />
                <Text style={styles.passportStatValue}>{ratingDisplay}</Text>
              </View>
              <Text style={styles.passportStatLabel}>
                {u.reviewCount > 0 ? `${u.reviewCount} reviews` : 'rating'}
              </Text>
            </View>
            <View style={styles.passportStatSep} />
            <View style={styles.passportStat}>
              <Text
                style={[
                  styles.passportStatValue,
                  {color: isAvailable ? colors.success : colors.textMuted},
                ]}>
                {isAvailable ? 'Active' : 'Paused'}
              </Text>
              <Text style={styles.passportStatLabel}>availability</Text>
            </View>
          </View>
        </View>

        {/* 3. Requester preview */}
        <SectionCard
          title="How requesters see you"
          styles={styles}
          colors={colors}>
          <Text style={styles.previewSummary}>{requesterSummary}</Text>
          <View style={styles.previewMeta}>
            <Text style={styles.previewMetaItem}>{u.rate ? `₹${u.rate}/hr` : 'Rate not set'}</Text>
            <View style={styles.previewMetaDot} />
            <Text style={styles.previewMetaItem}>
              {isAvailable ? 'Available' : 'Paused'}
            </Text>
            <View style={styles.previewMetaDot} />
            <Text style={styles.previewMetaItem}>
              {u.aadhaarVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
          <Pressable
            onPress={previewAsRequester}
            style={({pressed}) => [styles.previewBtn, pressed && styles.pressed]}>
            <Icon name="eye" color={colors.brand} size={16} />
            <Text style={styles.previewBtnText}>Preview as requester</Text>
          </Pressable>
        </SectionCard>

        {/* 4. Profile readiness */}
        <SectionCard title="Profile readiness" styles={styles} colors={colors}>
          <ReadinessCard
            percent={readinessPercent}
            checks={readinessChecks}
            styles={styles}
            colors={colors}
          />
        </SectionCard>

        {/* 5. Companion identity */}
        <SectionCard
          title="Companion Identity"
          actionLabel="Edit"
          onAction={goEditProfile}
          styles={styles}
          colors={colors}>
          <Text style={styles.subLabel}>I am good for</Text>
          {u.categories.length > 0 ? (
            <View style={styles.chipWrap}>
              {u.categories.map(c => (
                <ServiceChip key={c} label={c} styles={styles} />
              ))}
            </View>
          ) : (
            <EmptyState
              text="Add the kinds of company you offer."
              actionLabel="Add categories"
              onPress={goEditProfile}
              styles={styles}
            />
          )}

          <Text style={[styles.subLabel, styles.subLabelSpaced]}>My vibe</Text>
          {u.vibes.length > 0 ? (
            <View style={styles.chipWrap}>
              {u.vibes.map(v => (
                <ServiceChip key={v} label={v} styles={styles} />
              ))}
            </View>
          ) : (
            <EmptyState
              text="Add a few words that describe your company."
              actionLabel="Add vibe"
              onPress={goEditProfile}
              styles={styles}
            />
          )}

          <Text style={[styles.subLabel, styles.subLabelSpaced]}>Languages</Text>
          {u.languages.length > 0 ? (
            <View style={styles.chipWrap}>
              {u.languages.map(l => (
                <ServiceChip key={l} label={l} styles={styles} />
              ))}
            </View>
          ) : (
            <EmptyState
              text="No languages added yet."
              actionLabel="Add languages"
              onPress={goEditProfile}
              styles={styles}
            />
          )}
        </SectionCard>

        {/* 6. Time passport */}
        <SectionCard
          title="Time Passport"
          actionLabel="Edit"
          onAction={goEditProfile}
          styles={styles}
          colors={colors}>
          {isAvailable ? (
            <View style={styles.timeBlock}>
              <View style={styles.timeRow}>
                <Text style={styles.timeKey}>Available days</Text>
                <Text style={styles.timeValue}>{availableDaysLabel}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeKey}>Usual time</Text>
                <Text style={styles.timeValue}>{u.timeRange}</Text>
              </View>
              {u.bestTime ? (
                <View style={styles.timeRow}>
                  <Text style={styles.timeKey}>Best time</Text>
                  <Text style={styles.timeValue}>{u.bestTime}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <EmptyState
              text="Set your weekly availability so requesters know when to reach you."
              actionLabel="Add availability"
              onPress={goEditProfile}
              styles={styles}
            />
          )}
        </SectionCard>

        {/* 7. Trust wallet */}
        <SectionCard title="Trust Wallet" styles={styles} colors={colors}>
          <View style={styles.trustList}>
            <TrustRow
              icon="shield"
              label="Phone verified"
              status={u.phoneVerified ? 'verified' : 'missing'}
              styles={styles}
              colors={colors}
            />
            <TrustRow
              icon="shield"
              label="Email verified"
              status={u.emailVerified ? 'verified' : 'missing'}
              styles={styles}
              colors={colors}
            />
            <TrustRow
              icon="shield"
              label="Aadhaar verification"
              status={u.aadhaarVerified ? 'verified' : 'pending'}
              styles={styles}
              colors={colors}
            />
            <TrustRow
              icon="check"
              label="Profile photo"
              status={u.photoVerified ? 'verified' : 'missing'}
              styles={styles}
              colors={colors}
            />
            <TrustRow
              icon="star"
              label="Reviews"
              status="neutral"
              value={u.reviewCount > 0 ? `${u.reviewCount}` : 'None yet'}
              styles={styles}
              colors={colors}
            />
            <TrustRow
              icon="star"
              label="Rating"
              status="neutral"
              value={ratingDisplay}
              styles={styles}
              colors={colors}
              isLast
            />
          </View>
          {verificationPending ? (
            <Pressable
              onPress={goVerification}
              style={({pressed}) => [styles.trustCta, pressed && styles.pressed]}>
              <Text style={styles.trustCtaText}>Complete verification</Text>
              <Icon name="chevron" color="#FFFFFF" size={15} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </SectionCard>

        {/* 8. Meet comfort zone */}
        <SectionCard
          title="Meet Comfort Zone"
          caption="Helps requesters meet you safely"
          actionLabel={u.comfort ? 'Edit' : undefined}
          onAction={u.comfort ? goEditProfile : undefined}
          styles={styles}
          colors={colors}>
          {u.comfort ? (
            <View style={styles.timeBlock}>
              <View style={styles.timeRow}>
                <Text style={styles.timeKey}>Preferred places</Text>
                <Text style={styles.timeValue}>{u.comfort.preferredPlaces}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeKey}>Travel range</Text>
                <Text style={styles.timeValue}>{u.comfort.travelRange}</Text>
              </View>
              <View style={styles.comfortBlock}>
                <Text style={styles.timeKey}>Comfortable with</Text>
                <Text style={styles.comfortValue}>{u.comfort.comfortableWith}</Text>
              </View>
              <View style={styles.comfortBlock}>
                <Text style={styles.timeKey}>Not comfortable with</Text>
                <Text style={styles.comfortValue}>
                  {u.comfort.notComfortableWith}
                </Text>
              </View>
            </View>
          ) : (
            <EmptyState
              text="Set where and how you're comfortable meeting requesters."
              actionLabel="Add preferences"
              onPress={goEditProfile}
              styles={styles}
            />
          )}
        </SectionCard>

        {/* 9. Companion note */}
        <SectionCard
          title="My Companion Note"
          actionLabel="Edit note"
          onAction={goEditProfile}
          styles={styles}
          colors={colors}>
          {u.about.trim().length > 0 ? (
            <Text style={styles.noteText}>{u.about}</Text>
          ) : (
            <Text style={styles.notePlaceholder}>
              Add a short note so requesters understand what kind of company you
              enjoy.
            </Text>
          )}
        </SectionCard>

        {/* 10. Detail cards */}
        <SectionCard title="Details" styles={styles} colors={colors}>
          <View style={styles.detailGrid}>
            <DetailCard
              icon="briefcase"
              title="Profession"
              value={u.professions.length > 0 ? u.professions.join(', ') : 'Not added'}
              filled={u.professions.length > 0}
              actionLabel="Add"
              onPress={goEditProfile}
              styles={styles}
              colors={colors}
            />
            <DetailCard
              icon="car"
              title="Vehicle"
              value={u.vehicles.length > 0 ? u.vehicles.join(', ') : 'Not added'}
              filled={u.vehicles.length > 0}
              actionLabel="Add"
              onPress={goEditProfile}
              styles={styles}
              colors={colors}
            />
            <DetailCard
              icon="spark"
              title="Interests"
              value={u.interests.length > 0 ? u.interests.join(', ') : 'Not added'}
              filled={u.interests.length > 0}
              actionLabel="Add"
              onPress={goEditProfile}
              styles={styles}
              colors={colors}
            />
            <DetailCard
              icon="globe"
              title="Languages"
              value={u.languages.length > 0 ? u.languages.join(', ') : 'Not added'}
              filled={u.languages.length > 0}
              actionLabel="Add"
              onPress={goEditProfile}
              styles={styles}
              colors={colors}
            />
          </View>
        </SectionCard>

        {/* 11. Reviews */}
        <SectionCard title="Reviews Received" styles={styles} colors={colors}>
          {u.reviewCount > 0 ? (
            <View style={styles.reviewHeader}>
              <Icon name="star" color={colors.rating} size={18} />
              <Text style={styles.reviewAvg}>{ratingDisplay}</Text>
              <Text style={styles.reviewCount}>· {u.reviewCount} reviews</Text>
            </View>
          ) : (
            <EmptyState
              text={'No reviews yet.\nReviews will appear here after completed requests.'}
              styles={styles}
            />
          )}
        </SectionCard>

        {/* 12. Profile timeline */}
        <SectionCard title="Profile Timeline" styles={styles} colors={colors}>
          <View style={styles.timeline}>
            <TimelineItem
              label="Joined Tenure"
              value={formatTimelineDate(u.joinedAt)}
              styles={styles}
              colors={colors}
            />
            <TimelineItem
              label="Profile created"
              value={formatTimelineDate(u.profileCreatedAt)}
              styles={styles}
              colors={colors}
            />
            <TimelineItem
              label="Reviews received"
              value={u.reviewCount > 0 ? `${u.reviewCount} reviews` : 'None yet'}
              isLast
              styles={styles}
              colors={colors}
            />
          </View>
        </SectionCard>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.brand} />
          </View>
        ) : null}
      </ScrollView>

      {/* 13. Sticky owner CTA */}
      <View
        style={[
          styles.sticky,
          {paddingBottom: insets.bottom > 0 ? insets.bottom : 12},
        ]}>
        <View style={styles.stickyLeft}>
          <Text style={styles.stickyPercent}>Profile {readinessPercent}% ready</Text>
          <View style={styles.stickyTrack}>
            <View style={[styles.stickyFill, {width: `${readinessPercent}%`}]} />
          </View>
        </View>
        <Pressable
          onPress={goEditProfile}
          style={({pressed}) => [styles.stickyBtn, pressed && styles.pressed]}>
          <Text style={styles.stickyBtnText}>Edit Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ViewProfileScreen;

/* ─── Helpers ─────────────────────────────────────────────── */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) {
    return hex;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ─── Styles ──────────────────────────────────────────────── */
const createStyles = (c: AppColors, t: DesignTokens) =>
  StyleSheet.create({
    screen: {flex: 1, backgroundColor: c.bgElevated},
    pressed: {opacity: 0.7},

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.lg,
      paddingBottom: t.spacing.md,
      gap: t.spacing.md,
      backgroundColor: c.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerCopy: {flex: 1, minWidth: 0},
    headerTitle: {fontSize: 18, fontWeight: '800', color: c.text, letterSpacing: -0.3},
    headerSubtitle: {fontSize: 12.5, fontWeight: '500', color: c.textMuted, marginTop: 2},
    headerEdit: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.borderInput,
    },

    /* Passport hero */
    passport: {
      backgroundColor: c.card,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.xl,
      ...t.shadows.card(c.shadow),
    },
    passportTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    passportLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2.2,
      color: c.textMuted,
    },
    passportStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: hexA(c.success, 0.1),
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: t.radius.pill,
    },
    passportStatusDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: c.success},
    passportStatusText: {fontSize: 11, fontWeight: '700', color: c.success},

    passportIdentity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.lg,
      marginTop: t.spacing.xl,
    },
    passportAvatar: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
    },
    passportAvatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexA(c.brand, 0.1),
    },
    passportAvatarInitial: {
      fontSize: 28,
      fontWeight: '800',
      color: c.brand,
    },
    loadingOverlay: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: t.spacing.lg,
    },
    passportInfo: {flex: 1, minWidth: 0},
    passportNameRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    passportName: {
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.5,
      flexShrink: 1,
    },
    passportAge: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textSecondary,
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: c.success,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radius.pill,
    },
    verifiedBadgeText: {fontSize: 10.5, fontWeight: '800', color: '#FFFFFF'},
    passportLocationRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5},
    passportLocation: {fontSize: 13.5, fontWeight: '500', color: c.textSecondary},
    passportTenureId: {fontSize: 12, fontWeight: '500', color: c.textHint, marginTop: 5},

    passportRole: {
      fontSize: 14,
      fontWeight: '700',
      color: c.brand,
      marginTop: t.spacing.lg,
      letterSpacing: -0.2,
    },
    passportDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginVertical: t.spacing.lg,
    },
    passportStats: {flexDirection: 'row', alignItems: 'center'},
    passportStat: {flex: 1, alignItems: 'center'},
    passportStatSep: {width: StyleSheet.hairlineWidth, height: 32, backgroundColor: c.border},
    ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
    passportStatValue: {fontSize: 17, fontWeight: '800', color: c.text, letterSpacing: -0.3},
    passportStatLabel: {fontSize: 11.5, fontWeight: '500', color: c.textMuted, marginTop: 3},

    /* Section */
    section: {
      backgroundColor: c.card,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.xl,
      marginTop: t.spacing.lg,
      ...t.shadows.soft(c.shadow),
    },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: t.spacing.lg,
      gap: t.spacing.md,
    },
    sectionHeadText: {flex: 1, minWidth: 0},
    sectionTitle: {fontSize: 16, fontWeight: '800', color: c.text, letterSpacing: -0.3},
    sectionCaption: {fontSize: 12.5, fontWeight: '500', color: c.textMuted, marginTop: 3},
    sectionAction: {flexDirection: 'row', alignItems: 'center', gap: 2},
    sectionActionText: {fontSize: 13.5, fontWeight: '700', color: c.brand},

    /* Requester preview */
    previewSummary: {fontSize: 14.5, fontWeight: '500', color: c.textSecondary, lineHeight: 21},
    previewMeta: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: t.spacing.md},
    previewMetaItem: {fontSize: 12.5, fontWeight: '700', color: c.text},
    previewMetaDot: {width: 3, height: 3, borderRadius: 2, backgroundColor: c.textHint},
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: t.spacing.lg,
      height: 46,
      borderRadius: t.radius.sm,
      borderWidth: 1,
      borderColor: c.borderInput,
      backgroundColor: c.bgElevated,
    },
    previewBtnText: {fontSize: 14, fontWeight: '700', color: c.brand},

    /* Readiness */
    readiness: {},
    readinessTop: {flexDirection: 'row', alignItems: 'center', gap: t.spacing.lg},
    readinessRing: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 3,
      borderColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexA(c.brand, 0.06),
    },
    readinessPercent: {fontSize: 16, fontWeight: '800', color: c.brand},
    readinessCopy: {flex: 1, minWidth: 0},
    readinessStatus: {fontSize: 15, fontWeight: '800', color: c.text},
    readinessHint: {fontSize: 12.5, fontWeight: '500', color: c.textMuted, marginTop: 3, lineHeight: 18},
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.chip,
      overflow: 'hidden',
      marginTop: t.spacing.lg,
    },
    progressFill: {height: 6, borderRadius: 3, backgroundColor: c.brand},
    readinessChips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: t.spacing.lg},

    /* Status chip */
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: t.radius.pill,
    },
    statusDot: {width: 6, height: 6, borderRadius: 3},
    statusChipText: {fontSize: 12, fontWeight: '700'},

    /* Service chip */
    chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    serviceChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: t.radius.pill,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    serviceChipText: {fontSize: 13, fontWeight: '600', color: c.text},
    subLabel: {fontSize: 12.5, fontWeight: '700', color: c.textMuted, marginBottom: t.spacing.md, letterSpacing: 0.2},
    subLabelSpaced: {marginTop: t.spacing.xl},

    /* Time / comfort blocks */
    timeBlock: {gap: t.spacing.md},
    timeRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.md},
    timeKey: {fontSize: 13.5, fontWeight: '500', color: c.textMuted},
    timeValue: {fontSize: 14, fontWeight: '700', color: c.text, flexShrink: 1, textAlign: 'right'},
    comfortBlock: {gap: 5},
    comfortValue: {fontSize: 14, fontWeight: '600', color: c.text, lineHeight: 20},

    /* Trust wallet */
    trustList: {},
    trustRow: {flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md},
    trustRowBorder: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border},
    trustIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexA(c.brand, 0.07),
    },
    trustLabel: {flex: 1, fontSize: 14, fontWeight: '600', color: c.text},
    trustCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: t.spacing.lg,
      height: 48,
      borderRadius: t.radius.sm,
      backgroundColor: c.brand,
    },
    trustCtaText: {fontSize: 14.5, fontWeight: '800', color: '#FFFFFF'},

    /* Note */
    noteText: {fontSize: 14.5, fontWeight: '500', color: c.text, lineHeight: 22},
    notePlaceholder: {fontSize: 14, fontWeight: '500', color: c.textHint, lineHeight: 21, fontStyle: 'italic'},

    /* Detail grid */
    detailGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md},
    detailCard: {
      flexGrow: 1,
      flexBasis: '47%',
      backgroundColor: c.bgElevated,
      borderRadius: t.radius.sm,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.lg,
    },
    detailIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: t.spacing.md,
    },
    detailTitle: {fontSize: 12.5, fontWeight: '700', color: c.textMuted, letterSpacing: 0.2},
    detailValue: {fontSize: 14, fontWeight: '700', color: c.text, marginTop: 4, lineHeight: 19},
    detailValueEmpty: {color: c.textHint, fontWeight: '500'},
    detailAction: {fontSize: 12.5, fontWeight: '700', color: c.brand, marginTop: t.spacing.md},

    /* Reviews */
    reviewHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
    reviewAvg: {fontSize: 20, fontWeight: '800', color: c.text},
    reviewCount: {fontSize: 13.5, fontWeight: '600', color: c.textMuted},

    /* Timeline */
    timeline: {},
    timelineItem: {flexDirection: 'row', gap: t.spacing.md},
    timelineGutter: {alignItems: 'center', width: 16},
    timelineDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: c.brand, marginTop: 4},
    timelineLine: {flex: 1, width: 2, backgroundColor: c.border, marginTop: 4, minHeight: 22},
    timelineBody: {flex: 1, paddingBottom: t.spacing.lg},
    timelineLabel: {fontSize: 14, fontWeight: '700', color: c.text},
    timelineValue: {fontSize: 12.5, fontWeight: '500', color: c.textMuted, marginTop: 2},

    /* Empty state */
    emptyState: {
      backgroundColor: c.bgElevated,
      borderRadius: t.radius.sm,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.lg,
      alignItems: 'flex-start',
      gap: t.spacing.md,
    },
    emptyText: {fontSize: 13.5, fontWeight: '500', color: c.textMuted, lineHeight: 20},
    emptyBtn: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: c.borderInput,
      backgroundColor: c.card,
    },
    emptyBtnText: {fontSize: 13, fontWeight: '700', color: c.brand},

    /* Sticky CTA */
    sticky: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.lg,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      backgroundColor: c.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      ...t.shadows.nav(c.shadow),
    },
    stickyLeft: {flex: 1, minWidth: 0},
    stickyPercent: {fontSize: 13, fontWeight: '700', color: c.text},
    stickyTrack: {
      height: 5,
      borderRadius: 3,
      backgroundColor: c.chip,
      overflow: 'hidden',
      marginTop: 6,
    },
    stickyFill: {height: 5, borderRadius: 3, backgroundColor: c.brand},
    stickyBtn: {
      paddingHorizontal: 22,
      height: 46,
      borderRadius: t.radius.sm,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stickyBtnText: {fontSize: 14.5, fontWeight: '800', color: '#FFFFFF'},
  });
