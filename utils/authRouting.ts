import {
  fetchProfileResult,
  type ProfileFetchResult,
} from './api';
import {
  getToken,
  setOnboardingComplete,
  type AuthRoute,
} from './authStorage';
export type PostAuthDestination = 'ProfileCreation' | 'MainTabs';

function destinationFromProfileResult(
  result: ProfileFetchResult,
): PostAuthDestination {
  if (result.kind === 'found') {
    return 'MainTabs';
  }
  return 'ProfileCreation';
}

/** After OTP or when resuming with a stored session token. */
export async function resolvePostAuthDestination(): Promise<PostAuthDestination> {
  const result = await fetchProfileResult();

  if (result.kind === 'failed') {
    throw new Error('Could not load your profile. Check your connection and try again.');
  }

  const destination = destinationFromProfileResult(result);
  if (destination === 'MainTabs') {
    await setOnboardingComplete();
  }
  return destination;
}

/** Splash cold start: Login, onboarding, or home based on token + API profile. */
export async function resolveAuthDestination(): Promise<AuthRoute> {
  const token = await getToken();
  if (!token) {
    return 'Login';
  }

  const result = await fetchProfileResult();

  if (result.kind === 'failed') {
    // Keep returning users on home; screens refetch profile themselves.
    return 'MainTabs';
  }

  const destination = destinationFromProfileResult(result);
  if (destination === 'MainTabs') {
    await setOnboardingComplete();
    return 'MainTabs';
  }
  return 'ProfileCreation';
}
