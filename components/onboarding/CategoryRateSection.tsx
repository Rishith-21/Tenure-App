import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {ONBOARDING, onboardingStyles as os} from '../../theme/onboardingTheme';

const RATE_PRESETS = ['50', '100', '150', '200'];

type Props = {
  budget: string;
  displayBudget: string;
  onBudgetChange: (value: string) => void;
  rateHint?: string;
};

const CategoryRateSection = ({
  budget,
  displayBudget,
  onBudgetChange,
  rateHint,
}: Props) => (
  <View style={os.card}>
    <Text style={styles.rateLabel}>Hourly rate</Text>
    <Text style={styles.rateSub}>Your time, your price — editable in Profile.</Text>
    <View style={styles.rateRow}>
      <Text style={styles.currency}>₹</Text>
      <TextInput
        placeholder="50"
        placeholderTextColor={ONBOARDING.textMuted}
        keyboardType="number-pad"
        maxLength={5}
        value={budget}
        onChangeText={onBudgetChange}
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
            onPress={() => onBudgetChange(p)}
            style={({pressed}) => [
              styles.preset,
              active && styles.presetActive,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.presetText, active && styles.presetTextActive]}>
              ₹{p}
            </Text>
          </Pressable>
        );
      })}
    </View>
    {rateHint ? <Text style={styles.hint}>{rateHint}</Text> : null}
  </View>
);

export default CategoryRateSection;

const styles = StyleSheet.create({
  rateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ONBOARDING.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rateSub: {
    fontSize: 13,
    color: ONBOARDING.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 14,
  },
  currency: {
    fontSize: 20,
    fontWeight: '800',
    color: ONBOARDING.navy,
  },
  rateInput: {
    fontSize: 32,
    fontWeight: '800',
    color: ONBOARDING.text,
    minWidth: 64,
    textAlign: 'center',
    padding: 0,
  },
  perHour: {
    fontSize: 14,
    fontWeight: '600',
    color: ONBOARDING.textMuted,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ONBOARDING.border,
    backgroundColor: ONBOARDING.bg,
  },
  presetActive: {
    borderColor: ONBOARDING.navy,
    backgroundColor: ONBOARDING.chipBg,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
    color: ONBOARDING.textSecondary,
  },
  presetTextActive: {
    color: ONBOARDING.navy,
  },
  hint: {
    fontSize: 12,
    color: ONBOARDING.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 17,
  },
  pressed: {opacity: 0.88},
});
