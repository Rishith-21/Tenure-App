import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import SearchPanel from '../components/search/SearchPanel';
import {useTheme} from '../context/ThemeContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/** Standalone search route (e.g. deep links). Home uses HomeSearchOverlay instead. */
const SearchScreen = ({navigation}: any) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <StatusBar backgroundColor={colors.bgElevated} barStyle={colors.statusBar} />
      <View style={[styles.container, {paddingTop: insets.top + 8}]}>
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

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 16,
    },
  });
