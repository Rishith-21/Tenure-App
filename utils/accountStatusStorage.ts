import AsyncStorage from '@react-native-async-storage/async-storage';
import { deactivateAccount, deleteAccount } from './api';
import { clearAuth } from './authStorage';

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

export async function deactivateAccountOnServer(): Promise<void> {
  await deactivateAccount();
  await AsyncStorage.setItem(DEACTIVATED_KEY, '1');
  await clearAuth();
}

export async function deleteAccountOnServer(): Promise<void> {
  await deleteAccount();
  await AsyncStorage.removeItem(DEACTIVATED_KEY);
  await clearAuth();
}
