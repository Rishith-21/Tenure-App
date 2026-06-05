import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

const StatPill = ({label, value, hint, accent = false}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens, accent), [colors, tokens, accent]);

  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
  accent: boolean,
) =>
  StyleSheet.create({
    pill: {
      flex: 1,
      minWidth: 72,
      backgroundColor: c.cardMuted,
      borderRadius: 14,
      paddingHorizontal: t.spacing.md,
      paddingVertical: t.spacing.sm + 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    label: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: c.textMuted,
      marginBottom: 2,
    },
    value: {
      fontSize: 15,
      fontWeight: '800',
      color: accent ? c.success : c.text,
      letterSpacing: -0.3,
    },
    hint: {
      fontSize: 11,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 1,
    },
  });

export default StatPill;
