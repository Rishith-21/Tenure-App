import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {HistoryAlert, HistoryAlertKind} from '../../types/historyAlert';
import {useTheme} from '../../context/ThemeContext';

const ICONS: Record<HistoryAlertKind, string> = {
  request_accepted: '✓',
  meet_canceled: '✕',
  payment_canceled: '₹',
  meet_expired: '🕐',
  payment_sent: '₹',
  payment_received: '₹',
};

type Props = {
  alert: HistoryAlert;
  onFeedback: () => void;
};

const HistoryAlertRow = ({alert, onFeedback}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const paymentKind =
    alert.kind === 'payment_sent' ||
    alert.kind === 'payment_received' ||
    alert.kind === 'payment_canceled';

  return (
    <View style={styles.wrap}>
      <Text style={styles.timestamp}>{alert.timestamp}</Text>
      <View style={[styles.card, paymentKind && styles.cardPayment]}>
        <View style={[styles.iconCircle, paymentKind && styles.iconCirclePayment]}>
          <Text style={styles.icon}>{ICONS[alert.kind]}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {alert.message}
        </Text>
        <Pressable onPress={onFeedback} hitSlop={8} style={styles.feedbackBtn}>
          <Text style={styles.feedback}>Feedback</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default HistoryAlertRow;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrap: {
      marginBottom: 14,
    },
    timestamp: {
      fontSize: 11,
      color: c.textHint,
      marginBottom: 6,
      marginLeft: 4,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bg,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      minHeight: 56,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    cardPayment: {
      backgroundColor: c.bgElevated,
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    iconCirclePayment: {
      backgroundColor: c.meetPendingConfirmCardBg,
    },
    icon: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: '700',
    },
    message: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
      lineHeight: 18,
      marginRight: 8,
    },
    feedbackBtn: {
      borderRadius: 999,
      backgroundColor: c.chip,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    feedback: {
      fontSize: 10,
      color: c.textSecondary,
      fontWeight: '700',
    },
  });
