import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {S} from './searchTheme';

type Props = {
  query: string;
  onPress: () => void;
};

const RecentSearchRow = ({query, onPress}: Props) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.row, pressed && styles.pressed]}>
    <View style={styles.iconWrap}>
      <Text style={styles.iconLabel}>⌕</Text>
    </View>
    <Text style={styles.query} numberOfLines={1}>
      {query}
    </Text>
    <Text style={styles.chevron}>›</Text>
  </Pressable>
);

export default RecentSearchRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 10,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: S.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: S.primary,
  },
  query: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: S.text,
  },
  chevron: {
    fontSize: 20,
    color: S.textMuted,
    fontWeight: '300',
  },
  pressed: {opacity: 0.7},
});
