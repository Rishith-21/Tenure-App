import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSearchElevated} from './SearchElevationContext';
import {S, getSearchShadowCard} from './searchTheme';

export type MateTypeItem = {
  id: string;
  label: string;
  subtitle: string;
  badge: string;
  filterLabel: string;
};

type Props = {
  item: MateTypeItem;
  selected?: boolean;
  onPress: () => void;
};

const MateTypeCard = ({item, selected = false, onPress}: Props) => {
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
    <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
      {item.label}
    </Text>
    <Text
      style={[styles.subtitle, selected && styles.subtitleSelected]}
      numberOfLines={1}>
      {item.subtitle}
    </Text>
  </Pressable>
  );
};

export default MateTypeCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: S.card,
    borderRadius: 22,
    padding: 14,
    height: 112,
    borderWidth: 1,
    borderColor: S.border,
  },
  cardSelected: {
    borderColor: S.primary,
    backgroundColor: S.primarySoft,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: S.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeSelected: {backgroundColor: S.primary},
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: S.primary,
    letterSpacing: 0.3,
  },
  badgeTextSelected: {color: '#FFFFFF'},
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: S.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  labelSelected: {color: S.primaryDark},
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: S.textMuted,
    lineHeight: 15,
  },
  subtitleSelected: {color: S.textSecondary},
  pressed: {opacity: 0.9, transform: [{scale: 0.98}]},
});
