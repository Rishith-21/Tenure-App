import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import BackArrowIcon from './BackArrowIcon';
import {useSearchElevated} from './SearchElevationContext';
import {S, getSearchShadowSoft} from './searchTheme';

type Props = {
  onBack: () => void;
  topInset?: number;
  /** Hide subtitle when user is in results / active search */
  showSubtitle?: boolean;
  mode?: 'search' | 'instants';
  onModeChange?: (mode: 'search' | 'instants') => void;
};

const SearchHeader = ({
  onBack,
  topInset = 0,
  showSubtitle = true,
  mode = 'search',
  onModeChange,
}: Props) => {
  const elevated = useSearchElevated();
  const tabs: Array<{
    id: 'search' | 'instants';
    label: string;
    subtitle: string;
  }> = [
    {
      id: 'search',
      label: 'Search',
      subtitle: 'Find the right mate',
    },
    {
      id: 'instants',
      label: 'Instants',
      subtitle: 'Ready right now',
    },
  ];

  return (
  <View style={[styles.appBar, {paddingTop: topInset + 16}]}>
    <Pressable
      onPress={onBack}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({pressed}) => [styles.backBtn, getSearchShadowSoft(elevated), pressed && styles.pressed]}>
      <BackArrowIcon color={S.primary} size={13} />
    </Pressable>

    <View style={styles.tabRow}>
      {tabs.map(tab => {
        const selected = mode === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onModeChange?.(tab.id)}
            hitSlop={6}
            style={({pressed}) => [
              styles.topTab,
              selected && styles.topTabActive,
              getSearchShadowSoft(elevated && selected),
              pressed && styles.pressed,
            ]}>
            <View style={styles.topTabTitleRow}>
              {tab.id === 'instants' ? (
                <View
                  style={[
                    styles.liveDot,
                    selected && styles.liveDotActive,
                  ]}
                />
              ) : null}
              <Text
                style={[
                  styles.topTabText,
                  selected && styles.topTabTextActive,
                ]}>
                {tab.label}
              </Text>
            </View>
            {showSubtitle ? (
              <Text
                style={[
                  styles.topTabSub,
                  selected && styles.topTabSubActive,
                ]}
                numberOfLines={1}>
                {tab.subtitle}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  </View>
  );
};

export default SearchHeader;

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    marginHorizontal: -20,
    marginBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: S.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: S.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tabRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 10,
  },
  topTab: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: S.inputBgAlt,
    borderWidth: 1,
    borderColor: S.border,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topTabActive: {
    backgroundColor: S.card,
    borderColor: S.primary,
  },
  topTabTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: S.textMuted,
  },
  liveDotActive: {
    backgroundColor: S.success,
  },
  topTabText: {
    fontSize: 15,
    fontWeight: '900',
    color: S.textMuted,
    letterSpacing: -0.2,
  },
  topTabTextActive: {
    color: S.text,
  },
  topTabSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: S.textMuted,
    marginTop: 2,
  },
  topTabSubActive: {
    color: S.textSecondary,
  },
  pressed: {opacity: 0.72},
});
