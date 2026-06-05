import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Status = 'verified' | 'pending';

type Props = {
  label: string;
  status: Status;
};

const TrustRow = ({label, status}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(
    () => createStyles(colors, tokens, status),
    [colors, tokens, status],
  );

  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.status}>{status === 'verified' ? 'Verified' : 'Pending'}</Text>
    </View>
  );
};

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
  status: Status,
) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: t.spacing.sm + 2,
      gap: t.spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: status === 'verified' ? c.success : c.warning,
    },
    label: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    status: {
      fontSize: 13,
      fontWeight: '700',
      color: status === 'verified' ? c.success : c.textMuted,
    },
  });

export default TrustRow;
