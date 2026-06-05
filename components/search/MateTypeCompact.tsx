import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {MateTypeItem} from './MateTypeCard';
import {useSearchElevated} from './SearchElevationContext';
import {S, getSearchShadowCard} from './searchTheme';

type Props = {
  item: MateTypeItem;
  selected?: boolean;
  onPress: () => void;
};

const MateTypeCompact = ({item, selected = false, onPress}: Props) => {
  const elevated = useSearchElevated();

  return (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [
      styles.card,
      getSearchShadowCard(elevated),
      selected && styles.cardSelected,
      pressed && styles.pressed,
    ]}>
    <View style={[styles.badge, selected && styles.badgeSelected]}>
      <Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>
        {item.badge}
      </Text>
    </View>
    <Text
      style={[styles.label, selected && styles.labelSelected]}
      numberOfLines={2}>
      {item.label}
    </Text>
  </Pressable>
  );
};

export default MateTypeCompact;

const styles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: S.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: S.border,
    minHeight: 96,
  },
  cardSelected: {
    borderColor: S.primary,
    backgroundColor: S.primarySoft,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: S.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeSelected: {backgroundColor: S.primary},
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: S.primary,
  },
  badgeTextSelected: {color: '#FFFFFF'},
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: S.text,
    lineHeight: 16,
  },
  labelSelected: {color: S.primaryDark},
  pressed: {opacity: 0.88},
});
