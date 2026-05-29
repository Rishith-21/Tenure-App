import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {setOnboardingComplete} from '../utils/authStorage';
import {resetToMainTabs} from '../navigation/navigationActions';
import AppButton from '../components/ui/AppButton';
import {useTheme} from '../context/ThemeContext';
import {setProfileSetupSkipped} from '../utils/profileSetupStorage';
import {MATE_CATEGORIES} from '../constants/mateCategories';

const CATEGORY_ICONS: Record<string, string> = {
  shopping: '🛍',
  movie: '🎬',
  timepass: '☕',
  hospital: '🏥',
  talking: '💬',
  travel: '✈',
  home: '🏠',
  children: '👶',
  food: '🍽',
  pub: '🍺',
  vlog: '📹',
  language: '🗣',
  day: '☀',
  other: '✦',
};

const RATE_PRESETS = ['50', '100', '150', '200'];

const CategoryPreferenceScreen = ({navigation}: any) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [openToAny, setOpenToAny] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [finishing, setFinishing] = useState(false);

  const displayBudget = budget.trim() || '50';

  const finish = async (skipped: boolean) => {
    setFinishing(true);
    try {
      if (skipped) await setProfileSetupSkipped(true);
      await setOnboardingComplete();
      resetToMainTabs(navigation);
    } finally {
      setFinishing(false);
    }
  };

  const toggleOpenToAny = () => {
    setOpenToAny(true);
    setSelectedIds([]);
  };

  const toggleCategory = (id: string) => {
    setOpenToAny(false);
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const selectPreset = (amount: string) => {
    setBudget(amount);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: colors.bg}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
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
          <Text style={styles.stepLabel}>Step 2 of 2</Text>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.progressSeg, styles.progressDone]} />
          <View style={[styles.progressSeg, styles.progressActive]} />
        </View>

        <Text style={styles.title}>What you offer</Text>
        <Text style={styles.subtitle}>
          Tell others how you can show up as a mate — all optional, editable
          anytime in Profile.
        </Text>

        <Text style={styles.sectionLabel}>AVAILABILITY</Text>
        <Pressable
          onPress={toggleOpenToAny}
          style={[
            styles.anyCard,
            openToAny && styles.anyCardActive,
          ]}>
          <View style={[styles.anyIconWrap, openToAny && styles.anyIconActive]}>
            <Text style={[styles.anyIcon, openToAny && styles.anyIconOn]}>
              ✦
            </Text>
          </View>
          <View style={styles.anyTextBlock}>
            <Text style={[styles.anyTitle, openToAny && styles.anyTitleActive]}>
              Open to any activity
            </Text>
            <Text style={styles.anySub}>
              Let requesters choose — shopping, travel, time pass, and more.
            </Text>
          </View>
          <View style={[styles.radio, openToAny && styles.radioOn]}>
            {openToAny ? <View style={styles.radioDot} /> : null}
          </View>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or pick mate types</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.grid}>
          {MATE_CATEGORIES.map(cat => {
            const selected = selectedIds.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={[
                  styles.catCard,
                  selected && styles.catCardSelected,
                  openToAny && !selected && styles.catCardMuted,
                ]}>
                <Text style={styles.catEmoji}>
                  {CATEGORY_ICONS[cat.id] ?? '✦'}
                </Text>
                <Text
                  style={[styles.catLabel, selected && styles.catLabelSelected]}
                  numberOfLines={2}>
                  {cat.label.replace(' Mate', '')}
                </Text>
                {selected ? (
                  <View style={styles.catCheck}>
                    <Text style={styles.catCheckMark}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {selectedIds.length > 0 ? (
          <Text style={styles.selectionHint}>
            {selectedIds.length} mate type{selectedIds.length === 1 ? '' : 's'}{' '}
            selected
          </Text>
        ) : null}

        <Text style={[styles.sectionLabel, styles.rateSection]}>HOURLY RATE</Text>
        <View style={styles.rateCard}>
          <Text style={styles.rateCardHint}>Your time, your price</Text>
          <View style={styles.rateInputRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              placeholder="50"
              placeholderTextColor={colors.textHint}
              keyboardType="number-pad"
              maxLength={5}
              value={budget}
              onChangeText={setBudget}
              style={styles.rateInput}
            />
            <Text style={styles.perHour}>/ hour</Text>
          </View>
          <View style={styles.presetRow}>
            {RATE_PRESETS.map(p => {
              const active = displayBudget === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => selectPreset(p)}
                  style={[styles.preset, active && styles.presetActive]}>
                  <Text
                    style={[
                      styles.presetText,
                      active && styles.presetTextActive,
                    ]}>
                    ₹{p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            label="Enter Tenure"
            onPress={() => finish(false)}
            loading={finishing}
            pill
          />
          <AppButton
            label="Explore first — set up later"
            onPress={() => finish(true)}
            variant="ghost"
            disabled={finishing}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CategoryPreferenceScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    flex: {flex: 1},
    content: {paddingHorizontal: 24},
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
    progressDone: {backgroundColor: c.brandMuted},
    progressActive: {backgroundColor: c.brandDark},
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
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brandDark,
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    rateSection: {marginTop: 8},
    anyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      backgroundColor: c.bg,
      gap: 14,
    },
    anyCardActive: {
      borderColor: c.brand,
      borderLeftWidth: 3,
      borderLeftColor: c.brand,
    },
    anyIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    anyIconActive: {backgroundColor: c.brandDark},
    anyIcon: {fontSize: 20, color: c.brandDark},
    anyIconOn: {color: '#FFFFFF'},
    anyTextBlock: {flex: 1},
    anyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginBottom: 4,
    },
    anyTitleActive: {color: c.brandDark},
    anySub: {
      fontSize: 12,
      lineHeight: 17,
      color: c.textMuted,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: c.borderPill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOn: {borderColor: c.brand},
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.brand,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    dividerLine: {flex: 1, height: 1, backgroundColor: c.border},
    dividerText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textHint,
      letterSpacing: 0.5,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 12,
    },
    catCard: {
      width: '31%',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bg,
      position: 'relative',
    },
    catCardSelected: {
      borderColor: c.brand,
      borderWidth: 1.5,
      backgroundColor: c.bg,
    },
    catCardMuted: {opacity: 0.72},
    catEmoji: {fontSize: 22, marginBottom: 6},
    catLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 14,
    },
    catLabelSelected: {color: c.brandDark, fontWeight: '700'},
    catCheck: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catCheckMark: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
    },
    selectionHint: {
      fontSize: 12,
      color: c.brand,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
    },
    rateCard: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      padding: 20,
      marginBottom: 8,
      backgroundColor: c.bg,
    },
    rateCardHint: {
      fontSize: 13,
      color: c.textMuted,
      marginBottom: 16,
      textAlign: 'center',
    },
    rateInputRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 20,
    },
    currency: {
      fontSize: 24,
      fontWeight: '700',
      color: c.brandDark,
    },
    rateInput: {
      fontSize: 40,
      fontWeight: '800',
      color: c.text,
      minWidth: 72,
      textAlign: 'center',
      padding: 0,
    },
    perHour: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textMuted,
    },
    presetRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    preset: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bg,
    },
    presetActive: {
      borderColor: c.brand,
      backgroundColor: c.chip,
    },
    presetText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textSecondary,
    },
    presetTextActive: {
      color: c.brandDark,
      fontWeight: '700',
    },
    actions: {
      marginTop: 32,
      gap: 8,
      paddingBottom: 8,
    },
  });
