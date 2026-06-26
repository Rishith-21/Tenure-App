import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {HistoryAlert, HistoryAlertKind} from '../../types/historyAlert';
import {useTheme} from '../../context/ThemeContext';

const ICONS: Record<HistoryAlertKind, string> = {
  request_accepted: 'OK',
  meet_canceled: 'X',
  meet_expired: '!',
};

type Props = {
  alert: HistoryAlert;
  onFeedback: () => void;
};

const HistoryAlertRow = ({alert, onFeedback}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.timestamp}>{alert.timestamp}</Text>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
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
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    icon: {
      fontSize: 11,
      color: c.textSecondary,
      fontWeight: '800',
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
