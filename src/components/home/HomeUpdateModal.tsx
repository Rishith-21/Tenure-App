import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import {UI} from '../../theme/ui';

export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  anchor: MenuAnchor | null;
  profileAvatar: string;
  onClose: () => void;
  onOpenProfile: () => void;
  onPrivacyPolicy: () => void;
  onTrustyAlert: () => void;
};

const MENU_WIDTH = 188;
const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
const EDGE = 12;

const HomeUpdateModal = ({
  visible,
  anchor,
  profileAvatar,
  onClose,
  onOpenProfile,
  onPrivacyPolicy,
  onTrustyAlert,
}: Props) => {
  if (!anchor) {
    return null;
  }

  const menuTop = anchor.y + anchor.height + 6;
  let menuLeft = anchor.x + anchor.width - MENU_WIDTH;
  menuLeft = Math.max(EDGE, Math.min(menuLeft, SCREEN_W - MENU_WIDTH - EDGE));

  const menuBottom = menuTop + 168;
  const flipAbove = menuBottom > SCREEN_H - EDGE;
  const top = flipAbove ? anchor.y - 6 - 168 : menuTop;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.menu,
            {
              top,
              left: menuLeft,
              width: MENU_WIDTH,
            },
          ]}>
          <Pressable
            style={({pressed}) => [
              styles.menuRow,
              styles.menuRowFirst,
              pressed && styles.menuRowPressed,
            ]}
            onPress={onOpenProfile}>
            <Image source={{uri: profileAvatar}} style={styles.menuAvatar} />
            <Text style={styles.menuRowText}>Profile</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({pressed}) => [
              styles.menuRow,
              pressed && styles.menuRowPressed,
            ]}
            onPress={onPrivacyPolicy}>
            <View style={styles.menuBullet} />
            <Text style={styles.menuRowText}>Privacy</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.menuRow,
              styles.menuRowLast,
              pressed && styles.menuRowPressed,
            ]}
            onPress={onTrustyAlert}>
            <View style={[styles.menuBullet, styles.menuBulletAccent]} />
            <Text style={styles.menuRowText}>Trusty alert</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default HomeUpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.28)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: UI.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UI.borderInput,
    paddingVertical: 4,
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  menuRowFirst: {
    paddingTop: 8,
  },
  menuRowLast: {
    paddingBottom: 8,
  },
  menuRowPressed: {
    backgroundColor: '#F0F7FA',
  },
  menuAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: UI.borderInput,
  },
  menuRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: UI.text,
  },
  menuBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UI.textHint,
    marginLeft: 11,
    marginRight: 3,
  },
  menuBulletAccent: {
    backgroundColor: UI.brandMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI.border,
    marginHorizontal: 10,
  },
});
