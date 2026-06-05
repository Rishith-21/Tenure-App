import {Platform, StyleSheet} from 'react-native';

/** Shared palette for profile onboarding (reference mock) */
export const ONBOARDING = {
  navy: '#0B1A3D',
  text: '#0B1A3D',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  bg: '#F4F7FB',
  border: '#E2EAF4',
  chipBg: '#E8F0FE',
  chipText: '#1E3A6E',
  accentIcon: '#6B8FD0',
  accentLight: '#EEF3FF',
  lavender: '#E8EDFF',
  orange: '#F59E0B',
  orangeBg: '#FFF7ED',
  progressTrack: '#E8EEF4',
  shadow: '#0B1A3D',
  cardRadius: 28,
  inputRadius: 14,
  totalSteps: 3,
} as const;

export type OnboardingStep = 1 | 2 | 3;

export const onboardingCardShadow = Platform.select({
  ios: {
    shadowColor: ONBOARDING.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  android: {elevation: 1},
  default: {},
});

export const onboardingStepProgress = (step: OnboardingStep) => {
  const pct = `${Math.round((step / ONBOARDING.totalSteps) * 100)}%`;
  return {
    label: `Step ${step} of ${ONBOARDING.totalSteps}`,
    width: pct as `${number}%`,
    pct,
    step,
  };
};

export const onboardingStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ONBOARDING.bg,
  },
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: ONBOARDING.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ONBOARDING.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ONBOARDING.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ONBOARDING.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...onboardingCardShadow,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ONBOARDING.text,
    letterSpacing: -0.3,
  },
  headerStep: {
    fontSize: 12,
    fontWeight: '500',
    color: ONBOARDING.textMuted,
    marginTop: 2,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: ONBOARDING.navy,
  },
  progressTrack: {
    height: 4,
    borderRadius: 99,
    backgroundColor: ONBOARDING.progressTrack,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: ONBOARDING.navy,
  },
  card: {
    backgroundColor: ONBOARDING.white,
    borderRadius: ONBOARDING.cardRadius,
    padding: 18,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ONBOARDING.border,
    ...onboardingCardShadow,
  },
  pressed: {
    opacity: 0.88,
    transform: [{scale: 0.97}],
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ONBOARDING.navy,
    borderRadius: 99,
    minHeight: 54,
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  ctaDisabled: {opacity: 0.7},
  ctaText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: ONBOARDING.white,
  },
  ctaArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ONBOARDING.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
  },
  skipLink: {
    fontSize: 14,
    fontWeight: '600',
    color: ONBOARDING.textSecondary,
    textDecorationLine: 'underline',
  },
  skipLinkWrap: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    color: ONBOARDING.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ONBOARDING.textMuted,
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 2,
  },
});
