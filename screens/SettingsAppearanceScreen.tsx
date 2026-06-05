import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BackButton from '../components/navigation/BackButton';
import SegmentedControl from '../components/profile/SegmentedControl';
import {useTheme} from '../context/ThemeContext';
import {goBackSafe} from '../navigation/navigationActions';

const THEME_OPTIONS = [
  {id: 'light', label: 'Light'},
  {id: 'dark', label: 'Dark'},
  {id: 'system', label: 'System'},
] as const;

const SettingsAppearanceScreen = ({navigation}: {navigation: {goBack: () => void}}) => {
  const insets = useSafeAreaInsets();
  const {preference, setPreference, mode} = useTheme();

  const subtitle = useMemo(() => `Current · ${mode}`, [mode]);

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <View style={styles.header}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <Text style={styles.title}>Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <SegmentedControl
          options={THEME_OPTIONS}
          value={preference}
          onChange={setPreference}
        />
      </View>
    </View>
  );
};

export default SettingsAppearanceScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSpacer: {
    width: 42,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 14,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});
