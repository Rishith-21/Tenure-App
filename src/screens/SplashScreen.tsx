import React, {useEffect, useMemo, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {getAuthRoute} from '../utils/authStorage';
import {resetToRoute} from '../navigation/navigationActions';

const SplashScreen = ({navigation}: any) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fade = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.25,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 150);
    const a3 = pulse(dot3, 300);
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
      <Animated.View style={[styles.center, {opacity: fade}]}>
        <Text style={styles.infinity} accessibilityLabel="Tenure logo">
          ∞
        </Text>
        <Text style={styles.wordmark}>Tenure</Text>
        <Text style={styles.tagline}>ESTABLISHED TRUST</Text>

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

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
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
    infinity: {
      fontSize: 56,
      fontWeight: '300',
      color: c.brandDark,
      lineHeight: 64,
      marginBottom: 20,
    },
    wordmark: {
      fontSize: 36,
      fontWeight: '800',
      color: c.brandDark,
      letterSpacing: 0.2,
      marginBottom: 10,
    },
    tagline: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textHint,
      letterSpacing: 3.2,
      textTransform: 'uppercase',
      marginBottom: 48,
    },
    dots: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.textHint,
    },
  });
