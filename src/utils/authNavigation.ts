import {CommonActions} from '@react-navigation/native';
import {clearAuth} from './authStorage';

/** Clears the stack and returns the user to login. */
export const resetToLogin = async (navigation: {
  dispatch: (action: ReturnType<typeof CommonActions.reset>) => void;
}) => {
  await clearAuth();
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: 'Login'}],
    }),
  );
};
