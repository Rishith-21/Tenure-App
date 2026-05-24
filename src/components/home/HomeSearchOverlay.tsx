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
import {UI} from '../../theme/ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  stackNavigation?: {navigate: (name: string, params?: object) => void};
};

const HomeSearchOverlay = ({visible, onClose, stackNavigation}: Props) => {
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
          duration: 320,
          easing: Easing.out(Easing.cubic),
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
        duration: 240,
        easing: Easing.in(Easing.cubic),
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
    outputRange: [0, 0.42],
  });

  const sheetTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-28, 0],
  });

  const sheetScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0.3, 1],
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />
      <View style={styles.root}>
        <Animated.View
          style={[styles.backdrop, {opacity: backdropOpacity}]}
          pointerEvents={visible ? 'auto' : 'none'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: progress,
              transform: [{translateY: sheetTranslateY}, {scale: sheetScale}],
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a2836',
  },
  sheet: {
    flex: 1,
    backgroundColor: UI.bgCream,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: Platform.OS === 'android' ? 44 : 52,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetInner: {
    flex: 1,
  },
});
