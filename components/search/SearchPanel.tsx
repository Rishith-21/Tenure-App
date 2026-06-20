import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SearchMateUser} from '../../data/mockSearchResults';
import {searchMates} from '../../utils/api';
import {mapDiscoverMateToSearchUser} from '../../utils/discoverApiMapper';
import {getMateCategoryLabel} from '../../utils/mateCategoryUtils';
import {
  createDefaultSearchFilters,
  DEFAULT_SEARCH_FILTERS,
  getActiveFilterCount,
  getHourlyRateFilterLabel,
  SearchFilters,
} from './searchFilterConfig';
import SearchHeader from './SearchHeader';
import SearchInput from './SearchInput';
import FilterChip from './FilterChip';
import MateTypeCard from './MateTypeCard';
import MateTypeCompact from './MateTypeCompact';
import RecentSearchRow from './RecentSearchRow';
import ResultCard from './ResultCard';
import EmptyState from './EmptyState';
import {
  BROWSE_MATE_TYPES,
  FEATURED_MATE_TYPE_IDS,
  QUICK_FILTER_CHIPS,
  QuickFilterId,
  SUGGESTED_SEARCHES,
} from './searchBrowseData';
import {S, getSearchShadowCard} from './searchTheme';
import {SearchElevationProvider} from './SearchElevationContext';

const {width: SCREEN_W} = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PAD = 20;
const CARD_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP) / 2;

const normalize = (text: string) => text.trim().toLowerCase();

const matchesQuickFilters = (
  user: SearchMateUser,
  quick: Set<QuickFilterId>,
): boolean => {
  if (quick.has('under50') && user.ratePerHour >= 50) {
    return false;
  }
  if (quick.has('verified') && (user.rating ?? 0) < 4.7) {
    return false;
  }
  if (quick.has('available') && user.ratePerHour > 70) {
    return false;
  }
  return true;
};

export type SearchPanelProps = {
  onClose: () => void;
  stackNavigation?: {navigate: (name: string, params?: object) => void};
  autoFocus?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  hideSearchRow?: boolean;
  query?: string;
  onChangeQuery?: (value: string) => void;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
  onOpenFilters?: () => void;
  onClearFilters?: () => void;
  /** When false, cards use borders only (overlay open/close transitions). Default true. */
  elevated?: boolean;
};

const SearchPanel = ({
  onClose,
  stackNavigation,
  autoFocus = true,
  inputRef: externalInputRef,
  hideSearchRow = false,
  query: controlledQuery,
  onChangeQuery: onControlledQueryChange,
  filters: controlledFilters,
  onFiltersChange,
  onOpenFilters,
  onClearFilters,
  elevated = true,
}: SearchPanelProps) => {
  const insets = useSafeAreaInsets();
  const internalInputRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? internalInputRef;

  const [queryState, setQueryState] = useState('');
  const [filtersState, setFiltersState] =
    useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const query = controlledQuery ?? queryState;
  const setQuery = onControlledQueryChange ?? setQueryState;
  const filters = controlledFilters ?? filtersState;
  const setFilters = onFiltersChange ?? setFiltersState;

  const [quickFilters, setQuickFilters] = useState<Set<QuickFilterId>>(
    new Set(),
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [apiUsers, setApiUsers] = useState<SearchMateUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const activeFilterCount = getActiveFilterCount(filters);
  const hasQuery = normalize(query).length > 0;
  const showResults =
    hasQuery || activeFilterCount > 0 || quickFilters.size > 0;

  useEffect(() => {
    if (!showResults) {
      setApiUsers([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const mates = await searchMates({
          q: query,
          district: filters.district,
          category: filters.category,
          gender: filters.gender,
          ageRange: filters.ageRange,
          hourlyRateRange: filters.hourlyRateRange,
          customHourlyRateMin: filters.customHourlyRateMin,
          customHourlyRateMax: filters.customHourlyRateMax,
        });
        if (!cancelled) {
          setApiUsers(mates.map(mapDiscoverMateToSearchUser));
        }
      } catch {
        if (!cancelled) {
          setApiUsers([]);
          setSearchError('Could not load companions. Check your connection.');
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showResults, query, filters]);

  const filteredUsers = useMemo(() => {
    if (!showResults) {
      return [];
    }
    return apiUsers.filter(user => matchesQuickFilters(user, quickFilters));
  }, [apiUsers, quickFilters, showResults]);

  const toggleQuickFilter = useCallback(
    (id: QuickFilterId) => {
      const willSelect = !quickFilters.has(id);
      const nextQuick = new Set(quickFilters);
      if (willSelect) {
        nextQuick.add(id);
      } else {
        nextQuick.delete(id);
      }
      setQuickFilters(nextQuick);

      if (id === 'under50') {
        if (willSelect) {
          setFilters({
            ...filters,
            hourlyRateRange: 'custom',
            customHourlyRateMin: null,
            customHourlyRateMax: 50,
          });
        } else if (
          filters.hourlyRateRange === 'custom' &&
          filters.customHourlyRateMax === 50
        ) {
          setFilters({
            ...filters,
            hourlyRateRange: 'all',
            customHourlyRateMin: null,
            customHourlyRateMax: null,
          });
        }
      }
    },
    [quickFilters, filters, setFilters],
  );

  const addRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) {
      return;
    }
    setRecentSearches(prev => {
      const next = [t, ...prev.filter(x => normalize(x) !== normalize(t))];
      return next.slice(0, 6);
    });
  }, []);

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      const isSelected = filters.category === categoryId;
      if (isSelected) {
        setFilters({...filters, category: null});
        return;
      }
      setQuery('');
      setFilters({...filters, category: categoryId});
      addRecent(getMateCategoryLabel(categoryId) ?? categoryId);
    },
    [filters, setFilters, setQuery, addRecent],
  );

  const openMateProfile = useCallback(
    (userId: string) => {
      Keyboard.dismiss();
      if (hasQuery) {
        addRecent(query.trim());
      }
      stackNavigation?.navigate('MateProfile', {userId});
    },
    [stackNavigation, hasQuery, query, addRecent],
  );

  const clearAll = useCallback(() => {
    Keyboard.dismiss();
    setQuickFilters(new Set());
    if (onClearFilters) {
      onClearFilters();
    } else {
      setFilters(createDefaultSearchFilters());
      setQuery('');
    }
  }, [onClearFilters, setFilters, setQuery]);

  const canClear = activeFilterCount > 0 || hasQuery || quickFilters.size > 0;

  const clearLabel = useMemo(() => {
    const n =
      (hasQuery ? 1 : 0) + activeFilterCount + quickFilters.size;
    return n <= 1 ? 'Reset' : 'Clear all';
  }, [hasQuery, activeFilterCount, quickFilters.size]);

  const featuredTypes = useMemo(
    () => BROWSE_MATE_TYPES.filter(t => FEATURED_MATE_TYPE_IDS.includes(t.id)),
    [],
  );

  const gridTypes = useMemo(
    () => BROWSE_MATE_TYPES.filter(t => !FEATURED_MATE_TYPE_IDS.includes(t.id)),
    [],
  );

  const resultsTitle =
    filteredUsers.length === 0
      ? 'No companions yet'
      : filteredUsers.length === 1
        ? '1 mate found'
        : `${filteredUsers.length} mates found`;

  const hourlyRateLabel = getHourlyRateFilterLabel(filters);
  const activeCategoryLabel = getMateCategoryLabel(filters.category);
  const resultsSubtitle = hasQuery
    ? hourlyRateLabel
      ? `Matching “${query.trim()}” · ${hourlyRateLabel}`
      : `Matching “${query.trim()}”`
    : activeCategoryLabel
      ? hourlyRateLabel
        ? `${activeCategoryLabel} · ${hourlyRateLabel}`
        : activeCategoryLabel
      : hourlyRateLabel
        ? hourlyRateLabel
        : activeFilterCount > 0 || quickFilters.size > 0
          ? 'Based on your filters'
          : null;

  const isMateTypeSelected = (categoryId: string) => filters.category === categoryId;

  const clearRecents = () => setRecentSearches([]);

  const bottomPad = Math.max(insets.bottom, 12) + 16;

  const headerBlock = !hideSearchRow ? (
    <View style={styles.headerBlock}>
      <SearchHeader
        onBack={onClose}
        topInset={insets.top}
        showSubtitle={!showResults}
      />
      <SearchInput
        value={query}
        onChangeText={setQuery}
        inputRef={inputRef}
        autoFocus={autoFocus}
        onOpenFilters={onOpenFilters}
        onClear={clearAll}
        showClear={canClear}
        filterActive={activeFilterCount > 0}
        activeFilterCount={activeFilterCount}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
        style={styles.chipScroll}
        nestedScrollEnabled>
        {QUICK_FILTER_CHIPS.map(chip => (
          <FilterChip
            key={chip.id}
            label={chip.label}
            selected={quickFilters.has(chip.id)}
            onPress={() => toggleQuickFilter(chip.id)}
          />
        ))}
      </ScrollView>
    </View>
  ) : null;

  const browseContent = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.browseContent, {paddingBottom: bottomPad}]}>
      <Text style={styles.sectionTitle}>Quick pick</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRow}
        style={styles.featuredScroll}
        keyboardShouldPersistTaps="handled">
        {featuredTypes.map(item => (
          <MateTypeCompact
            key={item.id}
            item={item}
            selected={isMateTypeSelected(item.filterCategoryId)}
            onPress={() => handleCategoryPress(item.filterCategoryId)}
          />
        ))}
      </ScrollView>

      {gridTypes.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            All mate types
          </Text>
          <View style={styles.grid}>
            {gridTypes.map(item => (
              <View key={item.id} style={styles.gridCell}>
                <MateTypeCard
                  item={item}
                  selected={isMateTypeSelected(item.filterCategoryId)}
                  onPress={() => handleCategoryPress(item.filterCategoryId)}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
        Popular today
      </Text>
      <View style={[styles.suggestedBlock, getSearchShadowCard(elevated)]}>
        {SUGGESTED_SEARCHES.map((item, index) => {
          const initials =
            getMateCategoryLabel(item.filterCategoryId)?.slice(0, 2).toUpperCase() ??
            '••';
          const isLast = index === SUGGESTED_SEARCHES.length - 1;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.filterCategoryId) {
                  handleCategoryPress(item.filterCategoryId);
                } else {
                  setQuery(item.query);
                  addRecent(item.query);
                }
              }}
              style={({pressed}) => [
                styles.suggestedRow,
                isLast && styles.suggestedRowLast,
                pressed && styles.pressed,
              ]}>
              <View style={styles.suggestedIcon}>
                <Text style={styles.suggestedIconText}>{initials}</Text>
              </View>
              <View style={styles.suggestedText}>
                <Text style={styles.suggestedTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.suggestedSub} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={styles.suggestedChevron}>›</Text>
            </Pressable>
          );
        })}
      </View>

      {recentSearches.length > 0 ? (
        <>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent searches</Text>
            <Pressable
              onPress={clearRecents}
              hitSlop={10}
              style={({pressed}) => pressed && styles.pressed}>
              <Text style={styles.clearLink}>Clear</Text>
            </Pressable>
          </View>
          <View style={[styles.recentBlock, getSearchShadowCard(elevated)]}>
            {recentSearches.map(term => (
              <RecentSearchRow
                key={term}
                query={term}
                onPress={() => {
                  setQuery(term);
                  addRecent(term);
                }}
              />
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  );

  const resultsContent = (
    <View style={styles.resultsWrap}>
      <View style={styles.resultsHeader}>
        <View style={styles.resultsHeaderText}>
          <Text style={styles.resultsCount}>{resultsTitle}</Text>
          {resultsSubtitle ? (
            <Text style={styles.resultsSubtitle} numberOfLines={2}>
              {resultsSubtitle}
            </Text>
          ) : null}
        </View>
        {canClear ? (
          <Pressable
            onPress={clearAll}
            hitSlop={10}
            style={({pressed}) => pressed && styles.pressed}>
            <Text style={styles.clearLink}>{clearLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        style={styles.resultsList}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: bottomPad},
          filteredUsers.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.listGap} />}
        ListEmptyComponent={
          searchLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={S.primary} />
              <Text style={styles.loadingText}>Searching companions…</Text>
            </View>
          ) : searchError ? (
            <EmptyState title="Search unavailable" message={searchError} />
          ) : (
            <EmptyState
              title="No companions nearby yet"
              message="You're among the first on Tenure. As more people join and complete their profiles, they'll show up here."
            />
          )
        }
        renderItem={({item}) => (
          <ResultCard
            user={item}
            available={item.ratePerHour <= 70}
            onPress={() => openMateProfile(item.id)}
          />
        )}
      />
    </View>
  );

  return (
    <SearchElevationProvider value={elevated}>
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: hideSearchRow ? insets.top + 8 : 0,
            paddingHorizontal: GRID_PAD,
          },
        ]}>
        {headerBlock}
        {showResults ? resultsContent : browseContent}
      </View>
    </KeyboardAvoidingView>
    </SearchElevationProvider>
  );
};

export default SearchPanel;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: S.bg,
  },
  inner: {
    flex: 1,
  },
  headerBlock: {
    flexShrink: 0,
  },
  chipScroll: {
    marginTop: 12,
    marginBottom: 10,
    marginHorizontal: -GRID_PAD,
    flexGrow: 0,
    height: 36,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PAD,
    gap: 8,
    height: 36,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: S.text,
    letterSpacing: -0.3,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleSpaced: {
    marginTop: 18,
  },
  featuredScroll: {
    marginHorizontal: -GRID_PAD,
    marginBottom: 4,
    flexGrow: 0,
  },
  featuredRow: {
    paddingHorizontal: GRID_PAD,
    gap: 10,
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridCell: {
    width: CARD_W,
  },
  suggestedBlock: {
    backgroundColor: S.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: S.border,
  },
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: S.border,
    minHeight: 60,
  },
  suggestedRowLast: {
    borderBottomWidth: 0,
  },
  suggestedIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: S.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedIconText: {
    fontSize: 11,
    color: S.primary,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  suggestedText: {flex: 1, minWidth: 0},
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: S.text,
    marginBottom: 2,
  },
  suggestedSub: {
    fontSize: 12,
    fontWeight: '500',
    color: S.textSecondary,
  },
  suggestedChevron: {
    fontSize: 22,
    color: S.textMuted,
    fontWeight: '300',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 4,
  },
  recentBlock: {
    backgroundColor: S.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: S.border,
    paddingHorizontal: 12,
  },
  browseContent: {
    paddingTop: 8,
  },
  resultsWrap: {
    flex: 1,
    marginTop: 4,
    minHeight: 0,
  },
  resultsList: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listGap: {
    height: 10,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  resultsHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '800',
    color: S.text,
    letterSpacing: -0.3,
  },
  resultsSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: S.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  clearLink: {
    fontSize: 14,
    fontWeight: '700',
    color: S.primary,
    paddingTop: 2,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: S.textSecondary,
  },
  pressed: {opacity: 0.7},
});
