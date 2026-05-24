import React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import {MateRequest} from '../../types/mateRequest';

type Props = {
  request: MateRequest;
  subtitle?: string;
  onPress?: () => void;
};

const RequestListCard = ({request, subtitle, onPress}: Props) => {
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
        <Text style={styles.name}>{request.mateName}</Text>
        <Text style={styles.subtitle}>{line}</Text>
      </View>
    </Pressable>
  );
};

export default RequestListCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003B57',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  pressed: {
    opacity: 0.92,
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
    marginLeft: 14,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#B8D4E3',
    fontSize: 14,
    marginTop: 6,
    textTransform: 'lowercase',
  },
});
