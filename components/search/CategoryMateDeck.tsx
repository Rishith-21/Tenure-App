import React, {useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {MATE_CATEGORIES, PRIMARY_MATE_COUNT} from '../../constants/mateCategories';
import {useTheme} from '../../context/ThemeContext';
import {
  getCategoryDeckMeta,
  shortCategoryLabel,
} from './categoryDeckMeta';

const DECK_CARD_WIDTH = 96;
const DECK_CARD_HEIGHT = 140;
const DECK_CARD_GAP = 10;
const DECK_SNAP = DECK_CARD_WIDTH + DECK_CARD_GAP;
const MINI_CHIP_GAP = 8;

type Props = {
  selectedCategory: string | null;
  onSelect: (label: string) => void;
};

const normalize = (text: string) => text.trim().toLowerCase();

const CategoryMateDeck = ({selectedCategory, onSelect}: Props) => {
  const {colors, isDark} = useTheme();
  const styles = useMemo(
    () => createStyles(colors, isDark),
    [colors, isDark],
  );
  const deckRef = useRef<ScrollView>(null);

  const featured = MATE_CATEGORIES.slice(0, PRIMARY_MATE_COUNT);
  const more = MATE_CATEGORIES.slice(PRIMARY_MATE_COUNT);

  const isSelected = (label: string) =>
    selectedCategory != null &&
    normalize(selectedCategory) === normalize(label);

  const onDeckScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / DECK_SNAP);
    deckRef.current?.scrollTo({x: idx * DECK_SNAP, animated: true});
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.introBlock}>
        <Text style={styles.kicker}>Explore</Text>
        <Text style={styles.headline}>What kind of mate?</Text>
        <Text style={styles.subline}>
          Slide the deck or pick any type below
        </Text>
      </View>

      <ScrollView
        ref={deckRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={DECK_SNAP}
        snapToAlignment="start"
        disableIntervalMomentum
        style={styles.deckScroll}
        contentContainerStyle={styles.deckRow}
        onMomentumScrollEnd={onDeckScrollEnd}
        keyboardShouldPersistTaps="handled">
        {featured.map((cat, index) => {
          const meta = getCategoryDeckMeta(cat, index);
          const selected = isSelected(cat.label);
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect(cat.label)}
              style={({pressed}) => [
                styles.deckCard,
                selected && styles.deckCardSelected,
                pressed && styles.deckCardPressed,
              ]}>
              <View
                style={[
                  styles.glyphRing,
                  {
                    backgroundColor: selected
                      ? meta.accent
                      : meta.accentSoft,
                    borderColor: selected ? meta.accent : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.glyphText,
                    {color: selected ? '#FFFFFF' : meta.accent},
                  ]}>
                  {meta.glyph}
                </Text>
              </View>
              <Text
                style={[styles.deckTitle, selected && styles.deckTitleSelected]}
                numberOfLines={1}>
                {shortCategoryLabel(cat.label)}
              </Text>
              <Text style={styles.deckTagline} numberOfLines={1}>
                {meta.tagline}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {more.length > 0 ? (
        <View style={styles.moreBlock}>
          <Text style={styles.moreLabel}>More mate types</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moreRow}
            keyboardShouldPersistTaps="handled">
            {more.map((cat, index) => {
              const meta = getCategoryDeckMeta(
                cat,
                index + PRIMARY_MATE_COUNT,
              );
              const selected = isSelected(cat.label);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => onSelect(cat.label)}
                  style={({pressed}) => [
                    styles.miniChip,
                    selected && styles.miniChipSelected,
                    pressed && styles.miniChipPressed,
                  ]}>
                  <View
                    style={[
                      styles.miniDot,
                      {
                        backgroundColor: selected
                          ? meta.accent
                          : meta.accentSoft,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.miniChipText,
                      selected && styles.miniChipTextSelected,
                    ]}>
                    {shortCategoryLabel(cat.label)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

export default CategoryMateDeck;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  isDark: boolean,
) =>
  StyleSheet.create({
    wrap: {
      flexGrow: 0,
    },
    deckScroll: {
      height: DECK_CARD_HEIGHT,
      flexGrow: 0,
    },
    introBlock: {
      marginBottom: 16,
      paddingTop: 6,
      paddingRight: 8,
    },
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brand,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    headline: {
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.6,
      lineHeight: 26,
    },
    subline: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textHint,
      marginTop: 6,
      lineHeight: 18,
    },
    deckRow: {
      alignItems: 'flex-start',
      gap: DECK_CARD_GAP,
      paddingRight: 12,
    },
    deckCard: {
      width: DECK_CARD_WIDTH,
      height: DECK_CARD_HEIGHT,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 18,
      backgroundColor: c.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    deckCardSelected: {
      borderColor: c.brand,
      backgroundColor: isDark ? c.chip : '#FFFFFF',
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDark ? 0.2 : 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    deckCardPressed: {
      opacity: 0.92,
      transform: [{scale: 0.98}],
    },
    glyphRing: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      marginBottom: 10,
    },
    glyphText: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    deckTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
      letterSpacing: -0.2,
      textAlign: 'center',
    },
    deckTitleSelected: {
      color: c.brand,
    },
    deckTagline: {
      fontSize: 10,
      fontWeight: '500',
      color: c.textHint,
      marginTop: 3,
      textAlign: 'center',
      maxWidth: '100%',
    },
    moreBlock: {
      marginTop: 18,
      paddingTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    moreLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textHint,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    moreRow: {
      gap: MINI_CHIP_GAP,
      paddingRight: 8,
    },
    miniChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.bg,
    },
    miniChipSelected: {
      borderColor: c.brand,
      backgroundColor: c.chip,
    },
    miniChipPressed: {
      opacity: 0.9,
    },
    miniDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    miniChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    miniChipTextSelected: {
      color: c.brand,
      fontWeight: '700',
    },
  });
