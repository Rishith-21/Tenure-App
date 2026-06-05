import React, {useMemo} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BottomSheetModal from '../ui/BottomSheetModal';
import {MATE_CATEGORIES, MateCategory} from '../../constants/mateCategories';
import {ONBOARDING, onboardingCardShadow} from '../../theme/onboardingTheme';

type Props = {
  visible: boolean;
  onClose: () => void;
  quickIds: readonly string[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

const CategoryMoreSheet = ({
  visible,
  onClose,
  quickIds,
  selectedIds,
  onToggle,
}: Props) => {
  const moreCategories = useMemo(
    () => MATE_CATEGORIES.filter(c => !quickIds.includes(c.id)),
    [quickIds],
  );

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>More mate types</Text>
        <Text style={styles.sub}>
          Tap to add or remove — you can also type your own on the main
          screen.
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.grid}>
            {moreCategories.map(cat => (
              <CategoryChip
                key={cat.id}
                cat={cat}
                selected={selectedIds.includes(cat.id)}
                onPress={() => onToggle(cat.id)}
              />
            ))}
          </View>
        </ScrollView>
        <Pressable
          onPress={onClose}
          style={({pressed}) => [styles.doneBtn, pressed && styles.pressed]}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
};

const CategoryChip = ({
  cat,
  selected,
  onPress,
}: {
  cat: MateCategory;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [
      styles.chip,
      selected && styles.chipSelected,
      pressed && styles.pressed,
    ]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {cat.label}
    </Text>
  </Pressable>
);

export default CategoryMoreSheet;

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: ONBOARDING.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    maxHeight: '72%',
    ...onboardingCardShadow,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: ONBOARDING.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: ONBOARDING.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: ONBOARDING.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  scroll: {paddingBottom: 12},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: ONBOARDING.textSecondary,
  },
  chipTextSelected: {
    color: ONBOARDING.navy,
    fontWeight: '700',
  },
  pressed: {opacity: 0.85},
  doneBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: ONBOARDING.chipBg,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: ONBOARDING.navy,
  },
});
