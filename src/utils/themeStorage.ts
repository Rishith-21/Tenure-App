import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemePreference} from '../context/ThemeContext';

const KEY = '@tenure/theme_preference';

export async function getThemePreference(): Promise<ThemePreference> {
  const v = await AsyncStorage.getItem(KEY);
  if (v === 'light' || v === 'dark' || v === 'system') {
    return v;
  }
  return 'system';
}

export async function setThemePreference(pref: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(KEY, pref);
}
