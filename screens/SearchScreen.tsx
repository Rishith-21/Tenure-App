import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import SearchPanel from '../components/search/SearchPanel';

/** Standalone search route (e.g. deep links). Home uses a full-screen modal. */
const SearchScreen = ({navigation}: {navigation: {goBack: () => void; navigate: (name: string, params?: object) => void}}) => (
  <>
    <StatusBar backgroundColor="#F6F8FA" barStyle="dark-content" />
    <View style={styles.container}>
      <SearchPanel
        onClose={() => navigation.goBack()}
        stackNavigation={navigation}
        autoFocus
      />
    </View>
  </>
);

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
});
