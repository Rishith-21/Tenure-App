import React, {useEffect, useRef} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import {UI} from '../theme/ui';
import {getAuthRoute} from '../utils/authStorage';
import {resetToRoute} from '../navigation/navigationActions';

const SPLASH_LOGO = require('../../DummyLogo.png');

const SplashScreen = ({navigation}: any) => {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const markSlide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(markSlide, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, markSlide, scale]);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        await new Promise<void>(r => setTimeout(r, 1600));
        if (!mounted) {
          return;
        }
        const route = await getAuthRoute();
        resetToRoute(navigation, route);
      } catch {
        if (mounted) {
          resetToRoute(navigation, 'Login');
        }
      }
    };

    boot();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <>
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        <Animated.View
          style={[
            styles.brandBlock,
            {
              opacity: fade,
              transform: [{scale}, {translateY: markSlide}],
            },
          ]}>
          <Text style={styles.wordmark}>Tenure</Text>
          <View style={styles.logoFrame}>
            <Image
              source={SPLASH_LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Tenure logo"
            />
          </View>
        </Animated.View>
      </View>
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bgCream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: UI.brand,
    opacity: 0.05,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -100,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: UI.brandMuted,
    opacity: 0.06,
  },
  brandBlock: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  wordmark: {
    fontSize: 42,
    fontWeight: '800',
    color: UI.brand,
    letterSpacing: 0.5,
    marginBottom: 28,
  },
  logoFrame: {
    width: 168,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
