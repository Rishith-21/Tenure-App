import React, {useEffect, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BackButton from '../components/navigation/BackButton';
import {
  resolveSettingsNavigation,
  settingsItemTitle,
  SettingsItemId,
} from '../constants/settingsMenu';
import {goBackSafe} from '../navigation/navigationActions';

type Props = {
  navigation: NativeStackNavigationProp<{
    SettingsDetail: {itemId?: SettingsItemId};
    AccountStatus: undefined;
  }>;
  route: {params?: {itemId?: SettingsItemId}};
};

const SettingsDetailScreen = ({navigation, route}: Props) => {
  const insets = useSafeAreaInsets();
  const itemId = route.params?.itemId;
  const title = useMemo(
    () => (itemId ? settingsItemTitle(itemId) : 'Settings'),
    [itemId],
  );

  useEffect(() => {
    if (!itemId) {
      return;
    }
    if (resolveSettingsNavigation(itemId) === 'account-status') {
      navigation.replace('AccountStatus');
    }
  }, [itemId, navigation]);

  if (
    itemId &&
    (itemId === 'delete-account' || itemId === 'deactivate-account')
  ) {
    return null;
  }

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <View style={styles.header}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>
          This screen is ready for {title.toLowerCase()} — wire your flow here.
        </Text>
      </View>
    </View>
  );
};

export default SettingsDetailScreen;

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
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 42,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
});
