import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {S} from './searchTheme';

type Props = {
  title?: string;
  message?: string;
};

const EmptyState = ({
  title = 'No mates found',
  message = 'Try another activity, location, or Tenure ID.',
}: Props) => (
  <View style={styles.wrap}>
    <View style={styles.iconCircle}>
      <Text style={styles.icon}>⌕</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: S.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    color: S.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: S.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: S.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
