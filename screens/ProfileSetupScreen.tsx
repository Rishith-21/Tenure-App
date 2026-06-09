import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import {Dropdown} from 'react-native-element-dropdown';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import NativeDateTimePicker from '../components/ui/NativeDateTimePicker';
import {setProfileSetupSkipped} from '../utils/profileSetupStorage';
import {setOnboardingComplete} from '../utils/authStorage';
import {resetToMainTabs} from '../navigation/navigationActions';
import {upsertProfile} from '../utils/api';
import CategoryStepPanel from '../components/onboarding/CategoryStepPanel';
import {
  OnboardingFooter,
  OnboardingHeader,
  OnboardingPercentPill,
} from '../components/onboarding/OnboardingChrome';
import {
  ONBOARDING,
  OnboardingStep,
  onboardingCardShadow,
  onboardingStyles as os,
} from '../theme/onboardingTheme';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';

const GENDERS = [
  {id: 'Man', icon: 'man'},
  {id: 'Woman', icon: 'woman'},
  {id: 'Other', icon: 'other'},
] as const;

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

const STEP_META = {
  1: {title: 'Create Profile', cta: 'Continue'},
  2: {title: 'Location & Language', cta: 'Continue'},
  3: {title: 'Category Selection', cta: 'Enter Tenure'},
} as const;

const parseStepParam = (value: unknown): OnboardingStep | null => {
  if (value === 2 || value === 3) return value;
  return null;
};

const IconCamera = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h3l1.5-2h7L17 7h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
      stroke="#FFF"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13} r={3.5} stroke="#FFF" strokeWidth={1.8} />
  </Svg>
);

const IconPerson = ({color = ONBOARDING.accentIcon}: {color?: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
    <Path
      d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const IconCalendar = ({color = ONBOARDING.accentIcon}: {color?: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={5} width={16} height={15} rx={2.5} stroke={color} strokeWidth={1.8} />
    <Path d="M4 10h16M9 3v3M15 3v3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const IconGlobe = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={ONBOARDING.accentIcon} strokeWidth={1.6} />
    <Path
      d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"
      stroke={ONBOARDING.accentIcon}
      strokeWidth={1.4}
    />
  </Svg>
);

const IconMap = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"
      stroke={ONBOARDING.accentIcon}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path d="M9 4v14M15 6v14" stroke={ONBOARDING.accentIcon} strokeWidth={1.6} />
  </Svg>
);

const IconBuilding = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={3} width={14} height={18} rx={1.5} stroke={ONBOARDING.accentIcon} strokeWidth={1.6} />
    <Path
      d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"
      stroke={ONBOARDING.accentIcon}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </Svg>
);

const IconMail = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={6} width={18} height={13} rx={2} stroke={ONBOARDING.accentIcon} strokeWidth={1.6} />
    <Path d="M3 8l9 6 9-6" stroke={ONBOARDING.accentIcon} strokeWidth={1.6} strokeLinejoin="round" />
  </Svg>
);

const IconTranslate = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 8h8M9 4v4M6 16h3l5-8"
      stroke={ONBOARDING.accentIcon}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 16h5M16.5 13v6" stroke={ONBOARDING.accentIcon} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);

const IconLocation = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
      stroke={ONBOARDING.accentIcon}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={11} r={2.2} stroke={ONBOARDING.accentIcon} strokeWidth={1.8} />
  </Svg>
);

const IconSparkle = ({color = ONBOARDING.orange}: {color?: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3l1.4 4.3H18l-3.5 2.5 1.4 4.3L12 12l-4 2.1 1.4-4.3L6 7.3h4.6L12 3z"
      fill={color}
    />
  </Svg>
);

const IconChevronDown = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={ONBOARDING.textMuted} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const GenderIcon = ({type, active}: {type: string; active: boolean}) => {
  const color = active ? ONBOARDING.white : ONBOARDING.navy;
  if (type === 'woman') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
        <Path d="M8 20h8M12 14v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }
  if (type === 'other') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.8} />
        <Path d="M8 12h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7.5} r={3.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M6 20c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const ProfileSetupScreen = ({navigation, route}: any) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const initialStep = parseStepParam(route.params?.step) ?? 1;
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const meta = STEP_META[step];

  useEffect(() => {
    const fromRoute = parseStepParam(route.params?.step);
    if (fromRoute) setStep(fromRoute);
  }, [route.params?.step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({y: 0, animated: false});
  }, [step]);

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
  const [openToAny, setOpenToAny] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customCategoryDraft, setCustomCategoryDraft] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const displayBudget = budget.trim() || '50';

  const maxDobDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);
  const dobPickerValue = dobDate ?? maxDobDate;

  const dropdownTextStyle = useMemo(
    () => ({
      placeholderStyle: {color: ONBOARDING.textMuted, fontSize: 14} satisfies TextStyle,
      selectedTextStyle: {
        color: ONBOARDING.text,
        fontSize: 14,
        fontWeight: '600',
      } satisfies TextStyle,
      itemTextStyle: {color: ONBOARDING.text, fontSize: 14} satisfies TextStyle,
      activeColor: ONBOARDING.chipBg,
      iconStyle: {width: 18, height: 18},
    }),
    [],
  );

  const finishOnboarding = async (skipped: boolean) => {
    setLoading(true);
    try {
      if (skipped) {
        await setProfileSetupSkipped(true);
      } else {
        await setProfileSetupSkipped(false);
        const payload = {
          fullName: name.trim() || 'Anonymous',
          dob: dobDate ? dobDate.toISOString() : new Date('2000-01-01').toISOString(),
          gender: selectedGender || 'Other',
          country: country || 'India',
          state: stateVal || 'Karnataka',
          district: district || 'Bangalore',
          pinCode: zipCode || '560001',
          languages: languages.length > 0 ? languages : ['English'],
          categories: [...selectedCategoryIds, ...customCategories],
          hourlyRate: budget.trim() ? parseFloat(budget) : 50,
          profilePhoto: profileImage,
        };
        await upsertProfile(payload);
      }
      await setOnboardingComplete();
      resetToMainTabs(navigation);
    } catch (err) {
      console.log('Error saving profile to backend:', err);
      await setOnboardingComplete();
      resetToMainTabs(navigation);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      setProfileSetupSkipped(false);
      setStep(2);
      return;
    }
    if (step === 2) {
      setProfileSetupSkipped(false);
      setStep(3);
      return;
    }
    finishOnboarding(false);
  };

  const handleSkip = async () => {
    if (step < 3) {
      await setProfileSetupSkipped(true);
      setStep(3);
      return;
    }
    finishOnboarding(true);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
    navigation.goBack();
  };

  const toggleOpenToAny = () => {
    setOpenToAny(true);
    setSelectedCategoryIds([]);
    setCustomCategories([]);
    setCustomCategoryDraft('');
  };

  const toggleCategory = (id: string) => {
    setOpenToAny(false);
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const formatCustomMateLabel = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return '';
    }
    if (/\bMate$/i.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed} Mate`;
  };

  const addCustomCategory = () => {
    const label = formatCustomMateLabel(customCategoryDraft);
    if (!label) {
      return;
    }
    setOpenToAny(false);
    setCustomCategories(prev =>
      prev.some(c => c.toLowerCase() === label.toLowerCase())
        ? prev
        : [...prev, label],
    );
    setCustomCategoryDraft('');
  };

  const removeCustomCategory = (label: string) => {
    setCustomCategories(prev => prev.filter(c => c !== label));
  };

  const rateFooterHint =
    budget.trim().length === 0
      ? `Enter Tenure uses ₹${displayBudget}/hr — change above if needed`
      : undefined;

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8 as const,
      selectionLimit: 1,
    });
    if (result.assets?.[0]?.uri) setProfileImage(result.assets[0].uri);
  };

  const addLanguage = (item: {value: string}) => {
    if (!languages.includes(item.value)) {
      setLanguages(prev => [...prev, item.value]);
    }
  };

  const formatDob = (value: Date) => {
    const day = `${value.getDate()}`.padStart(2, '0');
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDob = (value: string): Date | null => {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleDobChange = (value: string) => {
    const formatted = formatDobInput(value);
    setDob(formatted);
    if (formatted.length !== 10) return;
    const parsed = parseDob(formatted);
    if (!parsed || parsed > maxDobDate) return;
    setDobDate(parsed);
  };

  const displayName = name.trim() || 'Your name';

  return (
    <View style={os.root}>
      <KeyboardAvoidingView
        style={os.flex}
        behavior={
          Platform.OS === 'ios' && step !== 3 ? 'padding' : undefined
        }>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            os.scroll,
            {paddingTop: insets.top + 8},
            step === 3 && {paddingBottom: 16},
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <OnboardingHeader
            title={meta.title}
            step={step}
            onBack={handleBack}
            onSkip={handleSkip}
          />

          {step === 1 ? (
            <>
          <View style={os.card}>
            <View style={styles.personalTopRow}>
              <Text style={os.overline}>Personalization</Text>
              <OnboardingPercentPill step={1} />
            </View>
            <Text style={styles.cardTitle}>Set up your profile</Text>
            <Text style={styles.cardDesc}>
              Add a few optional details to make your profile more useful and personalized.
            </Text>
            <View style={styles.profileRow}>
              <View style={styles.profileTextCol}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileHint}>Tap image to update</Text>
              </View>
              <Pressable onPress={handlePickImage} style={styles.avatarWrap}>
                <Image source={{uri: profileImage}} style={styles.avatar} />
                <View style={styles.cameraFab}>
                  <IconCamera />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={os.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <IconPerson />
              </View>
              <Text style={styles.sectionTitle}>Basic details</Text>
            </View>

            <Text style={os.fieldLabel}>FULL NAME</Text>
            <View style={styles.inputShell}>
              <View style={styles.inputIconLeft}>
                <IconPerson color={ONBOARDING.textMuted} />
              </View>
              <TextInput
                placeholder="e.g. Alexander Vance"
                placeholderTextColor={ONBOARDING.textMuted}
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <Text style={os.fieldLabel}>DATE OF BIRTH</Text>
            <View style={styles.inputShell}>
              <View style={styles.inputIconLeft}>
                <IconCalendar color={ONBOARDING.textMuted} />
              </View>
              <TextInput
                placeholder="DD/MM/YYYY"
                placeholderTextColor={ONBOARDING.textMuted}
                value={dob}
                onChangeText={handleDobChange}
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
              />
              <Pressable
                onPress={() => setDobPickerVisible(true)}
                hitSlop={8}
                style={styles.inputIconRight}>
                <IconCalendar />
              </Pressable>
            </View>
            <Text style={styles.helperText}>
              Use DD/MM/YYYY or pick from calendar. Age must be 18+.
            </Text>

            <Text style={os.fieldLabel}>GENDER IDENTIFICATION</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(g => {
                const active = selectedGender === g.id;
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => setSelectedGender(g.id)}
                    style={({pressed}) => [
                      styles.genderBtn,
                      active && styles.genderBtnActive,
                      pressed && os.pressed,
                    ]}>
                    <GenderIcon type={g.icon} active={active} />
                    <Text style={[styles.genderLabel, active && styles.genderLabelActive]}>
                      {g.id}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
            </>
          ) : step === 2 ? (
            <>
          <View style={os.card}>
            <View style={styles.personalTopRow}>
              <Text style={os.overline}>Location</Text>
              <OnboardingPercentPill step={2} />
            </View>
            <Text style={styles.cardTitle}>Where & how you connect</Text>
            <Text style={styles.cardDesc}>
              Optional — helps suggest mates nearby. Never shown on your public profile.
            </Text>
            <View style={styles.locationHeader}>
              <View style={styles.locationHeaderLeft}>
                <View style={styles.sectionIconBox}>
                  <IconLocation />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Location & language</Text>
                  <Text style={styles.sectionSub}>Optional information</Text>
                </View>
              </View>
              <View style={styles.sparkleCircle}>
                <IconSparkle color={ONBOARDING.accentIcon} />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <Dropdown
                  {...dropdownTextStyle}
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  data={countryData}
                  labelField="label"
                  valueField="value"
                  placeholder="Country"
                  value={country}
                  onChange={item => setCountry(item.value)}
                  renderLeftIcon={() => (
                    <View style={styles.dropdownIcon}>
                      <IconGlobe />
                    </View>
                  )}
                  renderRightIcon={() => <IconChevronDown />}
                />
              </View>
              <View style={styles.gridHalf}>
                <Dropdown
                  {...dropdownTextStyle}
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  data={stateData}
                  labelField="label"
                  valueField="value"
                  placeholder="State"
                  value={stateVal}
                  onChange={item => setStateVal(item.value)}
                  renderLeftIcon={() => (
                    <View style={styles.dropdownIcon}>
                      <IconMap />
                    </View>
                  )}
                  renderRightIcon={() => <IconChevronDown />}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridHalf}>
                <Dropdown
                  {...dropdownTextStyle}
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  data={districtData}
                  labelField="label"
                  valueField="value"
                  placeholder="District"
                  value={district}
                  onChange={item => setDistrict(item.value)}
                  renderLeftIcon={() => (
                    <View style={styles.dropdownIcon}>
                      <IconBuilding />
                    </View>
                  )}
                  renderRightIcon={() => <IconChevronDown />}
                />
              </View>
              <View style={styles.gridHalf}>
                <View style={styles.inputShell}>
                  <View style={styles.inputIconLeft}>
                    <IconMail />
                  </View>
                  <TextInput
                    placeholder="PIN"
                    placeholderTextColor={ONBOARDING.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={zipCode}
                    onChangeText={setZipCode}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <Dropdown
              {...dropdownTextStyle}
              style={[styles.dropdown, styles.dropdownFull]}
              containerStyle={styles.dropdownContainer}
              data={languageData}
              labelField="label"
              valueField="value"
              placeholder="Add language"
              value={null}
              onChange={addLanguage}
              renderLeftIcon={() => (
                <View style={styles.dropdownIcon}>
                  <IconTranslate />
                </View>
              )}
              renderRightIcon={() => <IconChevronDown />}
            />

            {languages.length > 0 ? (
              <View style={styles.langChipRow}>
                {languages.map(lang => (
                  <View key={lang} style={styles.langChip}>
                    <Text style={styles.langChipText}>{lang}</Text>
                    <Pressable
                      onPress={() => setLanguages(prev => prev.filter(l => l !== lang))}
                      hitSlop={6}
                      style={styles.langChipRemove}>
                      <Text style={styles.langChipX}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.infoTip}>
            <View style={styles.infoTipIcon}>
              <IconSparkle />
            </View>
            <Text style={styles.infoTipText}>
              <Text style={styles.infoTipBold}>Profile completion helps{'\n'}</Text>
              You can update everything later from your profile settings.
            </Text>
          </View>
            </>
          ) : (
            <CategoryStepPanel
              openToAny={openToAny}
              selectedCategoryIds={selectedCategoryIds}
              customCategories={customCategories}
              customCategoryDraft={customCategoryDraft}
              budget={budget}
              displayBudget={displayBudget}
              rateHint={rateFooterHint}
              onCustomDraftChange={setCustomCategoryDraft}
              onBudgetChange={setBudget}
              onToggleOpenToAny={toggleOpenToAny}
              onToggleCategory={toggleCategory}
              onAddCustomCategory={addCustomCategory}
              onRemoveCustomCategory={removeCustomCategory}
            />
          )}
        </ScrollView>

        <View style={{paddingBottom: insets.bottom + 12}}>
          <OnboardingFooter
            primaryLabel={meta.cta}
            onPrimary={handleContinue}
            loading={loading}
            secondaryLabel="Skip for now — complete in Profile"
            onSecondary={handleSkip}
          />
        </View>
      </KeyboardAvoidingView>

      <NativeDateTimePicker
        visible={dobPickerVisible}
        mode="date"
        value={dobPickerValue}
        maximumDate={maxDobDate}
        title="Date of birth"
        subtitle="Must be 18 or older"
        onClose={() => setDobPickerVisible(false)}
        onConfirm={selected => {
          const normalized = new Date(selected);
          normalized.setHours(0, 0, 0, 0);
          setDobDate(normalized);
          setDob(formatDob(normalized));
        }}
      />
    </View>
  );
};

export default ProfileSetupScreen;

const styles = StyleSheet.create({
  personalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ONBOARDING.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: ONBOARDING.textSecondary,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: ONBOARDING.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  profileHint: {
    fontSize: 13,
    color: ONBOARDING.textMuted,
    fontWeight: '500',
  },
  avatarWrap: {position: 'relative'},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ONBOARDING.border,
    borderWidth: 3,
    borderColor: ONBOARDING.white,
  },
  cameraFab: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ONBOARDING.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ONBOARDING.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ONBOARDING.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: ONBOARDING.text,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: ONBOARDING.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  locationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sparkleCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ONBOARDING.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ONBOARDING.white,
    borderRadius: ONBOARDING.inputRadius,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
    minHeight: 48,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  inputIconLeft: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconRight: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: ONBOARDING.text,
    paddingVertical: 12,
    paddingRight: 8,
  },
  helperText: {
    fontSize: 11,
    lineHeight: 16,
    color: ONBOARDING.textMuted,
    marginBottom: 10,
    marginTop: -4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 44,
    borderRadius: ONBOARDING.inputRadius,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.white,
  },
  genderBtnActive: {
    backgroundColor: ONBOARDING.navy,
    borderColor: ONBOARDING.navy,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: ONBOARDING.navy,
  },
  genderLabelActive: {
    color: ONBOARDING.white,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  gridHalf: {flex: 1},
  dropdown: {
    backgroundColor: ONBOARDING.white,
    borderRadius: ONBOARDING.inputRadius,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
    paddingHorizontal: 10,
    height: 48,
  },
  dropdownFull: {marginBottom: 12},
  dropdownContainer: {
    borderRadius: ONBOARDING.inputRadius,
    borderColor: ONBOARDING.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownIcon: {marginRight: 4, marginLeft: 4},
  langChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ONBOARDING.chipBg,
    borderRadius: 99,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 4,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: ONBOARDING.chipText,
  },
  langChipRemove: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipX: {
    fontSize: 16,
    fontWeight: '700',
    color: ONBOARDING.chipText,
    lineHeight: 18,
  },
  infoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ONBOARDING.orangeBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FDE68A',
    ...onboardingCardShadow,
  },
  infoTipIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: ONBOARDING.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: ONBOARDING.textSecondary,
    fontWeight: '500',
  },
  infoTipBold: {
    fontWeight: '800',
    color: ONBOARDING.text,
  },
});
