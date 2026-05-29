import React, {useMemo, useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DateTimePicker, {DateType, useDefaultStyles} from 'react-native-ui-datepicker';
import {launchImageLibrary} from 'react-native-image-picker';
import {goBackSafe} from '../navigation/navigationActions';
import {useTheme} from '../context/ThemeContext';
import {PROFESSION_OPTIONS, VEHICLE_OPTIONS} from '../constants/profileOptions';
import {resetToLogin} from '../utils/authNavigation';

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

const DAYS = [
  {id: 'MON', label: 'M'},
  {id: 'TUE', label: 'T'},
  {id: 'WED', label: 'W'},
  {id: 'THU', label: 'T'},
  {id: 'FRI', label: 'F'},
  {id: 'SAT', label: 'S'},
  {id: 'SUN', label: 'S'},
];
const THEME_OPTIONS = [
  {id: 'light', label: 'Light'},
  {id: 'dark', label: 'Dark'},
  {id: 'system', label: 'System'},
] as const;

const UserProfileScreenClean = ({navigation, route}: any) => {
  const {colors, preference, setPreference, mode} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const defaultDatePickerStyles = useDefaultStyles();
  const datePickerStyles = useMemo(
    () => ({
      ...defaultDatePickerStyles,
      header: {
        ...(defaultDatePickerStyles.header ?? {}),
        backgroundColor: colors.card,
      },
      time_label: {
        ...(defaultDatePickerStyles.time_label ?? {}),
        color: colors.text,
        fontWeight: '700',
      },
      time_selected_indicator: {
        ...(defaultDatePickerStyles.time_selected_indicator ?? {}),
        backgroundColor: colors.chip,
        borderColor: colors.primary,
      },
      selected: {
        ...(defaultDatePickerStyles.selected ?? {}),
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      selected_label: {
        ...(defaultDatePickerStyles.selected_label ?? {}),
        color: '#FFFFFF',
      },
      today: {
        ...(defaultDatePickerStyles.today ?? {}),
        borderColor: colors.primary,
      },
      today_label: {
        ...(defaultDatePickerStyles.today_label ?? {}),
        color: colors.text,
      },
    }),
    [defaultDatePickerStyles, colors],
  );
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
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [sheet, setSheet] = useState<SheetType>(null);
  const [search, setSearch] = useState('');
  const [pendingSheetItems, setPendingSheetItems] = useState<string[]>([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationInput, setLocationInput] = useState(location);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState(profileName);
  const [editImage, setEditImage] = useState(profileImage);
  const [editRate, setEditRate] = useState(hourlyRate);
  const [aadhaarModalVisible, setAadhaarModalVisible] = useState(false);
  const [aadhaarName, setAadhaarName] = useState(profileName);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarMasked, setAadhaarMasked] = useState('');

  const text = {
    hTitle: styles.hTitle,
    hSection: styles.hSection,
    body: styles.body,
    bodyStrong: styles.bodyStrong,
    caption: styles.caption,
    chip: styles.chipText,
    action: styles.actionText,
  };

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
    setTimePickerVisible(true);
  };

  const formatTime = (value: Date) =>
    value.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});

  const toDate = (value: DateType): Date | null => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      const dayjsDate = (value as {toDate: () => Date}).toDate();
      if (dayjsDate instanceof Date && !Number.isNaN(dayjsDate.getTime())) {
        return dayjsDate;
      }
      return null;
    }
    const castDate = new Date(value as string | number);
    if (Number.isNaN(castDate.getTime())) {
      return null;
    }
    return castDate;
  };

  const closeSheet = () => {
    setSheet(null);
    setSearch('');
    setPendingSheetItems([]);
  };

  const openEditProfile = () => {
    setEditName(profileName);
    setEditImage(profileImage);
    setEditRate(hourlyRate);
    setEditProfileVisible(true);
  };

  const saveProfileCard = () => {
    const cleanName = editName.trim();
    const cleanRate = editRate.trim();
    if (cleanName) {
      setProfileName(cleanName);
    }
    if (cleanRate) {
      setHourlyRate(cleanRate);
    }
    if (editImage.trim()) {
      setProfileImage(editImage.trim());
    }
    setEditProfileVisible(false);
  };

  const pickProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setEditImage(uri);
    }
  };

  const addFromSheet = (value: string) => {
    if (sheet === 'category') {
      setCategories(prev => [...prev, value]);
      return;
    }
    if (sheet === 'profession') {
      setProfessions(prev => [...prev, value]);
      return;
    }
    setVehicles(prev => [...prev, value]);
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
    if (sheet === 'category') {
      setCategories(prev => [...prev, ...pendingSheetItems]);
    } else if (sheet === 'profession') {
      setProfessions(prev => [...prev, ...pendingSheetItems]);
    } else {
      setVehicles(prev => [...prev, ...pendingSheetItems]);
    }
    closeSheet();
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
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top + 6}]}>
      <View style={styles.header}>
        {!embeddedTab ? (
          <Pressable style={styles.headerIconBtn} onPress={() => goBackSafe(navigation)}>
            <Text style={styles.headerIcon}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.headerIconBtn} />
        )}
        <Text style={text.hTitle}>My Profile</Text>
        <Pressable style={styles.headerIconBtn}>
          <Text style={styles.headerIcon}>⚙</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + (embeddedTab ? 78 : 26)}}>
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <Image
              source={{uri: profileImage}}
              style={styles.avatar}
            />
            <View style={styles.tenureBlock}>
              <Pressable style={styles.editPillBtn} onPress={openEditProfile}>
                <Text style={styles.editPillIcon}>✎</Text>
                <Text style={styles.editPillText}>Edit profile</Text>
              </Pressable>
              <Text style={styles.caption}>Tenure ID</Text>
              <Text style={styles.tenureId}>T-9082</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.profileLocation}>◦ Berlin, DE</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>RATE</Text>
              <Text style={styles.statValue}>${hourlyRate}/hr</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statValue}>4.9 (128)</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>GROWTH</Text>
              <Text style={styles.statValue}>↗ +12%</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={text.hSection}>Category</Text>
            <Pressable style={styles.addSquareBtn} onPress={() => openSheet('category')}>
              <Text style={styles.addSquareText}>+</Text>
            </Pressable>
          </View>
          <Text style={text.caption}>Tap a category to edit or remove.</Text>
          <View style={styles.chipRow}>
            {categories.map(item => (
              <View key={item} style={styles.categoryChip}>
                <Text style={text.chip}>{item}</Text>
                <Pressable onPress={() => removeFromList(item, setCategories)}>
                  <Text style={styles.chipClose}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={text.hSection}>Availability</Text>
          <View style={styles.dayRow}>
            {DAYS.map(day => {
              const active = days.includes(day.id);
              return (
                <Pressable
                  key={day.id}
                  style={[styles.dayPill, active && styles.dayPillActive]}
                  onPress={() =>
                    setDays(prev =>
                      prev.includes(day.id)
                        ? prev.filter(d => d !== day.id)
                        : [...prev, day.id],
                    )
                  }>
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.timeRow} onPress={openTimePicker}>
            <Text style={text.bodyStrong}>
              ◷ {formatTime(startTime)} - {formatTime(endTime)}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={text.hSection}>Location</Text>
            <Pressable
              onPress={() => {
                setLocationInput(location);
                setLocationModalVisible(true);
              }}>
              <Text style={text.action}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.locationPill}>
            <Text style={text.bodyStrong}>⌖ {location}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={text.hSection}>Vehicle</Text>
            <Pressable style={styles.addSquareBtn} onPress={() => openSheet('vehicle')}>
              <Text style={styles.addSquareText}>+</Text>
            </Pressable>
          </View>
          <Text style={text.body}>
            {vehicles.length
              ? vehicles
                  .map(id => VEHICLE_OPTIONS.find(v => v.id === id)?.label ?? id)
                  .join(', ')
              : 'No vehicles added yet.'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={text.hSection}>Profession</Text>
            <Pressable style={styles.addSquareBtn} onPress={() => openSheet('profession')}>
              <Text style={styles.addSquareText}>+</Text>
            </Pressable>
          </View>
          <Text style={text.body}>
            {professions.length ? professions.join(', ') : 'No professions added yet.'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={text.hSection}>About</Text>
          <TextInput
            value={aboutDraft}
            onChangeText={value => {
              setAboutDraft(value);
              setAboutSaved(false);
            }}
            placeholder="Tell others about you"
            placeholderTextColor={colors.textHint}
            multiline
            style={styles.aboutInput}
          />
          <Pressable
            style={[
              styles.primaryBtn,
              styles.aboutSaveBtn,
              aboutDraft.trim() === about && styles.actionBtnDisabled,
            ]}
            disabled={aboutDraft.trim() === about}
            onPress={saveAbout}>
            <Text style={styles.primaryBtnText}>
              {aboutSaved ? 'About saved' : 'Save about'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={text.hSection}>Identity verification</Text>
            {aadhaarVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            ) : null}
          </View>
          <Text style={text.body}>
            {aadhaarVerified
              ? `Aadhaar linked: ${aadhaarMasked}`
              : 'Add Aadhaar verification to build trust with requesters.'}
          </Text>
          <Pressable
            style={[styles.primaryBtn, styles.identityActionBtn]}
            onPress={() => setAadhaarModalVisible(true)}>
            <Text style={styles.primaryBtnText}>
              {aadhaarVerified ? 'Update Aadhaar details' : 'Verify with Aadhaar'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={text.hSection}>Appearance</Text>
          <Text style={text.caption}>Theme mode ({mode})</Text>
          <View style={styles.themeOptionRow}>
            {THEME_OPTIONS.map(item => {
              const active = preference === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.themeOptionBtn, active && styles.themeOptionBtnActive]}
                  onPress={() => setPreference(item.id)}>
                  <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={() => resetToLogin(navigation)}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={locationModalVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setLocationModalVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={text.hSection}>Update location</Text>
            <TextInput
              value={locationInput}
              onChangeText={setLocationInput}
              placeholder="City, State"
              placeholderTextColor={colors.textHint}
              style={styles.dialogInput}
            />
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                const cleaned = locationInput.trim();
                if (cleaned) {
                  setLocation(cleaned);
                }
                setLocationModalVisible(false);
              }}>
              <Text style={styles.primaryBtnText}>Save</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={editProfileVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setEditProfileVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={text.hSection}>Edit profile card</Text>
            <View style={styles.imagePickerRow}>
              <Image source={{uri: editImage}} style={styles.editPreviewAvatar} />
              <Pressable style={styles.imagePickerBtn} onPress={pickProfileImage}>
                <Text style={styles.imagePickerBtnText}>Choose photo</Text>
              </Pressable>
            </View>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Full name"
              placeholderTextColor={colors.textHint}
              style={styles.dialogInput}
            />
            <TextInput
              value={editRate}
              onChangeText={setEditRate}
              placeholder="Hourly rate"
              placeholderTextColor={colors.textHint}
              keyboardType="number-pad"
              style={styles.dialogInput}
            />
            <Pressable style={styles.primaryBtn} onPress={saveProfileCard}>
              <Text style={styles.primaryBtnText}>Save profile</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={aadhaarModalVisible} transparent animationType="fade">
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={() => setAadhaarModalVisible(false)}>
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            <Text style={text.hSection}>Aadhaar identity verification</Text>
            <Text style={styles.identityHint}>
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
            <Pressable style={styles.primaryBtn} onPress={handleAadhaarVerify}>
              <Text style={styles.primaryBtnText}>Verify now</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={sheet !== null} transparent animationType="fade" onRequestClose={closeSheet}>
        <Pressable
          style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}
          onPress={closeSheet}>
          <Pressable
            style={[styles.sheet, sheet === 'vehicle' && styles.sheetCompact]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={text.hSection}>
                {sheet === 'category'
                  ? 'Add category'
                  : sheet === 'profession'
                    ? 'Add profession'
                    : 'Add vehicle'}
              </Text>
              <Pressable onPress={closeSheet}>
                <Text style={styles.sheetClose}>×</Text>
              </Pressable>
            </View>

            {sheet !== 'vehicle' ? (
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={sheet === 'category' ? 'Search category' : 'Search profession'}
                placeholderTextColor={colors.textHint}
                style={styles.dialogInput}
              />
            ) : null}

            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {sheet === 'category' &&
                filteredCategories.map(item => (
                  <Pressable
                    key={item}
                    style={styles.sheetOption}
                    onPress={() => togglePendingItem(item)}>
                    <Text style={text.bodyStrong}>{item}</Text>
                    <Text style={styles.plusText}>
                      {pendingSheetItems.includes(item) ? '✓' : '+'}
                    </Text>
                  </Pressable>
                ))}
              {sheet === 'profession' &&
                filteredProfessions.map(item => (
                  <Pressable
                    key={item}
                    style={styles.sheetOption}
                    onPress={() => togglePendingItem(item)}>
                    <Text style={text.bodyStrong}>{item}</Text>
                    <Text style={styles.plusText}>
                      {pendingSheetItems.includes(item) ? '✓' : '+'}
                    </Text>
                  </Pressable>
                ))}
              {sheet === 'vehicle' &&
                filteredVehicles.map(item => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.vehicleOption,
                      pendingSheetItems.includes(item.id) && styles.vehicleOptionActive,
                    ]}
                    onPress={() => togglePendingItem(item.id)}>
                    <Text style={text.bodyStrong}>
                      {item.icon} {item.label}
                    </Text>
                    <Text style={styles.plusText}>
                      {pendingSheetItems.includes(item.id) ? '✓' : '+'}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
            <Pressable
              style={[
                styles.primaryBtn,
                styles.sheetActionBtn,
                pendingSheetItems.length === 0 && styles.actionBtnDisabled,
              ]}
              disabled={pendingSheetItems.length === 0}
              onPress={applyPendingSelections}>
              <Text style={styles.primaryBtnText}>
                Add selected ({pendingSheetItems.length})
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={timePickerVisible} transparent animationType="fade">
        <View style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTimePickerVisible(false)} />
          <View style={styles.timePickerCard}>
            <Text style={text.hSection}>Select time range</Text>
            <Text style={styles.timeFieldLabel}>From</Text>
            <DateTimePicker
              mode="single"
              date={startTime}
              timePicker
              use12Hours
              initialView="time"
              hideHeader
              styles={datePickerStyles}
              onChange={({date}) => {
                const selected = toDate(date);
                if (!selected) {
                  return;
                }
                const normalized = new Date(selected);
                normalized.setSeconds(0, 0);
                setStartTime(normalized);
              }}
            />
            <Text style={styles.timeFieldLabel}>To</Text>
            <DateTimePicker
              mode="single"
              date={endTime}
              timePicker
              use12Hours
              initialView="time"
              hideHeader
              styles={datePickerStyles}
              onChange={({date}) => {
                const selected = toDate(date);
                if (!selected) {
                  return;
                }
                const normalized = new Date(selected);
                normalized.setSeconds(0, 0);
                setEndTime(normalized);
              }}
            />
            <Pressable style={styles.primaryBtn} onPress={() => setTimePickerVisible(false)}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bgElevated, paddingHorizontal: 14},

    hTitle: {fontSize: 32, fontWeight: '700', color: c.brandDark, flex: 1, paddingLeft: 10},
    hSection: {fontSize: 17, fontWeight: '700', color: c.text},
    body: {fontSize: 14, fontWeight: '500', color: c.textSecondary},
    bodyStrong: {fontSize: 15, fontWeight: '600', color: c.text},
    caption: {fontSize: 12, fontWeight: '500', color: c.textHint},
    actionText: {fontSize: 14, fontWeight: '700', color: c.brand},

    header: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
    headerIconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
    },
    headerIcon: {fontSize: 18, color: c.brand},

    profileCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      padding: 12,
      marginBottom: 8,
    },
    profileTopRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10},
    avatar: {width: 64, height: 64, borderRadius: 10, borderWidth: 1, borderColor: c.border},
    tenureBlock: {alignItems: 'flex-end', justifyContent: 'center'},
    editPillBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.primary,
      backgroundColor: c.chip,
    },
    editPillIcon: {
      color: c.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    editPillText: {
      color: c.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    tenureId: {fontSize: 30, fontWeight: '700', color: c.brandDark},
    profileName: {fontSize: 20, fontWeight: '700', color: c.brandDark},
    profileLocation: {fontSize: 16, fontWeight: '500', color: c.textSecondary, marginBottom: 8},
    statsRow: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statCol: {flex: 1},
    statLabel: {fontSize: 10, fontWeight: '700', color: c.textHint, marginBottom: 3},
    statValue: {fontSize: 15, fontWeight: '700', color: c.brandDark},

    sectionCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      padding: 12,
      marginBottom: 8,
    },
    sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},

    addSquareBtn: {
      width: 34,
      height: 34,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgElevated,
    },
    addSquareText: {fontSize: 18, color: c.primary, fontWeight: '700'},

    chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10},
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 6,
    },
    chipText: {fontSize: 13, fontWeight: '700', color: '#FFFFFF'},
    chipClose: {fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: -1},

    dayRow: {flexDirection: 'row', gap: 6, marginTop: 10},
    dayPill: {
      width: 36,
      height: 36,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgElevated,
    },
    dayPillActive: {backgroundColor: c.primary, borderColor: c.primary},
    dayText: {fontSize: 13, fontWeight: '700', color: c.textHint},
    dayTextActive: {color: '#FFFFFF'},
    timeRow: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chevron: {fontSize: 22, color: c.textHint},

    locationPill: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    aboutInput: {
      marginTop: 10,
      minHeight: 84,
      borderWidth: 1,
      borderColor: c.borderInput,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 10,
      textAlignVertical: 'top',
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },

    overlay: {flex: 1, justifyContent: 'flex-end'},
    dialogCard: {
      alignSelf: 'center',
      width: '90%',
      maxWidth: 420,
      marginBottom: '45%',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      padding: 14,
    },
    timePickerCard: {
      alignSelf: 'center',
      width: '90%',
      maxWidth: 420,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      padding: 14,
      marginBottom: '16%',
    },
    timeFieldLabel: {
      marginTop: 10,
      marginBottom: 2,
      fontSize: 13,
      fontWeight: '700',
      color: c.textSecondary,
    },
    dialogInput: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },
    imagePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 10,
    },
    editPreviewAvatar: {
      width: 54,
      height: 54,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
    },
    imagePickerBtn: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    imagePickerBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    primaryBtn: {
      marginTop: 10,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: 'center',
      paddingVertical: 12,
    },
    primaryBtnText: {fontSize: 14, fontWeight: '700', color: '#FFFFFF'},
    aboutSaveBtn: {
      marginTop: 12,
      marginBottom: 2,
    },
    identityActionBtn: {
      marginTop: 12,
      marginBottom: 2,
    },
    identityHint: {
      marginTop: 8,
      color: c.textHint,
      fontSize: 12,
      fontWeight: '500',
    },
    verifiedBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.success,
      backgroundColor: c.chip,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    verifiedBadgeText: {
      color: c.success,
      fontSize: 11,
      fontWeight: '700',
    },
    themeOptionRow: {
      marginTop: 10,
      flexDirection: 'row',
      gap: 8,
    },
    themeOptionBtn: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeOptionBtnActive: {
      borderColor: c.primary,
      backgroundColor: c.chip,
    },
    themeOptionText: {
      color: c.text,
      fontSize: 13,
      fontWeight: '700',
    },
    themeOptionTextActive: {
      color: c.primary,
    },

    sheet: {
      height: '82%',
      backgroundColor: c.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingTop: 10,
    },
    sheetCompact: {
      height: '52%',
    },
    sheetHandle: {
      width: 42,
      height: 5,
      borderRadius: 99,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: 12,
    },
    sheetHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    sheetClose: {fontSize: 28, color: c.textHint, lineHeight: 28},
    sheetList: {marginTop: 10},
    sheetOption: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    vehicleOption: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    vehicleOptionActive: {
      borderColor: c.primary,
      backgroundColor: c.chip,
    },
    plusText: {fontSize: 20, fontWeight: '700', color: c.brand},
    sheetActionBtn: {
      marginTop: 8,
      marginBottom: 12,
    },
    actionBtnDisabled: {
      opacity: 0.45,
    },
    logoutBtn: {
      marginTop: 4,
      marginBottom: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.danger,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    logoutText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.danger,
    },
  });

export default UserProfileScreenClean;
