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
};

const SearchHeader = ({
  onBack,
  topInset = 0,
  showSubtitle = true,
}: Props) => {
  const elevated = useSearchElevated();

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

    <View style={styles.titleBlock}>
      <Text style={styles.title}>Search</Text>
      {showSubtitle ? (
        <Text style={styles.subtitle}>Find the right mate for today</Text>
      ) : null}
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
  titleBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: S.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: S.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  pressed: {opacity: 0.72},
});
