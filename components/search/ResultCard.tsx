import React, {useMemo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {SearchMateUser} from '../../data/mockSearchResults';
import {isSearchMateVerified} from '../../utils/searchMateBadges';
import {useSearchElevated} from './SearchElevationContext';
import {S, getSearchShadowCard} from './searchTheme';
import VerifiedBadge from './VerifiedBadge';

type Props = {
  user: SearchMateUser;
  onPress?: () => void;
  available?: boolean;
};

const ResultCard = ({user, onPress, available = true}: Props) => {
  const category = user.categories[0] ?? 'Mate';
  const verified = useMemo(() => isSearchMateVerified(user.id), [user.id]);
  const elevated = useSearchElevated();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        getSearchShadowCard(elevated),
        pressed && styles.pressed,
      ]}>
      <Image source={{uri: user.avatar}} style={styles.avatar} />

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          {verified ? <VerifiedBadge compact /> : null}
          {user.isNew ? (
            <View style={styles.newPill}>
              <Text style={styles.newText}>NEW</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.metaLine} numberOfLines={1}>
          {user.district} · ★ {(user.rating ?? 4.8).toFixed(1)} · ₹
          {user.ratePerHour}/hr
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: available ? S.success : S.textMuted},
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {color: available ? S.success : S.textMuted},
            ]}>
            {available ? 'Available now' : 'Busy today'}
          </Text>
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
};

export default ResultCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: S.card,
    borderRadius: 18,
    padding: 12,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: S.border,
    gap: 12,
  },
  pressed: {opacity: 0.9, backgroundColor: S.inputBgAlt},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: S.primarySoft,
  },
  body: {flex: 1, minWidth: 0},
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: S.text,
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  newPill: {
    backgroundColor: S.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newText: {
    fontSize: 9,
    fontWeight: '800',
    color: S.primary,
    letterSpacing: 0.4,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: S.primary,
    marginBottom: 2,
  },
  metaLine: {
    fontSize: 12,
    fontWeight: '500',
    color: S.textSecondary,
    marginBottom: 4,
  },
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  statusDot: {width: 6, height: 6, borderRadius: 3},
  statusText: {fontSize: 11, fontWeight: '700'},
  chevron: {
    fontSize: 24,
    color: S.textMuted,
    fontWeight: '300',
    marginLeft: 2,
  },
});
