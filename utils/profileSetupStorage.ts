import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@tenure/profile_setup_skipped';

/** User chose "Skip for now" on profile setup — show a gentle reminder on Profile. */
export async function setProfileSetupSkipped(skipped: boolean): Promise<void> {
  if (skipped) {
    await AsyncStorage.setItem(KEY, '1');
  } else {
    await AsyncStorage.removeItem(KEY);
  }
}

export async function isProfileSetupSkipped(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === '1';
}
