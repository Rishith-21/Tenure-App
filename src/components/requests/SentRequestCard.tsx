import React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {MateRequest} from '../../types/mateRequest';
import {formatPartnerLabel} from '../../utils/requestLabels';

type Props = {
  request: MateRequest;
  onPress: () => void;
  onCancel: () => void;
};

const SentRequestCard = ({request, onPress, onCancel}: Props) => {
  const role = formatPartnerLabel(request.categoryLabel);

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      <Image source={{uri: request.mateAvatar}} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.name}>{request.mateName}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>

      <View style={styles.actions}>
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
          <Text style={styles.deliveredIcon}>✓✓</Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default SentRequestCard;

const styles = StyleSheet.create({
  cardPressed: {
    opacity: 0.94,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003B57',
    borderRadius: 22,
    padding: 14,
    paddingRight: 16,
    marginBottom: 14,
    minHeight: 88,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  role: {
    color: '#B8D4E3',
    fontSize: 13,
    marginTop: 5,
    textTransform: 'lowercase',
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 88,
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cancelPressed: {
    opacity: 0.85,
  },
  cancelText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },
  deliveredIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    opacity: 0.9,
  },
});
