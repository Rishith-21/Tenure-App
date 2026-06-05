import {Platform, StyleSheet, ViewStyle} from 'react-native';
import type {AppColors} from '../../../theme/palettes';

export const PROFILE_CARD_RADIUS = 20;
export const PROFILE_SECTION_GAP = 14;
export const PROFILE_H_PADDING = 16;

export function cardShadow(c: AppColors): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.07,
      shadowRadius: 12,
    },
    android: {elevation: 3},
    default: {},
  }) as ViewStyle;
}

export function createProfileSharedStyles(c: AppColors) {
  return StyleSheet.create({
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      letterSpacing: -0.2,
      marginBottom: 10,
    },
    sectionHint: {
      fontSize: 13,
      color: c.textMuted,
      lineHeight: 19,
      marginTop: 8,
    },
    emptyCopy: {
      fontSize: 14,
      color: c.textMuted,
      lineHeight: 21,
    },
  });
}
