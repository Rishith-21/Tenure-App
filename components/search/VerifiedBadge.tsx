import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {S} from './searchTheme';

type Props = {
  style?: ViewStyle;
  compact?: boolean;
};

const VerifiedBadge = ({style, compact}: Props) => (
  <View style={[styles.badge, compact && styles.badgeCompact, style]}>
    <View style={styles.dot} />
    <Text style={[styles.text, compact && styles.textCompact]}>Verified</Text>
  </View>
);

export default VerifiedBadge;

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: S.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(1,69,105,0.18)',
  },
  badgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: S.primary,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: S.primary,
    letterSpacing: 0.2,
  },
  textCompact: {
    fontSize: 9,
  },
});
