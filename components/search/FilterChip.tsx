import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {useSearchElevated} from './SearchElevationContext';
import {S, getSearchShadowSoft} from './searchTheme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

const FilterChip = ({label, selected = false, onPress}: Props) => {
  const elevated = useSearchElevated();

  return (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [
      styles.chip,
      getSearchShadowSoft(elevated),
      selected && styles.chipSelected,
      pressed && styles.pressed,
    ]}>
    <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
  </Pressable>
  );
};

export default FilterChip;

const styles = StyleSheet.create({
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: S.card,
    borderWidth: 1,
    borderColor: S.border,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  chipSelected: {
    backgroundColor: S.primary,
    borderColor: S.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: S.textSecondary,
    lineHeight: 16,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  pressed: {opacity: 0.82},
});
