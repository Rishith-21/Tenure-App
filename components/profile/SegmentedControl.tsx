import React, {useMemo} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Option<T extends string> = {id: T; label: string};

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

function SegmentedControl<T extends string>({options, value, onChange}: Props<T>) {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  return (
    <View style={styles.track}>
      {options.map(option => {
        const active = value === option.id;
        return (
          <Pressable
            key={option.id}
            style={({pressed}) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && !active ? {opacity: 0.7} : null,
            ]}
            onPress={() => onChange(option.id)}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      backgroundColor: c.cardMuted,
      borderRadius: t.radius.sm,
      padding: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    segment: {
      flex: 1,
      paddingVertical: t.spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentActive: {
      backgroundColor: c.card,
      ...Platform.select({
        ios: t.shadows.soft(c.shadow),
        android: {elevation: 1},
        default: {},
      }),
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textMuted,
    },
    labelActive: {
      color: c.text,
      fontWeight: '700',
    },
  });

export default SegmentedControl;
