import AsyncStorage from '@react-native-async-storage/async-storage';

const DEACTIVATED_KEY = '@tenure/account_deactivated';

export async function isAccountDeactivated(): Promise<boolean> {
  return (await AsyncStorage.getItem(DEACTIVATED_KEY)) === '1';
}

export async function setAccountDeactivated(active: boolean): Promise<void> {
  if (active) {
    await AsyncStorage.setItem(DEACTIVATED_KEY, '1');
  } else {
    await AsyncStorage.removeItem(DEACTIVATED_KEY);
  }
}
