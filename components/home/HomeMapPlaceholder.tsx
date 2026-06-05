import React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {UI} from '../../theme/ui';

type Props = {
  /** Tap empty map — peek meet dates panel on Home */
  onBackdropPress?: () => void;
};

/** Light map stand-in until tiles / SDK are wired */
const HomeMapPlaceholder = ({onBackdropPress}: Props) => (
  <Pressable
    style={styles.pressable}
    onPress={onBackdropPress}
    accessibilityRole="image"
    accessibilityLabel="Map">
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.roadH} />
      <View style={styles.roadV} />
      <View style={styles.roadH2} />
      <View style={styles.pinWrap} pointerEvents="none">
        <View style={styles.pinRing}>
          <View style={styles.pinCore} />
        </View>
      </View>
    </View>
  </Pressable>
);

export default HomeMapPlaceholder;

const styles = StyleSheet.create({
  pressable: {flex: 1},
  container: {
    flex: 1,
    backgroundColor: '#E6ECEF',
    overflow: 'hidden',
  },
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '44%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  roadH2: {
    position: 'absolute',
    left: '12%',
    right: '18%',
    top: '62%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 3,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '38%',
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  pinWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '46%',
    alignItems: 'center',
  },
  pinRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#012E41',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  pinCore: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: UI.brand,
  },
});
