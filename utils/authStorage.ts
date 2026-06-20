import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LOGGED_IN: '@tenure/logged_in',
  ONBOARDING_DONE: '@tenure/onboarding_done',
  PHONE: '@tenure/phone',
  TOKEN: '@tenure/token',
} as const;

export type AuthRoute = 'Login' | 'ProfileCreation' | 'MainTabs';

export async function setLoggedIn(phone: string): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.LOGGED_IN, '1'],
    [KEYS.PHONE, phone],
  ]);
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, '1');
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.TOKEN);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.LOGGED_IN,
    KEYS.ONBOARDING_DONE,
    KEYS.PHONE,
    KEYS.TOKEN,
  ]);
}

/**
 * Legacy local-only route resolver. Prefer {@link resolveAuthDestination} from authRouting.
 */
export async function getAuthRoute(): Promise<AuthRoute> {
  const stored = await AsyncStorage.multiGet([
    KEYS.LOGGED_IN,
    KEYS.ONBOARDING_DONE,
  ]);
  const values = Object.fromEntries(stored) as Record<string, string | null>;
  const isLoggedIn = values[KEYS.LOGGED_IN] === '1';
  const isOnboarded = values[KEYS.ONBOARDING_DONE] === '1';
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
