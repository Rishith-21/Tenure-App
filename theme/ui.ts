import {StyleSheet, ViewStyle, TextStyle} from 'react-native';
import {lightColors} from './palettes';
import {radius, spacing, typography, shadows} from './tokens';

/** Static tokens (light) — prefer `useTheme()` in new UI. */
export const UI = {
  bg: lightColors.bg,
  bgElevated: lightColors.bgElevated,
  bgCream: lightColors.bg,
  bgHome: lightColors.bgHome,
  brand: lightColors.brand,
  brandDark: lightColors.brandDark,
  brandMuted: lightColors.brandMuted,
  primary: lightColors.primary,
  primaryPressed: lightColors.primaryPressed,
  text: lightColors.text,
  textSecondary: lightColors.textSecondary,
  textMuted: lightColors.textMuted,
  textHint: lightColors.textHint,
  border: lightColors.border,
  borderInput: lightColors.borderInput,
  borderPill: lightColors.borderPill,
  card: lightColors.card,
  cardMuted: lightColors.cardMuted,
  chip: lightColors.chip,
  overlay: lightColors.overlay,
  sheetScrim: lightColors.sheetScrim,
  success: lightColors.success,
  warning: lightColors.warning,
  danger: lightColors.danger,
  shadow: lightColors.shadow,
  glass: lightColors.glass,
  navBg: lightColors.navBg,
};

export const uiLayout = {
  screen: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingHorizontal: spacing.screenH,
  } as ViewStyle,
  screenCream: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingHorizontal: spacing.screenH,
  } as ViewStyle,
  screenEdge: {
    flex: 1,
    backgroundColor: UI.bg,
  } as ViewStyle,
  backArrow: {
    fontSize: 28,
    color: UI.text,
  } as TextStyle,
  sectionLabel: {
    ...typography.h3,
    color: UI.text,
    marginBottom: spacing.lg,
  } as TextStyle,
  fieldLabel: {
    ...typography.label,
    color: UI.textSecondary,
    marginBottom: spacing.sm,
  } as TextStyle,
  inputField: {
    backgroundColor: UI.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  } as ViewStyle,
  sectionCard: {
    backgroundColor: UI.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    ...shadows.card(UI.shadow),
  } as ViewStyle,
  pillPrimary: {
    backgroundColor: UI.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...shadows.soft(UI.shadow),
  } as ViewStyle,
  pillPrimaryText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  } as TextStyle,
  sheet: {
    backgroundColor: UI.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  } as ViewStyle,
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: UI.border,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  } as ViewStyle,
  infoPill: {
    backgroundColor: UI.cardMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    marginBottom: spacing.lg,
  } as ViewStyle,
  infoPillText: {
    ...typography.caption,
    fontWeight: '600',
    color: UI.text,
  } as TextStyle,
  glassSearch: {
    backgroundColor: UI.glass,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.6)',
    minHeight: 56,
    ...shadows.float(UI.shadow),
  } as ViewStyle,
};

export const uiStyles = StyleSheet.create({
  ...uiLayout,
});

export {radius, spacing, typography, shadows} from './tokens';
