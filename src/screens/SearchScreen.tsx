import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native';
import {MATE_CATEGORIES} from '../constants/mateCategories';
import {MOCK_SEARCH_USERS, SearchMateUser} from '../data/mockSearchResults';
import SearchFilterModal, {
  SearchFilters,
} from '../components/search/SearchFilterModal';
import SearchResultCard from '../components/search/SearchResultCard';

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

const SearchScreen = ({navigation}: any) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
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
      user =>
        matchesQuery(user, query) && matchesFilters(user, filters),
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

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = [
    filters.district && filters.district !== 'all',
    filters.category && filters.category !== 'all',
    filters.gender !== 'all',
    filters.ageRange !== 'all',
  ].filter(Boolean).length;

  return (
    <>
      <StatusBar backgroundColor="#F7F2EA" barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.searchRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              placeholder="Search"
              placeholderTextColor="#9A9A9A"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              autoFocus
              returnKeyType="search"
            />
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

        {!showResults ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.browseContent}>
            <View style={styles.categoryGrid}>
              {MATE_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={styles.categoryChip}
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
                onPress={() =>
                  navigation.navigate('MateProfile', {
                    userId: item.id,
                    isFavorite: !!favorites[item.id],
                  })
                }
              />
            )}
          />
        )}
      </View>

      <SearchFilterModal
        visible={filterVisible}
        filters={filters}
        districts={DISTRICTS}
        categories={CATEGORY_FILTER_OPTIONS}
        onChange={setFilters}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EA',
    paddingTop: 48,
    paddingHorizontal: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 26,
    color: '#111111',
    marginRight: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E0D6',
    marginRight: 10,
  },
  searchIcon: {
    fontSize: 18,
    color: '#9A9A9A',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 12,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D6',
  },
  filterBtnActive: {
    borderColor: '#003B57',
    backgroundColor: '#E8F4FA',
  },
  filterIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '700',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#003B57',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryChip: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#C8C8C8',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    textAlign: 'center',
  },
  footerHint: {
    fontSize: 13,
    color: '#111111',
    marginTop: 8,
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
    color: '#111111',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
  },
});
