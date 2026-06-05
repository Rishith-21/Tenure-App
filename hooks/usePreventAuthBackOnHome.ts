import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {collapseStackToMainTabs} from '../navigation/navigationActions';

/**
 * On the Home tab: never pop the root stack back into login/onboarding.
 * After `resetToMainTabs`, hardware back exits the app as usual.
 */
export function usePreventAuthBackOnHome() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const onHardwareBack = () => {
        const root = navigation.getParent() ?? navigation;
        const state = root.getState?.();
        if (!state || typeof state.index !== 'number') {
          return false;
        }

        const {routes, index} = state;
        const current = routes[index];
        const hasAuthUnderMain =
          current?.name === 'MainTabs' &&
          index > 0 &&
          routes.some(
            r =>
              r.name === 'Login' ||
              r.name === 'Otp' ||
              r.name === 'Splash' ||
              r.name === 'ProfileCreation' ||
              r.name === 'LocationLanguage' ||
              r.name === 'CategoryPreference',
          );

        if (hasAuthUnderMain) {
          collapseStackToMainTabs(root as Parameters<typeof collapseStackToMainTabs>[0]);
          return true;
        }

        return false;
      };

      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onHardwareBack,
      );
      return () => sub.remove();
    }, [navigation]),
  );
}
