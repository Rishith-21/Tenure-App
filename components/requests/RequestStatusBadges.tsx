import React, {useMemo} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {MateRequest, MateRequestStatus} from '../../types/mateRequest';

type StatusTone = 'pending' | 'confirmed' | 'neutral' | 'negative';

const statusMeta = (
  status: MateRequestStatus,
  direction: MateRequest['direction'],
): {label: string; tone: StatusTone} => {
  switch (status) {
    case 'confirmed':
      return {label: 'Confirmed', tone: 'confirmed'};
    case 'declined':
    case 'cancelled':
      return {
        label: status === 'declined' ? 'Declined' : 'Cancelled',
        tone: 'negative',
      };
    case 'expired':
      return {label: 'Expired', tone: 'neutral'};
    default:
      return {
        label: direction === 'sent' ? 'Awaiting reply' : 'Needs your reply',
        tone: 'pending',
      };
  }
};

const toneStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tone: StatusTone,
): ViewStyle & {labelColor: string} => {
  switch (tone) {
    case 'confirmed':
      return {
        backgroundColor: c.meetConfirmedCardBg,
        borderColor: c.meetConfirmedCardBorder,
        labelColor: c.success,
      };
    case 'negative':
      return {
        backgroundColor: '#FFF5F5',
        borderColor: '#F5D0CC',
        labelColor: c.danger,
      };
    case 'neutral':
      return {
        backgroundColor: c.chip,
        borderColor: c.border,
        labelColor: c.textMuted,
      };
    default:
      return {
        backgroundColor: c.meetPendingConfirmCardBg,
        borderColor: c.meetPendingConfirmCardBorder,
        labelColor: c.brand,
      };
  }
};

type Props = {
  request: MateRequest;
};

const RequestStatusBadges = ({request}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const status = statusMeta(request.status, request.direction);
  const statusStyle = toneStyles(colors, status.tone);

  return (
    <View style={styles.row}>
      <View style={styles.directionBadge}>
        <Text style={styles.directionText}>
          {request.direction === 'sent' ? 'Sent request' : 'Incoming request'}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusStyle.backgroundColor,
            borderColor: statusStyle.borderColor,
          },
        ]}>
        <Text style={[styles.statusText, {color: statusStyle.labelColor}]}>
          {status.label}
        </Text>
      </View>
    </View>
  );
};

export default RequestStatusBadges;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 14,
    },
    directionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    directionText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
    },
  });
