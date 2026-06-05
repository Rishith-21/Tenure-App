import React from 'react';
import {Platform, StyleSheet, View, ViewStyle, StyleProp} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Sticky bottom action bar with glass blur — booking-style CTA strip */
const StickyActionBar = ({children, style}: Props) => {
  const {colors, tokens, isDark} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, tokens.spacing.lg),
          ...tokens.shadows.nav(colors.shadow),
        },
        style,
      ]}>
      {Platform.OS === 'ios' ? (
        <>
          <BlurView
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={28}
            reducedTransparencyFallbackColor={colors.bgElevated}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: isDark ? colors.glassDark : 'rgba(255,255,255,0.92)'},
            ]}
          />
        </>
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {backgroundColor: colors.bgElevated},
          ]}
        />
      )}
      <View
        style={[
          styles.inner,
          {
            paddingHorizontal: tokens.spacing.screenH,
            paddingTop: tokens.spacing.lg,
            borderTopColor: colors.border,
          },
        ]}>
        {children}
      </View>
    </View>
  );
};

export default StickyActionBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    zIndex: 1,
  },
});
