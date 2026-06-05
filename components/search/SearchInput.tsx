import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useSearchElevated} from './SearchElevationContext';
import {S, getSearchShadowSoft} from './searchTheme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  inputRef?: React.RefObject<TextInput | null>;
  autoFocus?: boolean;
  onOpenFilters?: () => void;
  onClear?: () => void;
  showClear?: boolean;
  filterActive?: boolean;
  activeFilterCount?: number;
};

const SearchInput = ({
  value,
  onChangeText,
  inputRef,
  autoFocus = false,
  onOpenFilters,
  onClear,
  showClear = false,
  filterActive = false,
  activeFilterCount = 0,
}: Props) => {
  const elevated = useSearchElevated();

  return (
  <View style={[styles.wrap, getSearchShadowSoft(elevated)]}>
    <Text style={styles.searchGlyph} accessibilityLabel="Search">
      ⌕
    </Text>
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder="Search mates, categories, location, ID..."
      placeholderTextColor={S.textMuted}
      style={styles.input}
      autoFocus={autoFocus}
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
    />
    <View style={styles.trailing}>
      {showClear ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityLabel="Clear search"
          style={({pressed}) => [styles.trailingBtn, pressed && styles.pressed]}>
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      ) : null}
      {onOpenFilters ? (
        <Pressable
          onPress={onOpenFilters}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          style={({pressed}) => [
            styles.trailingBtn,
            styles.filterBtn,
            filterActive && styles.filterBtnActive,
            pressed && styles.pressed,
          ]}>
          <View style={styles.filterIcon}>
            <View
              style={[
                styles.filterLine,
                filterActive && styles.filterLineOn,
              ]}
            />
            <View
              style={[
                styles.filterLine,
                styles.filterLineMid,
                filterActive && styles.filterLineOn,
              ]}
            />
            <View
              style={[
                styles.filterLine,
                filterActive && styles.filterLineOn,
              ]}
            />
          </View>
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: S.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: S.border,
    minHeight: 54,
    paddingLeft: 16,
    paddingRight: 8,
  },
  searchGlyph: {
    fontSize: 18,
    color: S.primary,
    marginRight: 10,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: S.text,
    paddingVertical: 10,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trailingBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 20,
    color: S.textSecondary,
    fontWeight: '600',
    marginTop: -2,
  },
  filterBtn: {
    backgroundColor: S.primarySoft,
  },
  filterBtnActive: {
    backgroundColor: S.primary,
  },
  filterIcon: {gap: 3, alignItems: 'flex-end'},
  filterLine: {
    height: 2,
    width: 13,
    borderRadius: 1,
    backgroundColor: S.primary,
  },
  filterLineMid: {width: 8, alignSelf: 'center'},
  filterLineOn: {backgroundColor: '#FFFFFF'},
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: S.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: S.inputBg,
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  pressed: {opacity: 0.7},
});
