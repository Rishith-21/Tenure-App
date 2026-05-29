import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Modal,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import {Dropdown} from 'react-native-element-dropdown';
import DateTimePicker, {DateType, useDefaultStyles} from 'react-native-ui-datepicker';
import RemovableChip from '../components/ui/RemovableChip';
import AppButton from '../components/ui/AppButton';
import {useTheme} from '../context/ThemeContext';
import {setProfileSetupSkipped} from '../utils/profileSetupStorage';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
const GENDERS = ['Man', 'Woman', 'Other'] as const;

const countryData = [
  {label: 'India', value: 'india'},
  {label: 'USA', value: 'usa'},
];
const stateData = [
  {label: 'Karnataka', value: 'karnataka'},
  {label: 'Kerala', value: 'kerala'},
];
const districtData = [
  {label: 'Dakshina Kannada', value: 'dk'},
  {label: 'Udupi', value: 'udupi'},
];
const languageData = [
  {label: 'Kannada', value: 'Kannada'},
  {label: 'Malayalam', value: 'Malayalam'},
  {label: 'Tulu', value: 'Tulu'},
  {label: 'Hindi', value: 'Hindi'},
];

const ProfileSetupScreen = ({navigation}: any) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const defaultDatePickerStyles = useDefaultStyles();
  const datePickerStyles = useMemo(
    () => ({
      ...defaultDatePickerStyles,
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

  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  const [country, setCountry] = useState<string | null>(null);
  const [stateVal, setStateVal] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const maxDobDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const dropdownProps = {
    placeholderStyle: {color: colors.textHint, fontSize: 15} satisfies TextStyle,
    selectedTextStyle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    } satisfies TextStyle,
    itemTextStyle: {color: colors.text, fontSize: 15} satisfies TextStyle,
    activeColor: colors.chip,
    iconStyle: {width: 20, height: 20},
  };

  const goNext = () => navigation.navigate('CategoryPreference');

  const handleContinue = () => {
    setLoading(true);
    setProfileSetupSkipped(false);
    setTimeout(() => {
      setLoading(false);
      goNext();
    }, 600);
  };

  const handleSkip = async () => {
    await setProfileSetupSkipped(true);
    goNext();
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.assets?.[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const addLanguage = (item: {value: string}) => {
    if (!languages.includes(item.value)) {
      setLanguages([...languages, item.value]);
    }
  };

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

  const formatDob = (value: Date) => {
    const day = `${value.getDate()}`.padStart(2, '0');
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDob = (value: string): Date | null => {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      return null;
    }
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    const parsed = new Date(year, month - 1, day);
    parsed.setHours(0, 0, 0, 0);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  };

  const formatDobInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleDobChange = (value: string) => {
    const formatted = formatDobInput(value);
    setDob(formatted);
    if (formatted.length !== 10) {
      return;
    }
    const parsed = parseDob(formatted);
    if (!parsed || parsed > maxDobDate) {
      return;
    }
    setDobDate(parsed);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: colors.bg}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerBrand}>Tenure</Text>
          <Text style={styles.stepLabel}>Step 1 of 2</Text>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.progressSeg, styles.progressActive]} />
          <View style={styles.progressSeg} />
        </View>

        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>
          Optional details help others find you for the right activity — skip
          anytime and finish in Profile.
        </Text>

        <View style={styles.avatarBlock}>
          <Pressable onPress={handlePickImage} style={styles.avatarPress}>
            <Image source={{uri: profileImage}} style={styles.avatar} />
            <View style={styles.cameraFab}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.label}>FULL NAME</Text>
        <TextInput
          placeholder="e.g. Alexander Vance"
          placeholderTextColor={colors.textHint}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>DATE OF BIRTH</Text>
        <View style={styles.dobWrap}>
          <TextInput
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textHint}
            value={dob}
            onChangeText={handleDobChange}
            keyboardType="number-pad"
            maxLength={10}
            style={[styles.input, styles.dobInput]}
          />
          <Pressable style={styles.calendarIconBtn} onPress={() => setDobPickerVisible(true)}>
            <Text style={styles.calendarIcon}>📅</Text>
          </Pressable>
        </View>
        <Text style={styles.dobHint}>Use DD/MM/YYYY or pick from calendar (18+ only).</Text>

        <Text style={styles.label}>GENDER IDENTIFICATION</Text>
        <View style={styles.genderRow}>
          {GENDERS.map(g => {
            const active = selectedGender === g;
            return (
              <Pressable
                key={g}
                onPress={() => setSelectedGender(g)}
                style={[
                  styles.genderChip,
                  active && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}>
                <Text
                  style={[styles.genderText, active && {color: '#FFFFFF'}]}>
                  {g}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.optionalDivider}>
          <View style={styles.optionalLine} />
          <Text style={styles.optionalText}>Location & languages (optional)</Text>
          <View style={styles.optionalLine} />
        </View>

        <View style={styles.row}>
          <Dropdown
            {...dropdownProps}
            style={[styles.dropdown, styles.half]}
            data={countryData}
            labelField="label"
            valueField="value"
            placeholder="Country"
            value={country}
            onChange={item => setCountry(item.value)}
          />
          <Dropdown
            {...dropdownProps}
            style={[styles.dropdown, styles.half]}
            data={stateData}
            labelField="label"
            valueField="value"
            placeholder="State"
            value={stateVal}
            onChange={item => setStateVal(item.value)}
          />
        </View>
        <View style={styles.row}>
          <Dropdown
            {...dropdownProps}
            style={[styles.dropdown, styles.half]}
            data={districtData}
            labelField="label"
            valueField="value"
            placeholder="District"
            value={district}
            onChange={item => setDistrict(item.value)}
          />
          <TextInput
            placeholder="PIN"
            placeholderTextColor={colors.textHint}
            keyboardType="number-pad"
            maxLength={6}
            value={zipCode}
            onChangeText={setZipCode}
            style={[styles.input, styles.half, styles.halfInput]}
          />
        </View>

        <Dropdown
          {...dropdownProps}
          style={styles.dropdown}
          data={languageData}
          labelField="label"
          valueField="value"
          placeholder="Add language"
          value={null}
          onChange={addLanguage}
        />
        {languages.length > 0 ? (
          <View style={styles.chipRow}>
            {languages.map(lang => (
              <RemovableChip
                key={lang}
                label={lang}
                onRemove={() =>
                  setLanguages(languages.filter(l => l !== lang))
                }
              />
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            label="Save & Continue"
            onPress={handleContinue}
            loading={loading}
            pill
          />
          <AppButton
            label="Skip for now — complete in Profile"
            onPress={handleSkip}
            variant="ghost"
            disabled={loading}
          />
        </View>
      </ScrollView>

      <Modal visible={dobPickerVisible} transparent animationType="fade">
        <View style={[styles.overlay, {backgroundColor: colors.sheetScrim}]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDobPickerVisible(false)}
          />
          <View style={styles.datePickerCard}>
            <Text style={styles.dateTitle}>Select date of birth</Text>
            <DateTimePicker
              mode="single"
              date={dobDate ?? undefined}
              maxDate={maxDobDate}
              styles={datePickerStyles}
              onChange={({date}) => {
                const selected = toDate(date);
                if (!selected) {
                  return;
                }
                const normalized = new Date(selected);
                normalized.setHours(0, 0, 0, 0);
                setDobDate(normalized);
                setDob(formatDob(normalized));
              }}
            />
            <AppButton label="Done" onPress={() => setDobPickerVisible(false)} pill />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetupScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    flex: {flex: 1},
    scroll: {paddingHorizontal: 24},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    headerSide: {width: 72},
    headerBrand: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: c.brandDark,
    },
    stepLabel: {
      width: 72,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: '600',
      color: c.textHint,
    },
    progressRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 28,
    },
    progressSeg: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },
    progressActive: {
      backgroundColor: c.brandDark,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: c.brandDark,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: c.textMuted,
      marginBottom: 28,
    },
    avatarBlock: {
      alignItems: 'center',
      marginBottom: 32,
    },
    avatarPress: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: c.border,
    },
    cameraFab: {
      position: 'absolute',
      right: -4,
      bottom: 4,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.brandDark,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: c.bg,
    },
    cameraIcon: {fontSize: 16},
    label: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brandDark,
      letterSpacing: 1.2,
      marginBottom: 10,
    },
    input: {
      backgroundColor: c.bg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      color: c.text,
      marginBottom: 20,
      minHeight: 54,
    },
    dobWrap: {position: 'relative', marginBottom: 20},
    dobInput: {marginBottom: 0, paddingRight: 44},
    calendarIconBtn: {
      position: 'absolute',
      right: 10,
      top: 10,
      width: 34,
      height: 34,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    calendarIcon: {
      fontSize: 18,
      opacity: 0.5,
    },
    dobHint: {
      marginTop: -12,
      marginBottom: 20,
      color: c.textHint,
      fontSize: 12,
      fontWeight: '500',
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    datePickerCard: {
      alignSelf: 'center',
      width: '92%',
      maxWidth: 440,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      padding: 14,
      marginBottom: '10%',
    },
    dateTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },
    genderRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 28,
    },
    genderChip: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      backgroundColor: c.bg,
    },
    genderText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    optionalDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20,
    },
    optionalLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    optionalText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textHint,
    },
    row: {flexDirection: 'row', gap: 10, marginBottom: 10},
    half: {flex: 1},
    halfInput: {marginBottom: 10},
    dropdown: {
      backgroundColor: c.bg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      height: 54,
      marginBottom: 10,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    actions: {
      marginTop: 32,
      gap: 8,
      paddingBottom: 8,
    },
  });
