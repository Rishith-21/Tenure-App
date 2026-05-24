import React, {useEffect} from 'react';
import {View, Image, StyleSheet, StatusBar} from 'react-native';
import {getAuthRoute} from '../utils/authStorage';

const SplashScreen = ({navigation}: any) => {
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        await new Promise<void>(r => setTimeout(r, 1600));
        if (!mounted) {
          return;
        }
        const route = await getAuthRoute();
        navigation.replace(route);
      } catch {
        if (mounted) {
          navigation.replace('Login');
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
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
});
