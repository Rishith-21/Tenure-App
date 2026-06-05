import React from 'react';
import {StyleSheet, Text, View, ViewStyle, StyleProp, Pressable} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

type Props = {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

const AppBadge = ({label, variant = 'default', style, onPress}: Props) => {
  const {colors, tokens} = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {bg: colors.meetConfirmedBg, text: colors.success};
      case 'warning':
        return {bg: colors.meetPendingConfirmCardBg, text: colors.warning};
      case 'danger':
        return {bg: '#FEF2F2', text: colors.danger};
      case 'info':
        return {bg: colors.cardMuted, text: colors.text};
      case 'secondary':
        return {bg: colors.chip, text: colors.textSecondary};
      default:
        return {bg: colors.chip, text: colors.textSecondary};
    }
  };

  const {bg, text} = getVariantStyles();

  const content = (
    <View
      style={[
        styles.badge,
        {backgroundColor: bg, borderRadius: tokens.radius.pill},
        style,
      ]}>
      <Text style={[tokens.typography.overline, styles.text, {color: text}]}>
        {label}
      </Text>
      {onPress ? <Text style={[styles.closeX, {color: text}]}> ×</Text> : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
};

export default AppBadge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 10,
    letterSpacing: 1.2,
  },
  closeX: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: -2,
  },
});
