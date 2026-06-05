import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';
import {formatAvailabilityDays} from '../../../utils/mateProfileDisplay';

type Props = {
  days: string[];
  timeRange: string;
  statusLabel?: string | null;
};

const AvailabilityCard = ({days, timeRange, statusLabel}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const daysLine = days.length > 0 ? formatAvailabilityDays(days) : '—';

  return (
    <View style={styles.card}>
      {statusLabel ? (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        <View style={styles.block}>
          <View style={styles.blockMark} />
          <Text style={styles.blockLabel}>Available on</Text>
          <Text style={styles.blockValue}>{daysLine}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.block}>
          <View style={[styles.blockMark, styles.blockMarkAlt]} />
          <Text style={styles.blockLabel}>Time</Text>
          <Text style={styles.blockValue}>{timeRange}</Text>
        </View>
      </View>
    </View>
  );
};

export default AvailabilityCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      borderRadius: 16,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 14,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: c.meetConfirmedCardBg,
      marginBottom: 12,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.success,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '500',
      color: c.success,
    },
    grid: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    block: {
      flex: 1,
      paddingHorizontal: 4,
    },
    divider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginHorizontal: 8,
    },
    blockMark: {
      width: 4,
      height: 14,
      borderRadius: 2,
      backgroundColor: c.brand,
      marginBottom: 8,
      opacity: 0.55,
    },
    blockMarkAlt: {
      height: 4,
      width: 14,
      opacity: 0.4,
    },
    blockLabel: {
      fontSize: 11,
      color: c.textHint,
      marginBottom: 4,
    },
    blockValue: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      lineHeight: 20,
    },
  });
