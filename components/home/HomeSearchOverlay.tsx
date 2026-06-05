import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import SearchPanel from '../search/SearchPanel';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  stackNavigation?: {navigate: (name: string, params?: object) => void};
};

const HomeSearchOverlay = ({visible, onClose, stackNavigation}: Props) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [mounted, setMounted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.setValue(0);
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 1,
          duration: 230,
          easing: Easing.out(Easing.bezier(0.2, 0.9, 0.2, 1)),
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          inputRef.current?.focus();
        }
      });
      return;
    }

    if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 170,
        easing: Easing.in(Easing.bezier(0.4, 0, 1, 1)),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [visible, mounted, progress]);

  if (!mounted) {
    return null;
  }

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 0],
  });

  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.78, 1],
    outputRange: [0, 0, 1],
  });

  const heroOpacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.96, 0.08, 0],
  });
  const heroTopTarget = Platform.OS === 'android' ? 18 : 20;
  const heroStartTop = Platform.OS === 'android' ? 122 : 132;
  const heroTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, heroTopTarget - heroStartTop],
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar backgroundColor={colors.bgElevated} barStyle={colors.statusBar} />
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, {opacity: backdropOpacity}]}
          pointerEvents={visible ? 'auto' : 'none'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.heroBar,
            {
              top: heroStartTop,
              opacity: heroOpacity,
              transform: [{translateY: heroTranslateY}],
            },
          ]}>
          <View style={styles.heroIconDot} />
          <View style={styles.heroTextLine} />
          <View style={styles.heroGoPill} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: progress,
              transform: [{translateY: sheetTranslateY}],
            },
          ]}>
          <Animated.View style={[styles.sheetInner, {opacity: contentOpacity}]}>
            <SearchPanel
              onClose={onClose}
              stackNavigation={stackNavigation}
              autoFocus={false}
              inputRef={inputRef}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default HomeSearchOverlay;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.sheetScrim,
    },
    sheet: {
      flex: 1,
      backgroundColor: c.bgElevated,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: Platform.OS === 'android' ? 42 : 50,
      paddingHorizontal: 16,
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: -6},
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 14,
      borderTopWidth: 1,
      borderColor: c.border,
    },
    sheetInner: {
      flex: 1,
    },
    heroBar: {
      position: 'absolute',
      left: 18,
      right: 18,
      height: 49,
      borderRadius: 999,
      backgroundColor: c.bg,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      zIndex: 12,
    },
    heroIconDot: {
      width: 15,
      height: 15,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: c.textHint,
      marginRight: 10,
      opacity: 0.8,
    },
    heroTextLine: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.chip,
      marginRight: 10,
    },
    heroGoPill: {
      width: 34,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.chip,
    },
  });
