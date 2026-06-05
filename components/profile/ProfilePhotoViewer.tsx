import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  uri: string;
  name?: string;
  onClose: () => void;
};

/** Full-screen profile photo with static dim scrim (tap outside to close). */
const ProfilePhotoViewer = ({visible, uri, name, onClose}: Props) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={[styles.root, {backgroundColor: colors.sheetScrim}]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close photo"
        />
        <View
          style={[
            styles.toolbar,
            {paddingTop: insets.top + 8, paddingHorizontal: 16},
          ]}
          pointerEvents="box-none">
          <Pressable
            style={[styles.closeBtn, {backgroundColor: 'rgba(255,255,255,0.14)'}]}
            onPress={onClose}
            hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          {name ? (
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          ) : (
            <View style={styles.nameSpacer} />
          )}
        </View>
        <Pressable
          style={styles.imageWrap}
          onPress={e => e.stopPropagation()}
          accessibilityLabel="Profile photo">
          <Image
            source={{uri}}
            style={{
              width: width - 32,
              height: Math.min(height * 0.62, width - 32),
              borderRadius: 20,
            }}
            resizeMode="cover"
          />
        </Pressable>
        <Text style={styles.hint}>Tap to close</Text>
      </View>
    </Modal>
  );
};

export default ProfilePhotoViewer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  name: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  nameSpacer: {
    flex: 1,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 48,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
  },
});
