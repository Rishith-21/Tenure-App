import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useTheme} from '../../context/ThemeContext';
import DraggableBottomDrawer, {
  DraggableBottomDrawerRef,
} from '../ui/DraggableBottomDrawer';
import {
  DEFAULT_SEARCH_FILTERS,
  HOURLY_RATE_OPTIONS,
  SearchFilters,
} from './searchFilterConfig';

export type {HourlyRateRange, SearchFilters} from './searchFilterConfig';

const parseRateInput = (text: string): number | null => {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
};

type Props = {
  visible: boolean;
  filters: SearchFilters;
  districts: {label: string; value: string}[];
  categories: {label: string; value: string}[];
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
};

const GENDER_OPTIONS = [
  {label: 'Any gender', value: 'all'},
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
];

const AGE_OPTIONS = [
  {label: 'Any age', value: 'all'},
  {label: 'Under 30', value: 'under30'},
  {label: '30 – 45', value: '30to45'},
  {label: 'Over 45', value: 'over45'},
];

const SearchFilterModal = ({
  visible,
  filters,
  districts,
  categories,
  onClose,
  onApply,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<SearchFilters>(filters);
  const drawerRef = useRef<DraggableBottomDrawerRef>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraft(filters);
  }, [visible, filters]);

  const handleApply = () => {
    let applied = draft;
    if (draft.hourlyRateRange === 'custom') {
      if (
        draft.customHourlyRateMin == null &&
        draft.customHourlyRateMax == null
      ) {
        applied = {
          ...draft,
          hourlyRateRange: 'all',
          customHourlyRateMin: null,
          customHourlyRateMax: null,
        };
      } else {
        let min = draft.customHourlyRateMin;
        let max = draft.customHourlyRateMax;
        if (min != null && max != null && min > max) {
          [min, max] = [max, min];
        }
        applied = {
          ...draft,
          customHourlyRateMin: min,
          customHourlyRateMax: max,
        };
      }
    }
    drawerRef.current?.dismiss(() => onApply(applied));
  };

  const handleResetDraft = () => {
    setDraft(DEFAULT_SEARCH_FILTERS);
  };

  const formFields = (
    <>
          <Text style={styles.label}>Location — District</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
            containerStyle={styles.dropdownContainer}
            activeColor={colors.chip}
            data={districts}
            labelField="label"
            valueField="value"
            placeholder="Select district"
            value={draft.district}
            onChange={item => setDraft({...draft, district: item.value})}
          />

          <Text style={styles.label}>Category</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
            containerStyle={styles.dropdownContainer}
            activeColor={colors.chip}
            data={categories}
            labelField="label"
            valueField="value"
            placeholder="Select mate type"
            value={draft.category}
            onChange={item => setDraft({...draft, category: item.value})}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipGroup}>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map(opt => {
              const active = draft.gender === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    setDraft({
                      ...draft,
                      gender: opt.value as SearchFilters['gender'],
                    })
                  }
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          </View>

          <Text style={styles.label}>Age</Text>
          <View style={styles.chipGroup}>
          <View style={styles.chipRowWrap}>
            {AGE_OPTIONS.map(opt => {
              const active = draft.ageRange === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    setDraft({
                      ...draft,
                      ageRange: opt.value as SearchFilters['ageRange'],
                    })
                  }
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          </View>

          <Text style={styles.label}>Hourly rate</Text>
          <View style={styles.chipGroup}>
            <View style={styles.chipRowWrap}>
              {HOURLY_RATE_OPTIONS.map(opt => {
                const active = draft.hourlyRateRange === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() =>
                      setDraft({
                        ...draft,
                        hourlyRateRange: opt.value,
                        customHourlyRateMin:
                          opt.value === 'custom'
                            ? draft.customHourlyRateMin
                            : null,
                        customHourlyRateMax:
                          opt.value === 'custom'
                            ? draft.customHourlyRateMax
                            : null,
                      })
                    }
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {draft.hourlyRateRange === 'custom' ? (
            <View style={styles.customRateRow}>
              <View style={styles.customRateField}>
                <Text style={styles.customRateLabel}>Min ₹/hr</Text>
                <TextInput
                  value={
                    draft.customHourlyRateMin != null
                      ? String(draft.customHourlyRateMin)
                      : ''
                  }
                  onChangeText={text =>
                    setDraft({
                      ...draft,
                      customHourlyRateMin: parseRateInput(text),
                    })
                  }
                  placeholder="e.g. 80"
                  placeholderTextColor={colors.textHint}
                  keyboardType="number-pad"
                  style={styles.customRateInput}
                />
              </View>
              <View style={styles.customRateField}>
                <Text style={styles.customRateLabel}>Max ₹/hr</Text>
                <TextInput
                  value={
                    draft.customHourlyRateMax != null
                      ? String(draft.customHourlyRateMax)
                      : ''
                  }
                  onChangeText={text =>
                    setDraft({
                      ...draft,
                      customHourlyRateMax: parseRateInput(text),
                    })
                  }
                  placeholder="e.g. 250"
                  placeholderTextColor={colors.textHint}
                  keyboardType="number-pad"
                  style={styles.customRateInput}
                />
              </View>
            </View>
          ) : null}
    </>
  );

  return (
    <DraggableBottomDrawer
      ref={drawerRef}
      visible={visible}
      onClose={onClose}
      title="Filter mates"
      subtitle="Refine location, category, and more"
      footer={
        <View style={styles.actions}>
          <Pressable style={styles.resetBtn} onPress={handleResetDraft}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>Apply filters</Text>
          </Pressable>
        </View>
      }>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        {formFields}
      </ScrollView>
    </DraggableBottomDrawer>
  );
};

export default SearchFilterModal;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      flexGrow: 1,
      flexShrink: 1,
    },
    scrollContent: {
      paddingHorizontal: 22,
      paddingBottom: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 8,
      marginTop: 10,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
    },
    dropdown: {
      height: 50,
      backgroundColor: c.bgElevated,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    dropdownContainer: {
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      overflow: 'hidden',
    },
    placeholder: {
      color: c.textHint,
      fontSize: 15,
    },
    selectedText: {
      color: c.text,
      fontSize: 15,
      fontWeight: '500',
    },
    chipGroup: {
      backgroundColor: c.chip,
      borderRadius: 14,
      padding: 10,
      marginBottom: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chipRowWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      backgroundColor: c.bgElevated,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginRight: 8,
      marginBottom: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    chipActive: {
      backgroundColor: c.brand,
      borderColor: c.brand,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
    customRateRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 2,
      marginBottom: 4,
    },
    customRateField: {
      flex: 1,
    },
    customRateLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 6,
    },
    customRateInput: {
      height: 48,
      borderRadius: 14,
      paddingHorizontal: 14,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      fontSize: 15,
      fontWeight: '500',
      color: c.text,
      fontVariant: ['tabular-nums'],
    },
    actions: {
      flexDirection: 'row',
      paddingTop: 12,
      paddingBottom: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    resetBtn: {
      flex: 1,
      paddingVertical: 15,
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: c.chip,
      marginRight: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    resetText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textSecondary,
    },
    applyBtn: {
      flex: 1.5,
      paddingVertical: 15,
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: c.brand,
    },
    applyText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
