import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LOGGED_IN: '@tenure/logged_in',
  ONBOARDING_DONE: '@tenure/onboarding_done',
  PHONE: '@tenure/phone',
} as const;

export type AuthRoute = 'Login' | 'ProfileCreation' | 'MainTabs';

export async function setLoggedIn(phone: string): Promise<void> {
  await AsyncStorage.setMany({
    [KEYS.LOGGED_IN]: '1',
    [KEYS.PHONE]: phone,
  });
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, '1');
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeMany([
    KEYS.LOGGED_IN,
    KEYS.ONBOARDING_DONE,
    KEYS.PHONE,
  ]);
}

export async function getAuthRoute(): Promise<AuthRoute> {
  const stored = await AsyncStorage.getMany([
    KEYS.LOGGED_IN,
    KEYS.ONBOARDING_DONE,
  ]);
  const isLoggedIn = stored[KEYS.LOGGED_IN] === '1';
  const isOnboarded = stored[KEYS.ONBOARDING_DONE] === '1';
  if (!isLoggedIn) {
    return 'Login';
  }
  if (!isOnboarded) {
    return 'ProfileCreation';
  }
  return 'MainTabs';
}

export async function getStoredPhone(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.PHONE);
}
