import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle, StyleProp} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const FilterChip = ({label, selected = false, onPress, style}: Props) => {
  const {colors, tokens} = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.chip,
        {
          borderRadius: tokens.radius.pill,
          backgroundColor: selected ? colors.chipActive : colors.card,
          borderColor: selected ? colors.chipActive : colors.border,
          transform: [{scale: pressed ? tokens.motion.pressScale : 1}],
          ...tokens.shadows.soft(colors.shadow),
        },
        style,
      ]}>
      <Text
        style={[
          tokens.typography.caption,
          styles.label,
          {color: selected ? colors.bgElevated : colors.textSecondary},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

export default FilterChip;

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
  },
  label: {
    fontWeight: '600',
  },
});
