import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  label: string;
  symbol?: string;
  onPress?: () => void;
};

const ActivityChip = ({label, symbol, onPress}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const glyph = symbol ?? label.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.chip, pressed && onPress ? styles.chipPressed : null]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{glyph}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm + 2,
      borderRadius: t.radius.pill,
      backgroundColor: c.chip,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderPill,
    },
    chipPressed: {opacity: 0.72},
    iconWrap: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    icon: {
      fontSize: 11,
      fontWeight: '800',
      color: c.primary,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      maxWidth: 140,
    },
  });

export default ActivityChip;
