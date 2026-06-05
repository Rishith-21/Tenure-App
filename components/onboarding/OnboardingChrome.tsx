import React from 'react';
import {Pressable, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {
  ONBOARDING,
  OnboardingStep,
  onboardingStepProgress,
  onboardingStyles as s,
} from '../../theme/onboardingTheme';

const IconBack = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 6l-6 6 6 6"
      stroke={ONBOARDING.navy}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconArrowRight = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h12M13 6l6 6-6 6"
      stroke={ONBOARDING.navy}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type HeaderProps = {
  title: string;
  step: OnboardingStep;
  onBack: () => void;
  onSkip?: () => void;
  skipLabel?: string;
};

export const OnboardingHeader = ({
  title,
  step,
  onBack,
  onSkip,
  skipLabel = 'Skip',
}: HeaderProps) => {
  const meta = onboardingStepProgress(step);
  return (
    <>
      <View style={s.header}>
        <Pressable
          onPress={onBack}
          style={({pressed}) => [s.headerBtn, pressed && s.pressed]}>
          <IconBack />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerStep}>{meta.label}</Text>
        </View>
        {onSkip ? (
          <Pressable
            onPress={onSkip}
            style={({pressed}) => [s.headerBtn, pressed && s.pressed]}>
            <Text style={s.skipText}>{skipLabel}</Text>
          </Pressable>
        ) : (
          <View style={s.headerBtn} />
        )}
      </View>
      <View style={s.progressTrack}>
        <View style={[s.progressFill, {width: meta.width}]} />
      </View>
    </>
  );
};

type FooterProps = {
  primaryLabel: string;
  onPrimary: () => void;
  loading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export const OnboardingFooter = ({
  primaryLabel,
  onPrimary,
  loading = false,
  secondaryLabel,
  onSecondary,
}: FooterProps) => (
  <View style={s.footer}>
    <Pressable
      onPress={onPrimary}
      disabled={loading}
      style={({pressed}) => [
        s.ctaBtn,
        loading && s.ctaDisabled,
        pressed && !loading && s.pressed,
      ]}>
      <Text style={s.ctaText}>{loading ? 'Saving…' : primaryLabel}</Text>
      <View style={s.ctaArrowCircle}>
        <IconArrowRight />
      </View>
    </Pressable>
    {secondaryLabel && onSecondary ? (
      <Pressable onPress={onSecondary} hitSlop={12} style={s.skipLinkWrap}>
        <Text style={s.skipLink}>{secondaryLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

export const OnboardingPercentPill = ({step}: {step: OnboardingStep}) => {
  const {pct} = onboardingStepProgress(step);
  return (
    <View
      style={{
        backgroundColor: ONBOARDING.chipBg,
        borderRadius: 99,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}>
      <Text style={{fontSize: 12, fontWeight: '700', color: ONBOARDING.chipText}}>
        {pct}
      </Text>
    </View>
  );
};
