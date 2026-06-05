import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  label: string;
  onRemove: () => void;
};

const RemovableChip = ({label, onRemove}: Props) => {
  const {colors, tokens} = useTheme();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: tokens.radius.pill,
        },
      ]}>
      <Text
        style={[tokens.typography.caption, styles.label, {color: colors.text}]}
        numberOfLines={1}>
        {label}
      </Text>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        style={({pressed}) => [
          styles.removeBtn,
          {
            backgroundColor: colors.chip,
            borderRadius: tokens.radius.pill,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${label}`}>
        <Text style={[styles.removeIcon, {color: colors.textMuted}]}>×</Text>
      </Pressable>
    </View>
  );
};

export default RemovableChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  label: {
    fontWeight: '600',
    marginRight: 6,
    flexShrink: 1,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -1,
  },
});
