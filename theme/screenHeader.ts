import {typography} from './tokens';

/** Shared layout tokens for top-of-screen page titles (tabs & stack). */
export const SCREEN_HEADER_TOP_INSET = 4;
export const SCREEN_HEADER_H_PADDING = 20;
export const SCREEN_HEADER_SIDE_WIDTH = 44;
export const SCREEN_HEADER_BOTTOM_MARGIN = 20;

export const screenHeaderTitleStyle = {
  ...typography.h3,
  fontWeight: '700' as const,
  letterSpacing: -0.4,
};
