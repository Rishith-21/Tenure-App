import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfilePhotoCropModal, {
  type CropSource,
} from '../components/profile/ProfilePhotoCropModal';
import {pickProfilePhotoFromLibrary} from '../utils/profilePhotoPicker';
import Svg, {Circle, Path} from 'react-native-svg';
import BackButton from '../components/navigation/BackButton';
import DraggableBottomDrawer, {
  DraggableBottomDrawerRef,
} from '../components/ui/DraggableBottomDrawer';
import NativeDateTimePicker from '../components/ui/NativeDateTimePicker';
import {goBackSafe} from '../navigation/navigationActions';
import type {AppColors} from '../theme/palettes';
import type {DesignTokens} from '../theme/tokens';
import {MAIN_TAB_BAR_RESERVE} from '../navigation/tabBarLayout';
import {useTheme} from '../context/ThemeContext';
import {
  PROFESSION_OPTIONS,
  SOCIAL_PLATFORMS,
  SocialPlatform,
  VEHICLE_OPTIONS,
} from '../constants/profileOptions';
import {resetToLogin} from '../utils/authNavigation';
import {useFocusEffect} from '@react-navigation/native';
import ProfileGallerySection from '../components/profile/ProfileGallerySection';
import ProfileSocialSection, {
  type ProfileSocialItem,
} from '../components/profile/ProfileSocialSection';
import SocialLinkSheet from '../components/profile/SocialLinkSheet';
import {useAppDialog} from '../context/DialogContext';
import {loadProfileGallery} from '../utils/profileGalleryStorage';
import {
  loadProfileSocial,
  saveProfileSocial,
  type ProfileSocialLinks,
  type ProfileSocialPlatformId,
} from '../utils/profileSocialStorage';
import {formatSocialDisplayUrl} from '../utils/mateSocialLinks';

type SheetType = 'category' | 'profession' | 'vehicle' | null;

const CATEGORY_OPTIONS = [
  'Travel Buddy',
  'Study Partner',
  'Shopping Mate',
  'Workout Mate',
  'Movie Mate',
  'Hospital Mate',
  'Local Guide',
  'Food Buddy',
  'Language Partner',
  'Project Partner',
  'Photography Buddy',
  'Pet Care Buddy',
  'Gaming Buddy',
];

const CATEGORY_SYMBOLS: Record<string, string> = {
  'Travel Buddy': 'T',
  'Study Partner': 'S',
  'Shopping Mate': 'S',
  'Workout Mate': 'W',
  'Movie Mate': 'M',
  'Hospital Mate': 'H',
  'Local Guide': 'L',
  'Food Buddy': 'F',
  'Language Partner': 'L',
  'Project Partner': 'P',
  'Photography Buddy': 'P',
  'Pet Care Buddy': 'P',
  'Gaming Buddy': 'G',
};

const DAYS = [
  {id: 'MON', label: 'M'},
  {id: 'TUE', label: 'T'},
  {id: 'WED', label: 'W'},
  {id: 'THU', label: 'T'},
  {id: 'FRI', label: 'F'},
  {id: 'SAT', label: 'S'},
  {id: 'SUN', label: 'S'},
];

const DAY_FULL: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

const TENURE_ID = 'T-9082';
const REVIEW_COUNT = 128;
const RATING_VALUE = '4.9';

type IconName =
  | 'edit'
  | 'settings'
  | 'chevron'
  | 'check'
  | 'pin'
  | 'star'
  | 'shield'
  | 'eye'
  | 'plus';

const StrokeIcon = ({
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
  const s = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'edit' && <Path d="M4 16.5 15 5.5l3.5 3.5L7.5 20H4v-3.5Z M13 7.5l3.5 3.5" {...s} />}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={2.8} {...s} />
          <Path
            d="M12 2.8v2.2M12 19v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.8 12h2.2M19 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"
            {...s}
          />
        </>
      )}
      {name === 'chevron' && <Path d="M9 6l6 6-6 6" {...s} />}
      {name === 'check' && <Path d="M5 12.5l4.2 4.2L19 7" {...s} />}
      {name === 'pin' && (
        <>
          <Path d="M12 20.5s6-5.1 6-10.1A6 6 0 0 0 6 10.4c0 5 6 10.1 6 10.1Z" {...s} />
          <Circle cx={12} cy={10.2} r={2.2} {...s} />
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
      {name === 'shield' && (
        <Path d="M12 3.2l6.5 2.6v5c0 4.3-2.8 7.2-6.5 8.6-3.7-1.4-6.5-4.3-6.5-8.6v-5L12 3.2Z" {...s} />
      )}
      {name === 'eye' && (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...s} />
          <Circle cx={12} cy={12} r={2.6} {...s} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...s} />}
    </Svg>
  );
};

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

function socialLinksToItems(links: ProfileSocialLinks): ProfileSocialItem[] {
  return SOCIAL_PLATFORMS.filter(
    p => links[p.id as ProfileSocialPlatformId],
  ).map(p => {
    const url = links[p.id as ProfileSocialPlatformId]!;
    return {
      platformId: p.id,
      label: p.label,
      icon: p.icon,
      url,
      displayUrl: formatSocialDisplayUrl(url),
    };
  });
}

const UserProfileScreenClean = ({navigation, route}: any) => {
  const {showAlert, showChoice} = useAppDialog();
  const {colors, tokens} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const embeddedTab = route.params?.embeddedTab === true;

  const [location, setLocation] = useState('Mitte, Berlin');
  const [profileName, setProfileName] = useState('Julian Voss');
  const [profileImage, setProfileImage] = useState(
    'https://i.pravatar.cc/120?img=12',
  );
  const [hourlyRate, setHourlyRate] = useState('45');
  const [about, setAbout] = useState('');
  const [aboutDraft, setAboutDraft] = useState('');
  const [aboutSaved, setAboutSaved] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Travel Buddy']);
  const [professions, setProfessions] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>(['MON', 'WED', 'THU', 'FRI']);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    return d;
  });
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(
    null,
  );
  const [sheet, setSheet] = useState<SheetType>(null);
  const profileSheetRef = useRef<DraggableBottomDrawerRef>(null);
  const advanceTimePickerRef = useRef(false);
  const [search, setSearch] = useState('');
  const [pendingSheetItems, setPendingSheetItems] = useState<string[]>([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationInput, setLocationInput] = useState(location);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [editRate, setEditRate] = useState(hourlyRate);
  const [aadhaarModalVisible, setAadhaarModalVisible] = useState(false);
  const [aadhaarName, setAadhaarName] = useState(profileName);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarMasked, setAadhaarMasked] = useState('');
  const [aboutEditVisible, setAboutEditVisible] = useState(false);
  const [showAvailabilityEditor, setShowAvailabilityEditor] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryViewerUri, setGalleryViewerUri] = useState<string | null>(null);
  const [photoCropSource, setPhotoCropSource] = useState<CropSource | null>(null);
  const [photoCropVisible, setPhotoCropVisible] = useState(false);
  const [socialLinks, setSocialLinks] = useState<ProfileSocialLinks>({});
  const [socialSheetVisible, setSocialSheetVisible] = useState(false);
  const [pendingSocialPlatform, setPendingSocialPlatform] =
    useState<SocialPlatform | null>(null);
  const [socialEditUrl, setSocialEditUrl] = useState('');

  const refreshGallery = useCallback(() => {
    loadProfileGallery().then(setGalleryImages);
  }, []);

  const refreshSocial = useCallback(() => {
    loadProfileSocial().then(setSocialLinks);
  }, []);

  const socialItems = useMemo(
    () => socialLinksToItems(socialLinks),
    [socialLinks],
  );

  const canAddSocialLink = useMemo(() => {
    const used = new Set(
      Object.keys(socialLinks) as ProfileSocialPlatformId[],
    );
    return SOCIAL_PLATFORMS.some(p => !used.has(p.id as ProfileSocialPlatformId));
  }, [socialLinks]);

  useFocusEffect(
    useCallback(() => {
      refreshGallery();
      refreshSocial();
    }, [refreshGallery, refreshSocial]),
  );

  const persistSocial = useCallback(async (next: ProfileSocialLinks) => {
    setSocialLinks(next);
    await saveProfileSocial(next);
  }, []);

  const handleAddSocialLink = useCallback(() => {
    const used = new Set(
      Object.keys(socialLinks) as ProfileSocialPlatformId[],
    );
    const available = SOCIAL_PLATFORMS.filter(
      p => !used.has(p.id as ProfileSocialPlatformId),
    );
    if (available.length === 0) {
      showAlert({
        title: 'All platforms added',
        message: 'Remove a link to add a different platform.',
      });
      return;
    }
    showChoice({
      title: 'Add social link',
      message: 'Choose a platform',
      options: available.map(platform => ({
        text: `${platform.icon} ${platform.label}`,
        onPress: () => {
          setPendingSocialPlatform(platform);
          setSocialEditUrl('');
          setSocialSheetVisible(true);
        },
      })),
    });
  }, [socialLinks, showAlert, showChoice]);

  const handleEditSocialLink = useCallback(
    (platformId: string) => {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
      const url = socialLinks[platformId as ProfileSocialPlatformId];
      if (!platform || !url) {
        return;
      }
      setPendingSocialPlatform(platform);
      setSocialEditUrl(url);
      setSocialSheetVisible(true);
    },
    [socialLinks],
  );

  const handleRemoveSocialLink = useCallback(
    async (platformId: string) => {
      const next = {...socialLinks};
      delete next[platformId as ProfileSocialPlatformId];
      await persistSocial(next);
    },
    [socialLinks, persistSocial],
  );

  const handleSocialLinkConfirm = useCallback(
    async (url: string) => {
      if (!pendingSocialPlatform) {
        return;
      }
      const id = pendingSocialPlatform.id as ProfileSocialPlatformId;
      await persistSocial({...socialLinks, [id]: url});
      setPendingSocialPlatform(null);
      setSocialEditUrl('');
    },
    [pendingSocialPlatform, socialLinks, persistSocial],
  );

  const openGallery = useCallback(() => {
    navigation.navigate('Gallery', {
      title: 'My Gallery',
      persistProfile: true,
      canEdit: true,
    });
  }, [navigation]);

  const roleLine =
    categories.length > 0
      ? categories.slice(0, 3).join(' · ')
      : 'Add the company you offer';

  const availabilityLabel =
    days.length > 0 ? `${days.length} days / week` : 'Set availability';

  const readinessChecks = useMemo(
    () => [
      {label: 'Bio added', done: about.trim().length > 0},
      {label: 'Categories added', done: categories.length > 0},
      {label: aadhaarVerified ? 'Aadhaar verified' : 'Aadhaar pending', done: aadhaarVerified},
      {label: 'Profession added', done: professions.length > 0},
      {label: 'Availability added', done: days.length > 0},
      {label: 'Location added', done: location.trim().length > 0},
    ],
    [about, categories.length, aadhaarVerified, professions.length, days.length, location],
  );

  const isAvailable = days.length > 0;
  const daysLabel = days.map(d => DAY_FULL[d] ?? d).join(', ');
  const requesterSummary =
    categories.length > 0
      ? `${profileName} is available for ${categories.slice(0, 3).join(', ')} requests around ${location}.`
      : `${profileName} is building their companion profile in ${location}.`;

  const openSettings = () => navigation.navigate('Settings');
  const openAboutEditor = () => {
    setAboutDraft(about);
    setAboutEditVisible(true);
  };
  const previewAsRequester = () => {
    navigation.navigate('MateProfile', {userId: 'u1'});
  };
  const goVerification = () =>
    navigation.navigate('SettingsDetail', {itemId: 'verification'});

  const strengthDone = useMemo(() => {
    const flags = [
      about.trim().length > 0,
      professions.length > 0,
      aadhaarVerified,
      categories.length > 0,
      days.length > 0,
      location.trim().length > 0,
    ];
    return flags.filter(Boolean).length;
  }, [about, professions.length, aadhaarVerified, categories.length, days.length, location]);

  const strengthPercent = Math.round((strengthDone / 6) * 100);

  const readinessStatus =
    strengthPercent >= 80
      ? 'Strong profile'
      : strengthPercent >= 50
        ? 'Looking good'
        : 'Needs attention';

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATEGORY_OPTIONS.filter(
      c => !categories.includes(c) && (!q || c.toLowerCase().includes(q)),
    );
  }, [categories, search]);

  const filteredProfessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PROFESSION_OPTIONS.filter(
      p => !professions.includes(p) && (!q || p.toLowerCase().includes(q)),
    );
  }, [professions, search]);

  const filteredVehicles = useMemo(
    () => VEHICLE_OPTIONS.filter(v => !vehicles.includes(v.id)),
    [vehicles],
  );

  const openSheet = (type: Exclude<SheetType, null>) => {
    setSheet(type);
    setSearch('');
    setPendingSheetItems([]);
  };

  const openTimePicker = () => {
    setTimePickerTarget('start');
  };

  const formatTime = (value: Date) =>
    value.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});

  const handleProfileSheetClose = useCallback(() => {
    setSheet(null);
    setSearch('');
    setPendingSheetItems([]);
  }, []);

  const closeProfileSheet = () => {
    profileSheetRef.current?.dismiss();
  };

  const sheetTitle =
    sheet === 'category'
      ? 'Add category'
      : sheet === 'profession'
        ? 'Add profession'
        : sheet === 'vehicle'
          ? 'Add vehicle'
          : '';

  const sheetSubtitle =
    sheet === 'vehicle'
      ? 'Select one or more vehicles'
      : 'Search and tap items to select';

  const openRateEditor = () => {
    setEditRate(hourlyRate);
    setRateModalVisible(true);
  };

  const saveRate = () => {
    const cleanRate = editRate.trim();
    if (cleanRate) {
      setHourlyRate(cleanRate);
    }
    setRateModalVisible(false);
  };

  const pickAndSaveProfileImage = async () => {
    const picked = await pickProfilePhotoFromLibrary();
    if (picked) {
      setPhotoCropSource(picked);
      setPhotoCropVisible(true);
    }
  };

  const openLocationEditor = () => {
    setLocationInput(location);
    setLocationModalVisible(true);
  };

  const togglePendingItem = (value: string) => {
    setPendingSheetItems(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value],
    );
  };

  const applyPendingSelections = () => {
    if (pendingSheetItems.length === 0 || !sheet) {
      return;
    }
    const type = sheet;
    const items = pendingSheetItems;
    profileSheetRef.current?.dismiss(() => {
      if (type === 'category') {
        setCategories(prev => [...prev, ...items]);
      } else if (type === 'profession') {
        setProfessions(prev => [...prev, ...items]);
      } else {
        setVehicles(prev => [...prev, ...items]);
      }
      handleProfileSheetClose();
    });
  };

  const removeFromList = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter(prev => prev.filter(item => item !== value));
  };

  const handleAadhaarVerify = () => {
    const cleanName = aadhaarName.trim();
    const cleanNumber = aadhaarNumber.replace(/\s+/g, '');
    if (!cleanName || !/^\d{12}$/.test(cleanNumber)) {
      return;
    }
    const masked = `XXXX XXXX ${cleanNumber.slice(-4)}`;
    setAadhaarMasked(masked);
    setAadhaarVerified(true);
    setAadhaarModalVisible(false);
  };

  const saveAbout = () => {
    const cleaned = aboutDraft.trim();
    setAbout(cleaned);
    setAboutDraft(cleaned);
    setAboutSaved(true);
    setAboutEditVisible(false);
  };

  const scrollBottomPad = embeddedTab
    ? insets.bottom + MAIN_TAB_BAR_RESERVE + 24
    : insets.bottom + 32;

  return (
    <View style={styles.screen}>
      {!embeddedTab ? (
        <View style={[styles.topHeader, {paddingTop: insets.top + 8}]}>
          <BackButton onPress={() => goBackSafe(navigation)} />
          <View style={styles.topHeaderCopy}>
            <Text style={styles.topHeaderTitle}>View Profile</Text>
            <Text style={styles.topHeaderSub}>Your public companion passport</Text>
          </View>
          <View style={styles.headerSideSpacer} />
        </View>
      ) : (
        <View style={[styles.embeddedHeader, {paddingTop: insets.top + 8}]}>
          <View style={styles.embeddedHeaderCopy}>
            <Text style={styles.topHeaderTitle}>My Passport</Text>
            <Text style={styles.topHeaderSub}>How requesters see you</Text>
          </View>
          <Pressable
            onPress={openSettings}
            hitSlop={8}
            style={({pressed}) => [styles.headerIconBtn, pressed && styles.pressed]}>
            <StrokeIcon name="settings" color={colors.brand} size={18} />
          </Pressable>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: tokens.spacing.lg,
          paddingTop: embeddedTab ? tokens.spacing.sm : tokens.spacing.md,
          paddingBottom: scrollBottomPad,
        }}>
        {/* Tenure Passport */}
        <View style={styles.passport}>
          <View style={styles.passportTopRow}>
            <Text style={styles.passportLabel}>TENURE PASSPORT</Text>
            <View style={styles.passportStatusPill}>
              <View style={styles.passportStatusDot} />
              <Text style={styles.passportStatusText}>
                {isAvailable ? 'Ready for requests' : 'Profile active'}
              </Text>
            </View>
          </View>
          <View style={styles.passportIdentity}>
            <Pressable
              onPress={pickAndSaveProfileImage}
              style={({pressed}) => [
                styles.passportAvatarWrap,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Change profile photo"
              accessibilityRole="button">
              <Image source={{uri: profileImage}} style={styles.passportAvatar} />
              <View style={styles.avatarEditBadge}>
                <StrokeIcon name="edit" color="#FFFFFF" size={11} strokeWidth={2.2} />
              </View>
            </Pressable>
            <View style={styles.passportInfo}>
              <View style={styles.passportNameRow}>
                <Text style={styles.passportName} numberOfLines={1}>
                  {profileName}
                </Text>
                {aadhaarVerified ? (
                  <View style={styles.verifiedPill}>
                    <StrokeIcon name="check" color="#FFF" size={10} strokeWidth={2.4} />
                    <Text style={styles.verifiedPillText}>Verified</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.passportLocRow}>
                <StrokeIcon name="pin" color={colors.textMuted} size={13} />
                <Text style={styles.passportLocation}>{location}</Text>
              </View>
              <Text style={styles.passportMeta}>Tenure ID · {TENURE_ID}</Text>
            </View>
          </View>
          <Text style={styles.passportRole}>{roleLine}</Text>
          <View style={styles.passportDivider} />
          <View style={styles.passportStats}>
            <Pressable
              onPress={openRateEditor}
              style={({pressed}) => [
                styles.passportStat,
                styles.passportStatEditable,
                pressed && styles.pressed,
              ]}
              accessibilityLabel="Edit hourly rate"
              accessibilityRole="button">
              <Text style={styles.passportStatVal}>₹{hourlyRate}</Text>
              <Text style={styles.passportStatKey}>per hour</Text>
              <Text style={styles.passportStatEdit}>Edit rate</Text>
            </Pressable>
            <View style={styles.passportStatSep} />
            <View style={styles.passportStat}>
              <View style={styles.ratingInline}>
                <StrokeIcon name="star" color={colors.rating} size={14} />
                <Text style={styles.passportStatVal}>{RATING_VALUE}</Text>
              </View>
              <Text style={styles.passportStatKey}>{REVIEW_COUNT} reviews</Text>
            </View>
            <View style={styles.passportStatSep} />
            <View style={styles.passportStat}>
              <Text
                style={[
                  styles.passportStatVal,
                  {color: isAvailable ? colors.success : colors.textMuted},
                ]}>
                {isAvailable ? 'Active' : 'Paused'}
              </Text>
              <Text style={styles.passportStatKey}>availability</Text>
            </View>
          </View>
        </View>

        {strengthPercent < 100 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile readiness</Text>
            <View style={styles.readinessRow}>
              <View style={styles.readinessRing}>
                <Text style={styles.readinessPct}>{strengthPercent}%</Text>
              </View>
              <View style={styles.readinessCopy}>
                <Text style={styles.readinessStatus}>{readinessStatus}</Text>
                <Text style={styles.readinessHint}>
                  Profile {strengthPercent}% ready — complete the items below.
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: `${strengthPercent}%`}]} />
            </View>
            <View style={styles.chipWrap}>
              {readinessChecks.map(item => (
                <View
                  key={item.label}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: item.done
                        ? hexA(colors.success, 0.1)
                        : hexA(colors.warning, 0.12),
                    },
                  ]}>
                  <View
                    style={[
                      styles.statusChipDot,
                      {backgroundColor: item.done ? colors.success : colors.warning},
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusChipText,
                      {color: item.done ? colors.success : colors.warning},
                    ]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Requester preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How requesters see you</Text>
          <Text style={styles.previewBody}>{requesterSummary}</Text>
          <View style={styles.previewMetaRow}>
            <Text style={styles.previewMetaItem}>₹{hourlyRate}/hr</Text>
            <View style={styles.previewDot} />
            <Text style={styles.previewMetaItem}>
              {isAvailable ? 'Available' : 'Paused'}
            </Text>
            <View style={styles.previewDot} />
            <Text style={styles.previewMetaItem}>
              {aadhaarVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
          <Pressable
            onPress={previewAsRequester}
            style={({pressed}) => [styles.outlineBtn, pressed && styles.pressed]}>
            <StrokeIcon name="eye" color={colors.brand} size={16} />
            <Text style={styles.outlineBtnText}>Preview as requester</Text>
          </Pressable>
        </View>

        {/* Companion identity */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>Companion Identity</Text>
            <Pressable onPress={() => openSheet('category')} hitSlop={8}>
              <Text style={styles.sectionLink}>Add</Text>
            </Pressable>
          </View>
          <Text style={styles.fieldLabel}>I am good for</Text>
          {categories.length > 0 ? (
            <View style={styles.chipWrap}>
              {categories.map(item => (
                <Pressable
                  key={item}
                  onPress={() => removeFromList(item, setCategories)}
                  style={({pressed}) => [styles.serviceChip, pressed && styles.pressed]}>
                  <Text style={styles.serviceChipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyLine}>Add categories you offer as a mate.</Text>
          )}
          <Text style={[styles.fieldLabel, styles.fieldLabelGap]}>Services on profile</Text>
          <Text style={styles.mutedLine}>
            Tap a chip to remove · use Add to open the category picker
          </Text>
        </View>

        {/* Time passport */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>Time Passport</Text>
            <Pressable
              onPress={() => setShowAvailabilityEditor(v => !v)}
              hitSlop={8}>
              <Text style={styles.sectionLink}>
                {showAvailabilityEditor ? 'Done' : 'Manage'}
              </Text>
            </Pressable>
          </View>
          {isAvailable ? (
            <View style={styles.kvBlock}>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Available days</Text>
                <Text style={styles.kvVal}>{daysLabel}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Usual time</Text>
                <Text style={styles.kvVal}>
                  {formatTime(startTime)} – {formatTime(endTime)}
                </Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Weekly load</Text>
                <Text style={styles.kvVal}>{availabilityLabel}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyLine}>
              Set your weekly availability so requesters know when to reach you.
            </Text>
          )}
          {showAvailabilityEditor ? (
            <View style={styles.editorBlock}>
              <View style={styles.dayRow}>
                {DAYS.map(day => {
                  const active = days.includes(day.id);
                  return (
                    <Pressable
                      key={day.id}
                      style={({pressed}) => [
                        styles.dayChip,
                        active && styles.dayChipActive,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        setDays(prev =>
                          prev.includes(day.id)
                            ? prev.filter(d => d !== day.id)
                            : [...prev, day.id],
                        )
                      }>
                      <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                        {day.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                style={({pressed}) => [styles.timeCard, pressed && styles.pressed]}
                onPress={openTimePicker}>
                <Text style={styles.timeCardTitle}>
                  {formatTime(startTime)} – {formatTime(endTime)}
                </Text>
                <Text style={styles.timeCardSub}>Tap to adjust hours</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Pressable onPress={openLocationEditor} hitSlop={8}>
              <Text style={styles.sectionLink}>Edit</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={openLocationEditor}
            style={({pressed}) => [styles.locationRow, pressed && styles.pressed]}>
            <StrokeIcon name="pin" color={colors.brand} size={18} />
            <Text style={styles.locationRowText}>{location}</Text>
          </Pressable>
        </View>

        {/* Trust wallet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trust Wallet</Text>
          <View style={styles.trustList}>
            <View style={styles.trustRow}>
              <Text style={styles.trustRowLabel}>Phone verified</Text>
              <Text style={[styles.trustRowBadge, {color: colors.success}]}>Verified</Text>
            </View>
            <View style={[styles.trustRow, styles.trustRowBorder]}>
              <Text style={styles.trustRowLabel}>Email verified</Text>
              <Text style={[styles.trustRowBadge, {color: colors.success}]}>Verified</Text>
            </View>
            <View style={[styles.trustRow, styles.trustRowBorder]}>
              <Text style={styles.trustRowLabel}>Aadhaar verification</Text>
              <Text
                style={[
                  styles.trustRowBadge,
                  {color: aadhaarVerified ? colors.success : colors.warning},
                ]}>
                {aadhaarVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View style={[styles.trustRow, styles.trustRowBorder]}>
              <Text style={styles.trustRowLabel}>Profile photo</Text>
              <Text style={[styles.trustRowBadge, {color: colors.success}]}>Verified</Text>
            </View>
            <View style={[styles.trustRow, styles.trustRowBorder]}>
              <Text style={styles.trustRowLabel}>Rating</Text>
              <Text style={styles.trustRowBadge}>{RATING_VALUE}</Text>
            </View>
            <View style={styles.trustRow}>
              <Text style={styles.trustRowLabel}>Reviews</Text>
              <Text style={styles.trustRowBadge}>{REVIEW_COUNT}</Text>
            </View>
          </View>
          {aadhaarVerified ? (
            <Text style={styles.aadhaarLinked}>Aadhaar · {aadhaarMasked}</Text>
          ) : null}
          {!aadhaarVerified ? (
            <Pressable
              onPress={() => setAadhaarModalVisible(true)}
              style={({pressed}) => [styles.primaryBtn, pressed && styles.pressed]}>
              <Text style={styles.primaryBtnText}>Complete verification</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setAadhaarModalVisible(true)}
              style={({pressed}) => [styles.outlineBtn, pressed && styles.pressed]}>
              <Text style={styles.outlineBtnText}>Update Aadhaar details</Text>
            </Pressable>
          )}
        </View>

        {/* Companion note */}
        <View style={styles.section}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionTitle}>My Companion Note</Text>
            <Pressable onPress={openAboutEditor} hitSlop={8}>
              <Text style={styles.sectionLink}>Edit note</Text>
            </Pressable>
          </View>
          {about.trim().length > 0 ? (
            <Text style={styles.noteText}>{about}</Text>
          ) : (
            <Text style={styles.notePlaceholder}>
              Add a short note so requesters understand what kind of company you enjoy.
            </Text>
          )}
        </View>

        <ProfileGallerySection
          images={galleryImages}
          onAddPhotos={openGallery}
          onManage={openGallery}
          onOpenPhoto={uri => setGalleryViewerUri(uri)}
        />

        <ProfileSocialSection
          items={socialItems}
          canAddMore={canAddSocialLink}
          onAddLink={handleAddSocialLink}
          onEditLink={handleEditSocialLink}
          onRemoveLink={handleRemoveSocialLink}
        />

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailGrid}>
            <Pressable
              onPress={() => openSheet('profession')}
              style={({pressed}) => [styles.detailCard, pressed && styles.pressed]}>
              <Text style={styles.detailCardTitle}>Profession</Text>
              <Text style={styles.detailCardVal} numberOfLines={2}>
                {professions.length > 0 ? professions.join(', ') : 'Not added'}
              </Text>
              <Text style={styles.detailCardAction}>
                {professions.length > 0 ? 'Edit' : 'Add'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => openSheet('vehicle')}
              style={({pressed}) => [styles.detailCard, pressed && styles.pressed]}>
              <Text style={styles.detailCardTitle}>Vehicle</Text>
              <Text style={styles.detailCardVal} numberOfLines={2}>
                {vehicles.length > 0
                  ? vehicles
                      .map(id => VEHICLE_OPTIONS.find(v => v.id === id)?.label ?? id)
                      .join(', ')
                  : 'Not added'}
              </Text>
              <Text style={styles.detailCardAction}>
                {vehicles.length > 0 ? 'Edit' : 'Add'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews Received</Text>
          <View style={styles.reviewRow}>
            <StrokeIcon name="star" color={colors.rating} size={20} />
            <Text style={styles.reviewScore}>{RATING_VALUE}</Text>
            <Text style={styles.reviewMeta}>· {REVIEW_COUNT} reviews</Text>
          </View>
          <Text style={styles.mutedLine}>
            Reviews appear after completed requests with mates.
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineRail}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineBody}>
                <Text style={styles.timelineLabel}>Joined Tenure</Text>
                <Text style={styles.timelineVal}>Companion account active</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineRail}>
                <View style={styles.timelineDot} />
              </View>
              <View style={styles.timelineBody}>
                <Text style={styles.timelineLabel}>Profile updates</Text>
                <Text style={styles.timelineVal}>
                  {strengthPercent >= 100
                    ? 'Profile complete'
                    : `${strengthPercent}% complete`}{' '}
                  · {categories.length} categories
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={({pressed}) => [styles.logoutBtn, pressed && styles.pressed]}
          onPress={() => resetToLogin(navigation)}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      <ProfilePhotoCropModal
        visible={photoCropVisible}
        source={photoCropSource}
        onClose={() => {
          setPhotoCropVisible(false);
          setPhotoCropSource(null);
        }}
        onComplete={uri => setProfileImage(uri)}
      />

      <SocialLinkSheet
        visible={socialSheetVisible}
        platform={pendingSocialPlatform}
        initialUrl={socialEditUrl}
        onClose={() => {
          setSocialSheetVisible(false);
          setPendingSocialPlatform(null);
          setSocialEditUrl('');
        }}
        onConfirm={handleSocialLinkConfirm}
      />

      <Modal visible={galleryViewerUri != null} transparent animationType="fade">
        <Pressable
          style={[styles.galleryViewerScrim, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setGalleryViewerUri(null)}>
          {galleryViewerUri ? (
            <Image
              source={{uri: galleryViewerUri}}
              style={styles.galleryViewerImage}
              resizeMode="contain"
            />
          ) : null}
          <Pressable
            style={styles.galleryViewerClose}
            onPress={() => setGalleryViewerUri(null)}>
            <Text style={styles.galleryViewerCloseText}>Close</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={locationModalVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setLocationModalVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.dialogTitle}>Update location</Text>
            <TextInput
              value={locationInput}
              onChangeText={setLocationInput}
              placeholder="City, State"
              placeholderTextColor={colors.textHint}
              style={styles.dialogInput}
            />
            <Pressable
              style={({pressed}) => [styles.dialogPrimary, pressed && styles.pressed]}
              onPress={() => {
                const cleaned = locationInput.trim();
                if (cleaned) {
                  setLocation(cleaned);
                }
                setLocationModalVisible(false);
              }}>
              <Text style={styles.dialogPrimaryText}>Save</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={rateModalVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setRateModalVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.dialogTitle}>Hourly rate</Text>
            <Text style={styles.dialogHint}>
              Set what requesters see per hour on your passport.
            </Text>
            <TextInput
              value={editRate}
              onChangeText={setEditRate}
              placeholder="e.g. 45"
              placeholderTextColor={colors.textHint}
              keyboardType="number-pad"
              style={styles.dialogInput}
            />
            <Pressable
              style={({pressed}) => [styles.dialogPrimary, pressed && styles.pressed]}
              onPress={saveRate}>
              <Text style={styles.dialogPrimaryText}>Save rate</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={aadhaarModalVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setAadhaarModalVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.dialogTitle}>Aadhaar identity verification</Text>
            <Text style={styles.dialogHint}>
              Enter details exactly as in your Aadhaar card.
            </Text>
            <TextInput
              value={aadhaarName}
              onChangeText={setAadhaarName}
              placeholder="Name as per Aadhaar"
              placeholderTextColor={colors.textHint}
              style={styles.dialogInput}
            />
            <TextInput
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              placeholder="12-digit Aadhaar number"
              placeholderTextColor={colors.textHint}
              keyboardType="number-pad"
              maxLength={12}
              style={styles.dialogInput}
            />
            <Pressable
              style={({pressed}) => [styles.dialogPrimary, pressed && styles.pressed]}
              onPress={handleAadhaarVerify}>
              <Text style={styles.dialogPrimaryText}>Verify now</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={aboutEditVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setAboutEditVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.dialogTitle}>Companion note</Text>
            <Text style={styles.dialogHint}>
              A short note requesters read before booking you.
            </Text>
            <TextInput
              value={aboutDraft}
              onChangeText={value => {
                setAboutDraft(value);
                setAboutSaved(false);
              }}
              placeholder="Tell requesters what kind of company you enjoy."
              placeholderTextColor={colors.textHint}
              multiline
              numberOfLines={6}
              style={[styles.dialogInput, styles.aboutDialogInput]}
              textAlignVertical="top"
            />
            <Pressable
              style={({pressed}) => [
                styles.dialogPrimary,
                aboutDraft.trim() === about && styles.saveBtnDisabled,
                pressed && aboutDraft.trim() !== about ? styles.pressed : null,
              ]}
              disabled={aboutDraft.trim() === about}
              onPress={saveAbout}>
              <Text style={styles.dialogPrimaryText}>
                {aboutSaved ? 'Saved' : 'Save note'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <DraggableBottomDrawer
        ref={profileSheetRef}
        visible={sheet !== null}
        onClose={handleProfileSheetClose}
        maxHeightRatio={sheet === 'vehicle' ? 0.55 : 0.86}
        header={
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={styles.sheetTitle}>{sheetTitle}</Text>
              {sheetSubtitle ? (
                <Text style={styles.sheetSubtitle}>{sheetSubtitle}</Text>
              ) : null}
            </View>
            <Pressable
              style={({pressed}) => [
                styles.sheetCloseBtn,
                pressed && styles.pressed,
              ]}
              onPress={closeProfileSheet}
              hitSlop={10}
              accessibilityLabel="Close">
              <Text style={styles.sheetClose}>×</Text>
            </Pressable>
          </View>
        }
        footer={
          <Pressable
            style={({pressed}) => [
              styles.dialogPrimary,
              styles.sheetActionBtn,
              pendingSheetItems.length === 0 && styles.saveBtnDisabled,
              pressed && pendingSheetItems.length > 0 ? styles.pressed : null,
            ]}
            disabled={pendingSheetItems.length === 0}
            onPress={applyPendingSelections}>
            <Text style={styles.dialogPrimaryText}>
              Add selected ({pendingSheetItems.length})
            </Text>
          </Pressable>
        }>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.sheetScrollContent}>
          {sheet !== 'vehicle' ? (
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={
                sheet === 'category' ? 'Search category' : 'Search profession'
              }
              placeholderTextColor={colors.textHint}
              style={styles.dialogInput}
            />
          ) : null}

          {sheet === 'category' &&
            filteredCategories.map(item => (
              <Pressable
                key={item}
                style={({pressed}) => [styles.sheetOption, pressed && styles.pressed]}
                onPress={() => togglePendingItem(item)}>
                <Text style={styles.sheetOptionText}>{item}</Text>
                <Text style={styles.sheetOptionMark}>
                  {pendingSheetItems.includes(item) ? '✓' : '+'}
                </Text>
              </Pressable>
            ))}
          {sheet === 'profession' &&
            filteredProfessions.map(item => (
              <Pressable
                key={item}
                style={({pressed}) => [styles.sheetOption, pressed && styles.pressed]}
                onPress={() => togglePendingItem(item)}>
                <Text style={styles.sheetOptionText}>{item}</Text>
                <Text style={styles.sheetOptionMark}>
                  {pendingSheetItems.includes(item) ? '✓' : '+'}
                </Text>
              </Pressable>
            ))}
          {sheet === 'vehicle' &&
            filteredVehicles.map(item => (
              <Pressable
                key={item.id}
                style={({pressed}) => [
                  styles.vehicleOption,
                  pendingSheetItems.includes(item.id) && styles.vehicleOptionActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => togglePendingItem(item.id)}>
                <Text style={styles.sheetOptionText}>
                  {item.icon} {item.label}
                </Text>
                <Text style={styles.sheetOptionMark}>
                  {pendingSheetItems.includes(item.id) ? '✓' : '+'}
                </Text>
              </Pressable>
            ))}
        </ScrollView>
      </DraggableBottomDrawer>

      <NativeDateTimePicker
        visible={timePickerTarget === 'start'}
        mode="time"
        value={startTime}
        title="Available from"
        subtitle="When can mates reach you?"
        onClose={() => {
          if (advanceTimePickerRef.current) {
            advanceTimePickerRef.current = false;
            setTimePickerTarget('end');
            return;
          }
          setTimePickerTarget(null);
        }}
        onConfirm={selected => {
          const normalized = new Date(selected);
          normalized.setSeconds(0, 0);
          setStartTime(normalized);
          advanceTimePickerRef.current = true;
        }}
      />
      <NativeDateTimePicker
        visible={timePickerTarget === 'end'}
        mode="time"
        value={endTime}
        title="Available until"
        subtitle="When does your window end?"
        onClose={() => setTimePickerTarget(null)}
        onConfirm={selected => {
          const normalized = new Date(selected);
          normalized.setSeconds(0, 0);
          setEndTime(normalized);
        }}
      />
    </View>
  );
};

const createStyles = (c: AppColors, t: DesignTokens) =>
  StyleSheet.create({
    screen: {flex: 1, backgroundColor: c.bgElevated},
    pressed: {opacity: 0.78},

    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: t.spacing.lg,
      paddingBottom: t.spacing.md,
      gap: t.spacing.md,
      backgroundColor: c.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    topHeaderCopy: {flex: 1, minWidth: 0},
    topHeaderTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.3,
    },
    topHeaderSub: {
      fontSize: 12.5,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 2,
    },
    headerIconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.borderInput,
    },
    headerSideSpacer: {width: 42, height: 42},
    embeddedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingBottom: t.spacing.md,
      backgroundColor: c.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    embeddedHeaderCopy: {flex: 1, minWidth: 0},

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
    passportStatusPill: {
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
    passportAvatarWrap: {position: 'relative'},
    passportAvatar: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
    },
    avatarEditBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.brand,
      borderWidth: 2,
      borderColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
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
    verifiedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: c.success,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radius.pill,
    },
    verifiedPillText: {fontSize: 10.5, fontWeight: '800', color: '#FFFFFF'},
    passportLocRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5},
    passportLocation: {fontSize: 13.5, fontWeight: '500', color: c.textSecondary},
    passportMeta: {fontSize: 12, fontWeight: '500', color: c.textHint, marginTop: 5},
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
    passportStatEditable: {paddingVertical: 4, borderRadius: t.radius.sm},
    passportStatEdit: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brand,
      marginTop: 4,
    },
    passportStatSep: {width: StyleSheet.hairlineWidth, height: 32, backgroundColor: c.border},
    ratingInline: {flexDirection: 'row', alignItems: 'center', gap: 4},
    passportStatVal: {fontSize: 17, fontWeight: '800', color: c.text, letterSpacing: -0.3},
    passportStatKey: {fontSize: 11.5, fontWeight: '500', color: c.textMuted, marginTop: 3},

    section: {
      backgroundColor: c.card,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.xl,
      marginTop: t.spacing.lg,
      ...t.shadows.soft(c.shadow),
    },
    sectionHeadRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.3,
      marginBottom: t.spacing.sm,
    },
    sectionLink: {fontSize: 13.5, fontWeight: '700', color: c.brand},

    previewBody: {
      fontSize: 14.5,
      fontWeight: '500',
      color: c.textSecondary,
      lineHeight: 21,
    },
    previewMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: t.spacing.md,
    },
    previewMetaItem: {fontSize: 12.5, fontWeight: '700', color: c.text},
    previewDot: {width: 3, height: 3, borderRadius: 2, backgroundColor: c.textHint},
    outlineBtn: {
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
    outlineBtnText: {fontSize: 14, fontWeight: '700', color: c.brand},

    readinessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.lg,
      marginBottom: t.spacing.sm,
    },
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
    readinessPct: {fontSize: 16, fontWeight: '800', color: c.brand},
    readinessCopy: {flex: 1, minWidth: 0},
    readinessStatus: {fontSize: 15, fontWeight: '800', color: c.text},
    readinessHint: {
      fontSize: 12.5,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 3,
      lineHeight: 18,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.chip,
      overflow: 'hidden',
      marginTop: t.spacing.md,
      marginBottom: t.spacing.lg,
    },
    progressFill: {height: 6, borderRadius: 3, backgroundColor: c.brand},
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: t.radius.pill,
    },
    statusChipDot: {width: 6, height: 6, borderRadius: 3},
    statusChipText: {fontSize: 12, fontWeight: '700'},

    chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    fieldLabel: {
      fontSize: 12.5,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: t.spacing.sm,
      letterSpacing: 0.2,
    },
    fieldLabelGap: {marginTop: t.spacing.lg},
    serviceChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: t.radius.pill,
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    serviceChipText: {fontSize: 13, fontWeight: '600', color: c.text},
    emptyLine: {fontSize: 13.5, fontWeight: '500', color: c.textMuted, lineHeight: 20},
    mutedLine: {
      fontSize: 12.5,
      fontWeight: '500',
      color: c.textHint,
      lineHeight: 18,
    },

    kvBlock: {gap: t.spacing.md},
    kvRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.md,
    },
    kvKey: {fontSize: 13.5, fontWeight: '500', color: c.textMuted},
    kvVal: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      flexShrink: 1,
      textAlign: 'right',
    },
    editorBlock: {marginTop: t.spacing.lg, gap: t.spacing.md},
    dayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: t.spacing.xs,
      marginBottom: t.spacing.lg,
    },
    dayChip: {
      flex: 1,
      maxWidth: 42,
      aspectRatio: 1,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.cardMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    dayChipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    dayLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textMuted,
    },
    dayLabelActive: {color: c.card},

    timeCard: {
      backgroundColor: c.bgElevated,
      borderRadius: t.radius.sm,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    timeCardTitle: {fontSize: 16, fontWeight: '700', color: c.text},
    timeCardSub: {fontSize: 13, fontWeight: '500', color: c.textMuted, marginTop: 4},

    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      backgroundColor: c.bgElevated,
      borderRadius: t.radius.sm,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    locationRowText: {flex: 1, fontSize: 15, fontWeight: '700', color: c.text},

    trustList: {},
    trustRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: t.spacing.md,
    },
    trustRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    trustRowLabel: {fontSize: 14, fontWeight: '600', color: c.text},
    trustRowBadge: {fontSize: 13, fontWeight: '800', color: c.textSecondary},
    aadhaarLinked: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      marginTop: t.spacing.md,
      marginBottom: t.spacing.sm,
    },
    primaryBtn: {
      marginTop: t.spacing.lg,
      height: 48,
      borderRadius: t.radius.sm,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {fontSize: 14.5, fontWeight: '800', color: '#FFFFFF'},

    noteText: {fontSize: 14.5, fontWeight: '500', color: c.text, lineHeight: 22},
    notePlaceholder: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textHint,
      lineHeight: 21,
      fontStyle: 'italic',
    },

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
    detailCardTitle: {
      fontSize: 12.5,
      fontWeight: '700',
      color: c.textMuted,
      letterSpacing: 0.2,
    },
    detailCardVal: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      marginTop: 4,
      lineHeight: 19,
    },
    detailCardAction: {
      fontSize: 12.5,
      fontWeight: '700',
      color: c.brand,
      marginTop: t.spacing.md,
    },

    reviewRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
    reviewScore: {fontSize: 20, fontWeight: '800', color: c.text},
    reviewMeta: {fontSize: 13.5, fontWeight: '600', color: c.textMuted},

    timeline: {},
    timelineItem: {flexDirection: 'row', gap: t.spacing.md},
    timelineRail: {alignItems: 'center', width: 16},
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.brand,
      marginTop: 4,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: c.border,
      marginTop: 4,
      minHeight: 22,
    },
    timelineBody: {flex: 1, paddingBottom: t.spacing.lg},
    timelineLabel: {fontSize: 14, fontWeight: '700', color: c.text},
    timelineVal: {fontSize: 12.5, fontWeight: '500', color: c.textMuted, marginTop: 2},

    logoutBtn: {
      marginTop: t.spacing.xl,
      marginBottom: t.spacing.md,
      paddingVertical: t.spacing.lg,
      borderRadius: t.radius.sm,
      borderWidth: 1.5,
      borderColor: c.danger,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    logoutText: {fontSize: 15, fontWeight: '700', color: c.danger},

    saveBtnDisabled: {opacity: 0.45},
    aboutDialogInput: {minHeight: 140},

    galleryViewerScrim: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: t.spacing.lg,
    },
    galleryViewerImage: {width: '100%', height: '72%'},
    galleryViewerClose: {
      marginTop: t.spacing.xl,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: t.radius.pill,
      backgroundColor: c.brand,
    },
    galleryViewerCloseText: {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},

    overlay: {flex: 1, justifyContent: 'flex-end'},
    dialogCard: {
      alignSelf: 'center',
      width: '90%',
      maxWidth: 420,
      marginBottom: '45%',
      borderRadius: t.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
      padding: t.spacing.xxl,
    },
    dialogTitle: {
      ...t.typography.h3,
      color: c.text,
    },
    dialogHint: {
      marginTop: t.spacing.sm,
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      lineHeight: 18,
    },
    dialogInput: {
      marginTop: t.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: t.radius.sm,
      backgroundColor: c.bg,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.md,
      color: c.text,
      fontSize: 16,
      fontWeight: '500',
    },
    dialogPrimary: {
      marginTop: t.spacing.lg,
      borderRadius: t.radius.sm,
      backgroundColor: c.primary,
      alignItems: 'center',
      paddingVertical: t.spacing.lg,
    },
    dialogPrimaryText: {
      fontSize: 16,
      fontWeight: '700',
      color: c.card,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: t.spacing.md,
    },
    sheetHeaderText: {flex: 1},
    sheetTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.4,
    },
    sheetSubtitle: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textSecondary,
      marginTop: 4,
    },
    sheetCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    sheetClose: {
      fontSize: 20,
      color: c.textSecondary,
      fontWeight: '600',
      lineHeight: 22,
    },
    sheetScrollContent: {
      paddingHorizontal: 0,
      paddingBottom: t.spacing.lg,
      gap: t.spacing.sm,
    },
    sheetOption: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: t.radius.sm,
      backgroundColor: c.bgElevated,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sheetOptionText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    sheetOptionMark: {
      fontSize: 20,
      fontWeight: '700',
      color: c.primary,
    },
    vehicleOption: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: t.radius.sm,
      backgroundColor: c.bgElevated,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: t.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    vehicleOptionActive: {
      borderColor: c.primary,
      backgroundColor: c.chip,
    },
    sheetActionBtn: {marginTop: t.spacing.sm},
  });

export default UserProfileScreenClean;
