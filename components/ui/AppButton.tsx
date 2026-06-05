import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  pill?: boolean;
};

const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
  pill = true,
}: Props) => {
  const {colors, tokens} = useTheme();
  const off = disabled || loading;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.cardMuted
        : 'transparent';

  const textColor =
    variant === 'primary'
      ? colors.bgElevated
      : variant === 'secondary'
        ? colors.text
        : colors.primary;

  const borderColor =
    variant === 'secondary' ? colors.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={state => [
        styles.base,
        {
          borderRadius: pill ? tokens.radius.pill : tokens.radius.md,
          minHeight: 56,
        },
        fullWidth && styles.full,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: off ? 0.5 : 1,
          transform: [
            {scale: state.pressed && !off ? tokens.motion.pressScale : 1},
          ],
          ...(variant === 'primary'
            ? tokens.shadows.soft(colors.shadow)
            : {}),
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[tokens.typography.bodyMedium, styles.label, {color: textColor}]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  full: {alignSelf: 'stretch'},
  label: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
