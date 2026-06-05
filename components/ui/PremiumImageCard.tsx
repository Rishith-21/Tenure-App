import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import AppBadge from './AppBadge';

const {width: SCREEN_W} = Dimensions.get('window');
const CARD_W = SCREEN_W - 40;

type Props = {
  imageUri: string;
  title: string;
  subtitle?: string;
  price?: string;
  rating?: number;
  tags?: string[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPress?: () => void;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  width?: number;
};

/** Image-first premium card — travel/property booking aesthetic */
const PremiumImageCard = ({
  imageUri,
  title,
  subtitle,
  price,
  rating,
  tags = [],
  isFavorite = false,
  onToggleFavorite,
  onPress,
  badge,
  style,
  width = CARD_W,
}: Props) => {
  const {colors, tokens} = useTheme();
  const imageH = width * 0.72;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        {
          width,
          borderRadius: tokens.radius.lg,
          ...tokens.shadows.card(colors.shadow),
          transform: [{scale: pressed ? tokens.motion.pressScale : 1}],
        },
        style,
      ]}>
      <View style={[styles.imageWrap, {height: imageH, borderRadius: tokens.radius.lg}]}>
        <Image source={{uri: imageUri}} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={[styles.imageOverlay, {borderRadius: tokens.radius.lg}]} />
        {badge ? (
          <View style={styles.badgeSlot}>
            <AppBadge label={badge} variant="info" />
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable
            onPress={e => {
              e.stopPropagation?.();
              onToggleFavorite();
            }}
            hitSlop={12}
            style={[
              styles.favBtn,
              {backgroundColor: colors.glass, borderRadius: tokens.radius.pill},
            ]}>
            <Text style={[styles.favIcon, {color: isFavorite ? colors.favorite : colors.text}]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[tokens.typography.h3, styles.title, {color: colors.text}]} numberOfLines={1}>
            {title}
          </Text>
          {rating != null ? (
            <View style={styles.ratingRow}>
              <Text style={[styles.star, {color: colors.rating}]}>★</Text>
              <Text style={[tokens.typography.caption, {color: colors.text, fontWeight: '700'}]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>

        {subtitle ? (
          <Text style={[tokens.typography.caption, {color: colors.textMuted}]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        {tags.length > 0 ? (
          <View style={styles.tags}>
            {tags.slice(0, 3).map(tag => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.chip,
                    borderRadius: tokens.radius.pill,
                  },
                ]}>
                <Text style={[tokens.typography.caption, {color: colors.textSecondary, fontSize: 11}]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {price ? (
          <Text style={[tokens.typography.bodyMedium, styles.price, {color: colors.text}]}>
            {price}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default PremiumImageCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  imageWrap: {
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  badgeSlot: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  favBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 20,
    lineHeight: 22,
  },
  body: {
    paddingTop: 14,
    paddingHorizontal: 4,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    fontSize: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  price: {
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
