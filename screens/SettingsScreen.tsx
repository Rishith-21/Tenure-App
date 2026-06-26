import React, {useCallback, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BackButton from '../components/navigation/BackButton';
import SettingsRow from '../components/settings/SettingsRow';
import {
  getVisibleSettingsMenu,
  resolveSettingsNavigation,
  SETTINGS_SEARCH_INDEX,
  SettingsItemId,
} from '../constants/settingsMenu';
import {goBackSafe} from '../navigation/navigationActions';

type SettingsNav = NativeStackNavigationProp<{
  Settings: undefined;
  SettingsDetail: {itemId: SettingsItemId};
  UserProfile: undefined;
  AccountStatus: undefined;
}>;

function matchesSearch(
  query: string,
  label: string,
  section: string,
  keywords: string[],
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return false;
  }
  const haystack = [label, section, ...keywords].join(' ').toLowerCase();
  return q.split(/\s+/).every(token => haystack.includes(token));
}

const SettingsScreen = ({navigation}: {navigation: SettingsNav}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const visibleMenu = useMemo(() => getVisibleSettingsMenu(), []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) {
      return [];
    }
    return SETTINGS_SEARCH_INDEX.filter(entry =>
      matchesSearch(q, entry.label, entry.section, entry.keywords),
    );
  }, [searchQuery]);

  const onItemPress = useCallback(
    (id: SettingsItemId) => {
      const target = resolveSettingsNavigation(id);
      switch (target) {
        case 'personal-information':
          navigation.navigate('UserProfile');
          return;
        case 'account-status':
          navigation.navigate('AccountStatus');
          return;
        default:
          navigation.navigate('SettingsDetail', {itemId: target});
      }
    },
    [navigation],
  );

  const showBrowse = searchQuery.trim().length === 0;

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <View style={styles.header}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search settings"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search settings"
        />
        {searchQuery.length > 0 ? (
          <Pressable
            onPress={() => setSearchQuery('')}
            hitSlop={8}
            accessibilityLabel="Clear search">
            <Text style={styles.searchClear}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 32},
        ]}>
        {showBrowse
          ? visibleMenu.map(section => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.card}>
                  {section.items.map((item, index) => (
                    <SettingsRow
                      key={item.id}
                      label={item.label}
                      isLast={index === section.items.length - 1}
                      onPress={() => onItemPress(item.id)}
                    />
                  ))}
                </View>
              </View>
            ))
          : searchResults.length > 0
            ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Results</Text>
                  <View style={styles.card}>
                    {searchResults.map((entry, index) => (
                      <SettingsRow
                        key={`${entry.id}-${index}`}
                        label={entry.label}
                        danger={entry.id === 'delete-account'}
                        isLast={index === searchResults.length - 1}
                        onPress={() => onItemPress(entry.id)}
                      />
                    ))}
                  </View>
                </View>
              )
            : (
                <Text style={styles.emptySearch}>
                  No settings match &quot;{searchQuery.trim()}&quot;. Try
                  &quot;account&quot;, &quot;delete&quot;, or &quot;notifications&quot;.
                </Text>
              )}
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 42,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 22,
    color: '#9CA3AF',
    fontWeight: '600',
    lineHeight: 24,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  emptySearch: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingTop: 24,
  },
});
