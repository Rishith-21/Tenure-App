import {Platform, TextStyle, ViewStyle} from 'react-native';

/** Premium mobile design tokens — luxury booking aesthetic */
export const radius = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 36,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  screenH: 20,
  screenEdge: 0,
} as const;

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '300' as const,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 2.4,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  tab: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 12,
  },
} as const;

type ShadowPreset = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows = {
  soft: (color = '#000000'): ShadowPreset =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {elevation: 2},
      default: {},
    }) as ShadowPreset,

  card: (color = '#000000'): ShadowPreset =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {elevation: 6},
      default: {},
    }) as ShadowPreset,

  float: (color = '#000000'): ShadowPreset =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.12,
        shadowRadius: 32,
      },
      android: {elevation: 12},
      default: {},
    }) as ShadowPreset,

  nav: (color = '#000000'): ShadowPreset =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {elevation: 16},
      default: {},
    }) as ShadowPreset,
};

export const layout = {
  tabBarHeight: 64,
  tabBarGap: 16,
  stickyBarHeight: 88,
  imageCardAspect: 4 / 5,
  searchBarHeight: 56,
  minTouch: 48,
} as const;

export const motion = {
  pressScale: 0.97,
  durationFast: 180,
  durationNormal: 280,
  durationSlow: 420,
} as const;

export type DesignTokens = {
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  layout: typeof layout;
  motion: typeof motion;
};

export const tokens: DesignTokens = {
  radius,
  spacing,
  typography,
  shadows,
  layout,
  motion,
};

export const premiumTitle = (color: string): TextStyle => ({
  ...typography.h2,
  color,
});

export const premiumSubtitle = (color: string): TextStyle => ({
  ...typography.caption,
  color,
});
