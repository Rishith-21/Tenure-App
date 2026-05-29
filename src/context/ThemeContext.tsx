import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Appearance, ColorSchemeName, StatusBar} from 'react-native';
import {AppColors, colorsForMode, ThemeMode} from '../theme/palettes';
import {getThemePreference, setThemePreference} from '../utils/themeStorage';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  colors: AppColors;
  mode: ThemeMode;
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const resolveMode = (
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): ThemeMode => {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
};

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? 'light',
  );

  useEffect(() => {
    getThemePreference().then(setPreferenceState);
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({colorScheme}) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const mode = resolveMode(preference, systemScheme);
  const colors = useMemo(() => colorsForMode(mode), [mode]);
  const isDark = mode === 'dark';

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    setThemePreference(pref);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemePreference = isDark ? 'light' : 'dark';
    setPreference(next);
  }, [isDark, setPreference]);

  const value = useMemo(
    () => ({
      colors,
      mode,
      preference,
      isDark,
      setPreference,
      toggleTheme,
    }),
    [colors, mode, preference, isDark, setPreference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.bg}
      />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
