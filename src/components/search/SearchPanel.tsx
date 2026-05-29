import React, {useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import {MATE_CATEGORIES} from '../../constants/mateCategories';
import {MOCK_SEARCH_USERS, SearchMateUser} from '../../data/mockSearchResults';
import SearchFilterModal, {SearchFilters} from './SearchFilterModal';
import SearchResultCard from './SearchResultCard';
import {UI} from '../../theme/ui';
import BackButton from '../navigation/BackButton';

const DISTRICTS = [
  {label: 'All districts', value: 'all'},
  {label: 'Dakshina Kannada', value: 'Dakshina Kannada'},
  {label: 'Udupi', value: 'Udupi'},
  {label: 'Bangalore Urban', value: 'Bangalore Urban'},
];

const CATEGORY_FILTER_OPTIONS = [
  {label: 'All categories', value: 'all'},
  ...MATE_CATEGORIES.map(c => ({label: c.label, value: c.label})),
];

const DEFAULT_FILTERS: SearchFilters = {
  district: null,
  category: null,
  gender: 'all',
  ageRange: 'all',
};

const normalize = (text: string) => text.trim().toLowerCase();

const matchesQuery = (user: SearchMateUser, query: string) => {
  const q = normalize(query);
  if (!q) {
    return true;
  }
  if (user.name.toLowerCase().includes(q)) {
    return true;
  }
  if (user.tenureId.toLowerCase().includes(q)) {
    return true;
  }
  return user.categories.some(cat => normalize(cat).includes(q));
};

const matchesCategoryFilter = (
  user: SearchMateUser,
  categoryFilter: string | null,
) => {
  if (!categoryFilter || categoryFilter === 'all') {
    return true;
  }
  return user.categories.some(
    cat => normalize(cat) === normalize(categoryFilter),
  );
};

const matchesFilters = (user: SearchMateUser, filters: SearchFilters) => {
  if (filters.district && filters.district !== 'all') {
    if (user.district !== filters.district) {
      return false;
    }
  }
  if (!matchesCategoryFilter(user, filters.category)) {
    return false;
  }
  if (filters.gender !== 'all' && user.gender !== filters.gender) {
    return false;
  }
  if (filters.ageRange === 'under30' && user.age >= 30) {
    return false;
  }
  if (filters.ageRange === '30to45' && (user.age < 30 || user.age > 45)) {
    return false;
  }
  if (filters.ageRange === 'over45' && user.age <= 45) {
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
};

const SearchPanel = ({
  onClose,
  stackNavigation,
  autoFocus = true,
  inputRef: externalInputRef,
  hideSearchRow = false,
  query: controlledQuery,
  onChangeQuery: onControlledQueryChange,
}: SearchPanelProps) => {
  const internalInputRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? internalInputRef;

  const [queryState, setQueryState] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const query = controlledQuery ?? queryState;
  const setQuery = onControlledQueryChange ?? setQueryState;

  const [filterVisible, setFilterVisible] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    u2: true,
  });

  const showResults = normalize(query).length > 0;

  const filteredUsers = useMemo(() => {
    if (!showResults) {
      return [];
    }
    return MOCK_SEARCH_USERS.filter(
      user => matchesQuery(user, query) && matchesFilters(user, filters),
    );
  }, [query, filters, showResults]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({...prev, [id]: !prev[id]}));
  };

  const handleCategoryPress = (label: string) => {
    setQuery(label);
    setFilters(prev => ({...prev, category: label}));
  };

  const handleApplyFilters = () => {
    setFilterVisible(false);
    if (filters.category && filters.category !== 'all' && !query) {
      setQuery(filters.category);
    }
  };

  const activeFilterCount = [
    filters.district && filters.district !== 'all',
    filters.category && filters.category !== 'all',
    filters.gender !== 'all',
    filters.ageRange !== 'all',
  ].filter(Boolean).length;

  const openMateProfile = (userId: string) => {
    stackNavigation?.navigate('MateProfile', {
      userId,
      isFavorite: !!favorites[userId],
    });
  };

  return (
    <View style={styles.container}>
      {!hideSearchRow ? (
        <View style={styles.searchRow}>
          <BackButton onPress={onClose} style={styles.backHit} />

          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              ref={inputRef}
              placeholder="Search mates, categories, ID…"
              placeholderTextColor={UI.textHint}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              autoFocus={autoFocus}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
                style={styles.clearBtn}>
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={[
              styles.filterBtn,
              activeFilterCount > 0 && styles.filterBtnActive,
            ]}
            onPress={() => setFilterVisible(true)}>
            <Text style={styles.filterIcon}>☰</Text>
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      ) : null}

      {!showResults ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.browseContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.browseTitle}>Browse by category</Text>
          <View style={styles.categoryGrid}>
            {MATE_CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                style={({pressed}) => [
                  styles.categoryChip,
                  pressed && styles.categoryChipPressed,
                ]}
                onPress={() => handleCategoryPress(cat.label)}>
                <Text style={styles.categoryChipText}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.footerHint}>mate for some one</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No mates found</Text>
              <Text style={styles.emptyText}>
                Try another name, mate type, or adjust filters.
              </Text>
            </View>
          }
          renderItem={({item}) => (
            <SearchResultCard
              user={item}
              isFavorite={!!favorites[item.id]}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => openMateProfile(item.id)}
            />
          )}
        />
      )}

      <SearchFilterModal
        visible={filterVisible}
        filters={filters}
        districts={DISTRICTS}
        categories={CATEGORY_FILTER_OPTIONS}
        onChange={setFilters}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />
    </View>
  );
};

export default SearchPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backHit: {
    paddingRight: 6,
    paddingVertical: 4,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: UI.brand,
    marginRight: 10,
    minHeight: 50,
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    color: UI.textHint,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: UI.text,
    paddingVertical: 12,
    fontWeight: '500',
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: UI.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 18,
    color: UI.textMuted,
    marginTop: -2,
    fontWeight: '600',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.borderInput,
  },
  filterBtnActive: {
    borderColor: UI.brand,
    backgroundColor: '#E8F4FA',
  },
  filterIcon: {
    fontSize: 18,
    color: UI.textSecondary,
    fontWeight: '700',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: UI.brand,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  browseContent: {
    paddingBottom: 40,
  },
  browseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.textMuted,
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryChip: {
    width: '48%',
    borderWidth: 1,
    borderColor: UI.borderPill,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: UI.card,
  },
  categoryChipPressed: {
    opacity: 0.9,
    borderColor: UI.brandMuted,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: UI.text,
    textAlign: 'center',
  },
  footerHint: {
    fontSize: 13,
    color: UI.textSecondary,
    marginTop: 12,
    textTransform: 'lowercase',
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyWrap: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: UI.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
