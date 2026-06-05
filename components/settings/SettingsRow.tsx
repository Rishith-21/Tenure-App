import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  danger?: boolean;
  isLast?: boolean;
};

const SettingsRow = ({label, onPress, danger = false, isLast = false}: Props) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    style={({pressed}) => [
      styles.row,
      !isLast && styles.rowBorder,
      pressed && styles.pressed,
    ]}>
    <Text style={[styles.label, danger && styles.labelDanger]} numberOfLines={1}>
      {label}
    </Text>
    <Text style={styles.chevron} allowFontScaling={false}>
      ›
    </Text>
  </Pressable>
);

export default SettingsRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  pressed: {
    backgroundColor: 'rgba(6,75,99,0.06)',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  labelDanger: {
    color: '#C94A44',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 24,
  },
});
