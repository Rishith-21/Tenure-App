import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {HistoryAlert, HistoryAlertKind} from '../../types/historyAlert';

const ICONS: Record<HistoryAlertKind, string> = {
  request_accepted: '✓',
  meet_canceled: '✕',
  payment_canceled: '👛',
  meet_expired: '🕐',
  payment_sent: '👛',
  payment_received: '👛',
};

type Props = {
  alert: HistoryAlert;
  onFeedback: () => void;
};

const HistoryAlertRow = ({alert, onFeedback}: Props) => (
  <View style={styles.wrap}>
    <Text style={styles.timestamp}>{alert.timestamp}</Text>
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{ICONS[alert.kind]}</Text>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {alert.message}
      </Text>
      <Pressable onPress={onFeedback} hitSlop={8}>
        <Text style={styles.feedback}>Feedback</Text>
      </Pressable>
    </View>
  </View>
);

export default HistoryAlertRow;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    color: '#444444',
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A6FA8',
    lineHeight: 20,
    marginRight: 8,
  },
  feedback: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});
