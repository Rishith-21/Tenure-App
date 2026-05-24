import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {UI} from '../../theme/ui';

type Props = {
  label: string;
  onRemove: () => void;
};

const RemovableChip = ({label, onRemove}: Props) => (
  <View style={styles.chip}>
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
    <Pressable
      onPress={onRemove}
      hitSlop={8}
      style={({pressed}) => [
        styles.removeBtn,
        pressed && styles.removeBtnPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${label}`}>
      <Text style={styles.removeIcon}>×</Text>
    </Pressable>
  </View>
);

export default RemovableChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5DCE6',
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  label: {
    color: UI.brand,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
    flexShrink: 1,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: '#B8C9E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnPressed: {
    backgroundColor: '#F0F4F8',
    opacity: 0.85,
  },
  removeIcon: {
    color: UI.brandMuted,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -1,
  },
});
