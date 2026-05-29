import React from 'react';
import {
  ActivityIndicator,
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
  /** Fully rounded pill shape (Stitch-style CTAs) */
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
  pill = false,
}: Props) => {
  const {colors} = useTheme();
  const off = disabled || loading;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.cardMuted
        : 'transparent';

  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? colors.text
        : colors.brand;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({pressed}) => [
        styles.base,
        pill && styles.pill,
        fullWidth && styles.full,
        {
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
          opacity: off ? 0.5 : pressed ? 0.9 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, {color: textColor}]}>{label}</Text>
      )}
    </Pressable>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  full: {alignSelf: 'stretch'},
  pill: {borderRadius: 999, minHeight: 54, paddingVertical: 16},
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
