import {CommonActions, NavigationProp, ParamListBase} from '@react-navigation/native';

type Nav = {
  dispatch: (action: ReturnType<typeof CommonActions.reset>) => void;
  canGoBack?: () => boolean;
  goBack?: () => void;
};

/** Replace the entire stack with a single route (post-login / post-splash). */
export const resetToRoute = (
  navigation: Nav,
  name: string,
  params?: object,
) => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: params ? [{name, params}] : [{name}],
    }),
  );
};

export const resetToMainTabs = (navigation: Nav) =>
  resetToRoute(navigation, 'MainTabs');

export const resetToOnboardingProfile = (navigation: Nav) =>
  resetToRoute(navigation, 'ProfileCreation');

/** Pop when possible; no-op at stack root (safe after backend-driven deep links). */
export const goBackSafe = (navigation: NavigationProp<ParamListBase>) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  }
};

/**
 * If the user is on MainTabs but auth/onboarding screens remain underneath,
 * collapse the stack to MainTabs only instead of popping back to login.
 */
export const collapseStackToMainTabs = (navigation: Nav) => {
  resetToMainTabs(navigation);
};
