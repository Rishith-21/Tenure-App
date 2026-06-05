import React, {useEffect, useMemo, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {getAuthRoute} from '../utils/authStorage';
import {resetToRoute} from '../navigation/navigationActions';

const SplashScreen = ({navigation}: any) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.25,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 160);
    const a3 = pulse(dot3, 320);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      await new Promise<void>(r => setTimeout(r, 2200));
      if (!mounted) return;
      try {
        const route = await getAuthRoute();
        resetToRoute(navigation, route);
      } catch {
        resetToRoute(navigation, 'Login');
      }
    };
    boot();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, {opacity: fade, transform: [{scale}]}]}>
        <View style={styles.logoRing}>
          <Text style={styles.infinity} accessibilityLabel="Tenure logo">
            ∞
          </Text>
        </View>
        <Text style={styles.wordmark}>Tenure</Text>
        <Text style={styles.tagline}>Established Trust</Text>

        <View style={styles.dots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, {opacity: dot}]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    center: {
      alignItems: 'center',
      paddingHorizontal: 48,
    },
    logoRing: {
      width: 96,
      height: 96,
      borderRadius: tokens.radius.xl,
      backgroundColor: c.cardMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
      ...tokens.shadows.soft(c.shadow),
    },
    infinity: {
      fontSize: 48,
      fontWeight: '200',
      color: c.brandDark,
      lineHeight: 56,
    },
    wordmark: {
      ...tokens.typography.display,
      fontWeight: '700',
      color: c.brandDark,
      marginBottom: 12,
    },
    tagline: {
      ...tokens.typography.overline,
      color: c.textMuted,
      marginBottom: 52,
    },
    dots: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: tokens.radius.pill,
      backgroundColor: c.textHint,
    },
  });
