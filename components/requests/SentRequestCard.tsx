import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {MateRequest} from '../../types/mateRequest';
import {formatPartnerLabel} from '../../utils/requestLabels';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  request: MateRequest;
  onPress: () => void;
  onCancel: () => void;
};

const SentRequestCard = ({request, onPress, onCancel}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarUri = request.mateAvatar.trim();
  const avatarInitial = (request.mateName.trim().charAt(0) || 'T').toUpperCase();
  const role = formatPartnerLabel(request.categoryLabel);
  const actionLabel = request.status === 'confirmed' ? 'Open chat' : 'View';
  const statusLabel = request.status === 'confirmed' ? 'Confirmed' : 'Pending';

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      {avatarUri ? (
        <Image source={{uri: avatarUri}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{avatarInitial}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {request.mateName}
        </Text>
        <Text style={styles.meta}>ID · {request.mateTenureId}</Text>
        <Text style={styles.role} numberOfLines={1}>
          {role}
        </Text>
        <View style={styles.footerRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
          <Pressable
            style={({pressed}) => [styles.openBtn, pressed && styles.openPressed]}
            onPress={e => {
              e?.stopPropagation?.();
              onPress();
            }}>
            <Text style={styles.openText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.actionsCol}>
        <Pressable
          style={({pressed}) => [
            styles.cancelBtn,
            pressed && styles.cancelPressed,
          ]}
          onPress={e => {
            e?.stopPropagation?.();
            onCancel();
          }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        {request.delivered !== false ? (
          <Text style={styles.deliveredText}>Delivered</Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default SentRequestCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    cardPressed: {
      opacity: 0.94,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bg,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 12,
      marginBottom: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: c.chip,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontSize: 18,
      fontWeight: '900',
      color: c.brand,
    },
    info: {
      flex: 1,
      marginLeft: 12,
      marginRight: 10,
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
    role: {
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
    statusPill: {
      backgroundColor: c.chip,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    openBtn: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    openPressed: {opacity: 0.85},
    openText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brand,
    },
    actionsCol: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      minWidth: 78,
    },
    cancelBtn: {
      backgroundColor: c.bgElevated,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    cancelPressed: {
      opacity: 0.85,
    },
    cancelText: {
      color: c.danger,
      fontSize: 12,
      fontWeight: '700',
    },
    deliveredText: {
      color: c.textHint,
      fontSize: 10,
      fontWeight: '600',
      marginTop: 6,
    },
  });
