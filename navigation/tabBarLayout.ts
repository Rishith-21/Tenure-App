import {layout} from '../theme/tokens';

/**
 * Layout for the floating main tab bar (MainBottomNav).
 * Reserve = bar height + gap above safe-area inset (insets.bottom is added separately).
 */
export const MAIN_TAB_BAR_HEIGHT = layout.tabBarHeight;
export const MAIN_TAB_BAR_GAP = layout.tabBarGap;
export const MAIN_TAB_BAR_RESERVE = MAIN_TAB_BAR_HEIGHT + MAIN_TAB_BAR_GAP;
