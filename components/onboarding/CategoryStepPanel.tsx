import React, {useMemo, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  MATE_CATEGORIES,
  ONBOARDING_QUICK_CATEGORY_IDS,
} from '../../constants/mateCategories';
import {ONBOARDING, onboardingStyles as os} from '../../theme/onboardingTheme';
import {OnboardingPercentPill} from './OnboardingChrome';
import CategoryMoreSheet from './CategoryMoreSheet';
import CategoryRateSection from './CategoryRateSection';

type Props = {
  openToAny: boolean;
  selectedCategoryIds: string[];
  customCategories: string[];
  customCategoryDraft: string;
  budget: string;
  displayBudget: string;
  rateHint?: string;
  onCustomDraftChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onToggleOpenToAny: () => void;
  onToggleCategory: (id: string) => void;
  onAddCustomCategory: () => void;
  onRemoveCustomCategory: (label: string) => void;
};

const CategoryStepPanel = ({
  openToAny,
  selectedCategoryIds,
  customCategories,
  customCategoryDraft,
  budget,
  displayBudget,
  rateHint,
  onCustomDraftChange,
  onBudgetChange,
  onToggleOpenToAny,
  onToggleCategory,
  onAddCustomCategory,
  onRemoveCustomCategory,
}: Props) => {
  const [moreVisible, setMoreVisible] = useState(false);

  const quickCategories = useMemo(
    () =>
      ONBOARDING_QUICK_CATEGORY_IDS.map(id =>
        MATE_CATEGORIES.find(c => c.id === id),
      ).filter((c): c is (typeof MATE_CATEGORIES)[number] => Boolean(c)),
    [],
  );

  const quickIdSet = useMemo(
    () => new Set<string>(ONBOARDING_QUICK_CATEGORY_IDS),
    [],
  );
  const moreSelectedCount = selectedCategoryIds.filter(
    id => !quickIdSet.has(id),
  ).length;

  const selectionCount =
    selectedCategoryIds.length + customCategories.length;

  return (
    <>
      <View style={os.card}>
        <View style={styles.topRow}>
          <Text style={os.overline}>Preferences</Text>
          <OnboardingPercentPill step={3} />
        </View>
        <Text style={styles.title}>What you offer</Text>
        <Text style={styles.sub}>
          Pick a few mate types or describe your own — rate is set below.
        </Text>
      </View>

      <View style={os.card}>
        <Pressable
          onPress={onToggleOpenToAny}
          style={({pressed}) => [
            styles.anyRow,
            openToAny && styles.anyRowActive,
            pressed && styles.pressed,
          ]}>
          <View style={[styles.radio, openToAny && styles.radioOn]}>
            {openToAny ? <View style={styles.radioDot} /> : null}
          </View>
          <View style={styles.anyCopy}>
            <Text style={[styles.anyTitle, openToAny && styles.anyTitleOn]}>
              Open to any activity
            </Text>
            <Text style={styles.anySub}>Flexible for most mate requests</Text>
          </View>
        </Pressable>

        <Text style={styles.orLabel}>or choose types</Text>

        <View style={styles.chipRow}>
          {quickCategories.map(cat => {
            const selected = selectedCategoryIds.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => onToggleCategory(cat.id)}
                style={({pressed}) => [
                  styles.chip,
                  selected && styles.chipSelected,
                  openToAny && !selected && styles.chipMuted,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setMoreVisible(true)}
            style={({pressed}) => [
              styles.chip,
              styles.moreChip,
              moreSelectedCount > 0 && styles.chipSelected,
              pressed && styles.pressed,
            ]}>
            <Text
              style={[
                styles.chipText,
                moreSelectedCount > 0 && styles.chipTextSelected,
              ]}>
              More{moreSelectedCount > 0 ? ` · ${moreSelectedCount}` : ''}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Your mate type</Text>
        <View style={styles.customRow}>
          <TextInput
            value={customCategoryDraft}
            onChangeText={onCustomDraftChange}
            placeholder="e.g. Photography Mate, City Walk Mate"
            placeholderTextColor={ONBOARDING.textMuted}
            style={styles.customInput}
            returnKeyType="done"
            onSubmitEditing={onAddCustomCategory}
            maxLength={40}
          />
          <Pressable
            onPress={onAddCustomCategory}
            style={({pressed}) => [
              styles.addBtn,
              !customCategoryDraft.trim() && styles.addBtnDisabled,
              pressed && customCategoryDraft.trim() && styles.pressed,
            ]}
            disabled={!customCategoryDraft.trim()}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {customCategories.length > 0 ? (
          <View style={styles.customChipRow}>
            {customCategories.map(label => (
              <View key={label} style={styles.customChip}>
                <Text style={styles.customChipText} numberOfLines={1}>
                  {label}
                </Text>
                <Pressable
                  onPress={() => onRemoveCustomCategory(label)}
                  hitSlop={6}
                  style={styles.customRemove}>
                  <Text style={styles.customRemoveText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.selectionHint}>
          {openToAny
            ? 'Open to any — you can refine this later in Profile.'
            : selectionCount > 0
              ? `${selectionCount} type${selectionCount === 1 ? '' : 's'} selected`
              : 'Add a chip, More type, or your own label above.'}
        </Text>
      </View>

      <CategoryRateSection
        budget={budget}
        displayBudget={displayBudget}
        onBudgetChange={onBudgetChange}
        rateHint={rateHint}
      />

      <CategoryMoreSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        quickIds={ONBOARDING_QUICK_CATEGORY_IDS}
        selectedIds={selectedCategoryIds}
        onToggle={onToggleCategory}
      />
    </>
  );
};

export default CategoryStepPanel;

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: ONBOARDING.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    color: ONBOARDING.textSecondary,
  },
  anyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: ONBOARDING.inputRadius,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
    marginBottom: 14,
  },
  anyRowActive: {
    borderColor: ONBOARDING.navy,
    backgroundColor: ONBOARDING.chipBg,
  },
  anyCopy: {flex: 1},
  anyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ONBOARDING.text,
  },
  anyTitleOn: {color: ONBOARDING.navy},
  anySub: {
    fontSize: 12,
    color: ONBOARDING.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ONBOARDING.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {borderColor: ONBOARDING.navy},
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ONBOARDING.navy,
  },
  orLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ONBOARDING.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.white,
  },
  chipSelected: {
    borderColor: ONBOARDING.navy,
    backgroundColor: ONBOARDING.chipBg,
  },
  chipMuted: {opacity: 0.5},
  moreChip: {
    borderStyle: 'dashed',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: ONBOARDING.textSecondary,
  },
  chipTextSelected: {
    color: ONBOARDING.navy,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ONBOARDING.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: ONBOARDING.border,
    borderRadius: ONBOARDING.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: ONBOARDING.text,
    backgroundColor: ONBOARDING.white,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: ONBOARDING.inputRadius,
    backgroundColor: ONBOARDING.navy,
  },
  addBtnDisabled: {opacity: 0.4},
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ONBOARDING.white,
  },
  customChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ONBOARDING.chipBg,
    borderWidth: 1,
    borderColor: ONBOARDING.navy,
  },
  customChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: ONBOARDING.navy,
    maxWidth: 200,
  },
  customRemove: {padding: 2},
  customRemoveText: {
    fontSize: 18,
    lineHeight: 20,
    color: ONBOARDING.textMuted,
    fontWeight: '600',
  },
  selectionHint: {
    fontSize: 12,
    fontWeight: '600',
    color: ONBOARDING.textMuted,
    marginTop: 12,
    lineHeight: 17,
  },
  pressed: {opacity: 0.88},
});
