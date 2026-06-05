import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';

type Props = {
  value: string;
  label: string;
  accent?: boolean;
};

const TrustMetricPill = ({value, label, accent}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.pill, accent && styles.pillAccent]}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
};

export default TrustMetricPill;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    pill: {
      flex: 1,
      minWidth: 72,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 14,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      alignItems: 'center',
    },
    pillAccent: {
      backgroundColor: c.chip,
      borderColor: c.brandMuted,
    },
    value: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      letterSpacing: -0.2,
      textAlign: 'center',
    },
    valueAccent: {
      color: c.brand,
    },
    label: {
      fontSize: 11,
      color: c.textMuted,
      marginTop: 3,
      textAlign: 'center',
    },
  });
