import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {UI} from '../../theme/ui';

type Props = {
  onPress: () => void;
  style?: ViewStyle;
  /** Use on dark or tinted headers */
  variant?: 'default' | 'ghost';
  accessibilityLabel?: string;
};

const BackButton = ({
  onPress,
  style,
  variant = 'default',
  accessibilityLabel = 'Go back',
}: Props) => (
  <Pressable
    onPress={onPress}
    hitSlop={6}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({pressed}) => [
      styles.base,
      variant === 'ghost' ? styles.ghost : styles.filled,
      pressed && styles.pressed,
      style,
    ]}>
    <Text
      style={[styles.arrow, variant === 'ghost' && styles.arrowGhost]}
      allowFontScaling={false}>
      ←
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.borderInput,
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ghost: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0, 59, 87, 0.12)',
  },
  pressed: {
    opacity: 0.88,
    transform: [{scale: 0.96}],
  },
  arrow: {
    fontSize: 22,
    fontWeight: '700',
    color: UI.brand,
    lineHeight: 24,
  },
  arrowGhost: {
    color: UI.brand,
  },
});

export default BackButton;
