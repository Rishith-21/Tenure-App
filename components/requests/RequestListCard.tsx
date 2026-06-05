import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {MateRequest} from '../../types/mateRequest';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  request: MateRequest;
  subtitle?: string;
  onPress?: () => void;
  statusText?: string;
  /** e.g. Sent vs Incoming on History cards */
  directionLabel?: 'Sent' | 'Incoming';
  actionText?: string;
  onActionPress?: () => void;
};

const RequestListCard = ({
  request,
  subtitle,
  onPress,
  statusText,
  directionLabel,
  actionText = 'View',
  onActionPress,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const line =
    subtitle ??
    (request.status === 'expired' && request.expiresInDays
      ? `Expired in ${request.expiresInDays} days`
      : request.categoryLabel);

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}>
      <Image source={{uri: request.mateAvatar}} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {request.mateName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          ID · {request.mateTenureId}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {line}
        </Text>
        <View style={styles.footerRow}>
          <View style={styles.pillRow}>
            {directionLabel ? (
              <View
                style={[
                  styles.directionPill,
                  directionLabel === 'Sent'
                    ? styles.directionPillSent
                    : styles.directionPillIncoming,
                ]}>
                <Text
                  style={[
                    styles.directionText,
                    directionLabel === 'Sent'
                      ? styles.directionTextSent
                      : styles.directionTextIncoming,
                  ]}>
                  {directionLabel}
                </Text>
              </View>
            ) : null}
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{statusText ?? 'Pending'}</Text>
            </View>
          </View>
          {onActionPress ? (
            <Pressable
              style={({pressed}) => [styles.actionBtn, pressed && styles.actionPressed]}
              onPress={e => {
                e?.stopPropagation?.();
                onActionPress();
              }}>
              <Text style={styles.actionText}>{actionText}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default RequestListCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bg,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    pressed: {
      opacity: 0.94,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: c.chip,
    },
    info: {
      flex: 1,
      marginLeft: 12,
    },
    name: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
    },
    meta: {
      color: c.textHint,
      fontSize: 11,
      marginTop: 2,
    },
    subtitle: {
      color: c.brand,
      fontSize: 12,
      marginTop: 6,
      fontWeight: '600',
    },
    footerRow: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    directionPill: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderWidth: StyleSheet.hairlineWidth,
    },
    directionPillSent: {
      backgroundColor: c.meetLiveCardBg,
      borderColor: c.meetLiveCardBorder,
    },
    directionPillIncoming: {
      backgroundColor: c.chip,
      borderColor: c.border,
    },
    directionText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.25,
      textTransform: 'uppercase',
    },
    directionTextSent: {
      color: c.brand,
    },
    directionTextIncoming: {
      color: c.textSecondary,
    },
    statusPill: {
      backgroundColor: c.chip,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusText: {
      color: c.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    actionBtn: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    actionPressed: {
      opacity: 0.85,
    },
    actionText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brand,
    },
  });
