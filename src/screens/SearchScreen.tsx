import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import SearchPanel from '../components/search/SearchPanel';
import {UI} from '../theme/ui';

/** Standalone search route (e.g. deep links). Home uses HomeSearchOverlay instead. */
const SearchScreen = ({navigation}: any) => {
  return (
    <>
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />
      <View style={styles.container}>
        <SearchPanel
          onClose={() => navigation.goBack()}
          stackNavigation={navigation}
          autoFocus
        />
      </View>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bgCream,
    paddingTop: 48,
    paddingHorizontal: 18,
  },
});
