import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

const H = {
  bg: '#FFFFFF',
  border: '#E5E7EB',
  primary: '#064B63',
  text: '#111827',
  danger: '#C94A44',
} as const;

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  showBadge?: boolean;
};

const HeaderIconButton = ({
  onPress,
  accessibilityLabel,
  children,
  showBadge = false,
}: Props) => (
  <Pressable
    onPress={onPress}
    hitSlop={6}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({pressed}) => [styles.btn, pressed && styles.pressed]}>
    {children}
    {showBadge ? <View style={styles.badge} /> : null}
  </Pressable>
);

/** Matches Alerts tab stroke icon in TabBarIcon */
export const BellIcon = ({
  color = H.primary,
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5a4.5 4.5 0 0 0-4.5 4.5v2.6L5.8 14.8h12.4l-1.7-3.2V9A4.5 4.5 0 0 0 12 4.5Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinejoin="round"
    />
    <Path
      d="M10 17.2h4a2 2 0 0 1-4 0Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinejoin="round"
    />
  </Svg>
);

export const MenuIcon = ({color = H.primary}: {color?: string}) => (
  <View style={styles.menuDots}>
    <View style={[styles.menuDot, {backgroundColor: color}]} />
    <View style={[styles.menuDot, {backgroundColor: color}]} />
    <View style={[styles.menuDot, {backgroundColor: color}]} />
  </View>
);

export default HeaderIconButton;

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: H.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: H.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {opacity: 0.72},
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: H.danger,
    borderWidth: 1.5,
    borderColor: H.bg,
  },
  menuDots: {
    height: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
