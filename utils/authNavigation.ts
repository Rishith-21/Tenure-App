import {clearAuth} from './authStorage';
import {resetToRoute} from '../navigation/navigationActions';

/** Clears the stack and returns the user to login. */
export const resetToLogin = async (navigation: {
  dispatch: (action: unknown) => void;
}) => {
  await clearAuth();
  resetToRoute(navigation, 'Login');
};
