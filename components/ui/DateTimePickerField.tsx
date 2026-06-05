import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {
  formatMateDateOnly,
  formatTime12h,
} from '../../utils/meetTime';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

type Props = {
  value: Date;
  mode?: DateTimePickerMode;
  label?: string;
  hint?: string;
  compact?: boolean;
  /** Dark surfaces for mate-request drawer. */
  tone?: 'light' | 'dark';
  onPress: () => void;
};

const coerceDate = (value: Date): Date =>
  value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : new Date(value);

const DateTimePickerField = ({
  value,
  mode = 'datetime',
  label,
  hint,
  compact = false,
  tone = 'light',
  onPress,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(
    () => createStyles(colors, compact, tone),
    [colors, compact, tone],
  );
  const dateValue = coerceDate(value);

  const display = useMemo(() => {
    if (mode === 'time') {
      return formatTime12h(dateValue);
    }
    if (mode === 'date') {
      return formatMateDateOnly(dateValue);
    }
    return `${formatMateDateOnly(dateValue)} · ${formatTime12h(dateValue)}`;
  }, [dateValue, mode]);

  const microLabel = mode === 'time' ? 'Time' : 'Date';

  return (
    <View style={styles.wrap}>
      {label && !compact ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <Pressable
        style={({pressed}) => [styles.field, pressed && styles.fieldPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label ?? microLabel}>
        {compact ? (
          <Text style={styles.microLabel}>{microLabel}</Text>
        ) : null}
        <Text style={styles.value} numberOfLines={1}>
          {display}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      {hint && !compact ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

export default DateTimePickerField;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  compact: boolean,
  tone: 'light' | 'dark',
) => {
  const dark = tone === 'dark';
  return StyleSheet.create({
    wrap: {
      flex: 1,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: dark ? '#9A9A9A' : c.textSecondary,
      marginBottom: 6,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: compact ? 44 : 52,
      borderRadius: compact ? 12 : 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: dark ? '#333333' : c.border,
      backgroundColor: dark ? '#1A1A1A' : compact ? c.bg : c.bgElevated,
      paddingHorizontal: compact ? 10 : 12,
      gap: compact ? 6 : 8,
    },
    fieldPressed: {
      borderColor: c.brand,
      backgroundColor: dark ? '#252525' : c.chip,
    },
    microLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: dark ? '#6B6B6B' : c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      width: 34,
    },
    value: {
      flex: 1,
      fontSize: compact ? 13 : 14,
      fontWeight: '700',
      color: dark ? '#F0F0F0' : c.text,
    },
    chevron: {
      fontSize: 18,
      color: dark ? '#666666' : c.textHint,
      fontWeight: '300',
    },
    hint: {
      fontSize: 11,
      color: dark ? '#6B6B6B' : c.textHint,
      marginTop: 5,
    },
  });
};
