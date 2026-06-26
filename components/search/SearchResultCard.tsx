import React, {useMemo} from 'react';
import {Image, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {SearchMateUser} from '../../data/mockSearchResults';
import {useTheme} from '../../context/ThemeContext';
import {isSearchMateVerified} from '../../utils/searchMateBadges';
import VerifiedBadge from './VerifiedBadge';

type Props = {
  user: SearchMateUser;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

const SearchResultCard = ({
  user,
  isFavorite,
  onToggleFavorite,
  onPress,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tags = user.categories.slice(0, 3);
  const verified = useMemo(() => isSearchMateVerified(user.id), [user.id]);
  const avatarUri = user.avatar.trim();
  const avatarInitial = (user.name.trim().charAt(0) || 'T').toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{uri: avatarUri}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
          )}
          {user.isNew ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            {verified ? <VerifiedBadge compact /> : null}
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {user.tenureId} · {user.district}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingVal}>
              {(user.rating ?? 4.8).toFixed(1)}
            </Text>
            <Text style={styles.ratingDot}>·</Text>
            <Text style={styles.ageText}>{user.age} yrs</Text>
          </View>
        </View>

        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          style={({pressed}) => [styles.heartBtn, pressed && {opacity: 0.6}]}>
          <Text style={[styles.heart, isFavorite && styles.heartActive]}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.tags}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rateWrap}>
          <Text style={styles.rate}>
            ₹{user.ratePerHour}
            <Text style={styles.ratePer}>/hr</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default SearchResultCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 14,
      ...Platform.select({
        ios: {
          shadowColor: c.shadow,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        android: {elevation: 2},
        default: {},
      }),
    },
    cardPressed: {opacity: 0.9, transform: [{scale: 0.995}]},

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatarWrap: {position: 'relative'},
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: c.chip,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontSize: 20,
      fontWeight: '900',
      color: c.brand,
    },
    newBadge: {
      position: 'absolute',
      top: -6,
      left: -4,
      backgroundColor: c.brand,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderWidth: 2,
      borderColor: c.card,
    },
    newBadgeText: {
      color: '#FFFFFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    info: {flex: 1, minWidth: 0},
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    name: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.3,
    },
    sub: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 2,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 5,
    },
    star: {fontSize: 12, color: c.rating},
    ratingVal: {fontSize: 13, fontWeight: '800', color: c.text},
    ratingDot: {fontSize: 13, color: c.textHint, marginHorizontal: 1},
    ageText: {fontSize: 12, fontWeight: '600', color: c.textMuted},
    heartBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    heart: {fontSize: 18, color: c.textMuted, marginTop: -1},
    heartActive: {color: c.favorite},

    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      gap: 10,
    },
    tags: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1},
    tag: {
      backgroundColor: c.chip,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.borderPill,
    },
    tagText: {fontSize: 11, fontWeight: '700', color: c.textSecondary},
    rateWrap: {flexShrink: 0},
    rate: {fontSize: 17, fontWeight: '900', color: c.brand, letterSpacing: -0.4},
    ratePer: {fontSize: 12, fontWeight: '700', color: c.textMuted},
  });
