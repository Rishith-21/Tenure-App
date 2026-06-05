import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {MateRequest} from '../../types/mateRequest';
import {
  calcMeetDurationMinutes,
  formatDurationHuman,
  formatMeetFromTo,
} from '../../utils/meetTime';

type Props = {
  request: MateRequest;
};

const MateRequestMeetCard = ({request}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const meetDuration = calcMeetDurationMinutes(
    request.fromDateTime,
    request.toDateTime,
  );
  const schedule = formatMeetFromTo(
    request.fromDateTime,
    request.toDateTime,
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Meet details</Text>
      <Text style={styles.category}>{request.categoryLabel}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{request.meetLocation}</Text>
      </View>
      {schedule.sameDay ? (
        <View style={styles.row}>
          <Text style={styles.label}>When</Text>
          <Text style={styles.value}>
            {schedule.date} · {schedule.from}
            {schedule.from !== schedule.to ? ` – ${schedule.to}` : ''}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{schedule.from}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{schedule.to}</Text>
          </View>
        </>
      )}

      {meetDuration != null && meetDuration > 0 ? (
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>
            {formatDurationHuman(meetDuration)}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sentAt}>Sent {request.sentAt}</Text>
    </View>
  );
};

export default MateRequestMeetCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: 14,
      backgroundColor: c.meetLiveCardBg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.meetLiveCardBorder,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      color: c.text,
      marginBottom: 4,
    },
    category: {
      fontSize: 16,
      fontWeight: '700',
      color: c.brandDark,
      marginBottom: 14,
    },
    row: {
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textHint,
      marginBottom: 4,
    },
    value: {
      fontSize: 14,
      color: c.text,
      lineHeight: 20,
    },
    durationPill: {
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: c.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    durationText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.brand,
    },
    sentAt: {
      fontSize: 12,
      color: c.textHint,
      marginTop: 12,
    },
  });
