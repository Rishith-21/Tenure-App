import React, {useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

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

const MENU_WIDTH = 200;
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
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarUri = profileAvatar.trim();

  if (!anchor) {
    return null;
  }

  const menuTop = anchor.y + anchor.height + 8;
  let menuLeft = anchor.x + anchor.width - MENU_WIDTH;
  menuLeft = Math.max(EDGE, Math.min(menuLeft, SCREEN_W - MENU_WIDTH - EDGE));

  const menuHeight = 168;
  const menuBottom = menuTop + menuHeight;
  const flipAbove = menuBottom > SCREEN_H - EDGE;
  const top = flipAbove ? anchor.y - 8 - menuHeight : menuTop;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.menu, {top, left: menuLeft, width: MENU_WIDTH}]}>
          <Pressable
            style={({pressed}) => [
              styles.menuRow,
              pressed && styles.menuRowPressed,
            ]}
            onPress={onOpenProfile}>
            {avatarUri ? (
              <Image source={{uri: avatarUri}} style={styles.menuAvatar} />
            ) : (
              <View style={[styles.menuAvatar, styles.menuAvatarPlaceholder]}>
                <Text style={styles.menuAvatarInitial}>T</Text>
              </View>
            )}
            <Text style={styles.menuRowText}>Profile</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({pressed}) => [
              styles.menuRow,
              pressed && styles.menuRowPressed,
            ]}
            onPress={onPrivacyPolicy}>
            <Text style={styles.menuRowText}>Privacy</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.menuRow,
              pressed && styles.menuRowPressed,
            ]}
            onPress={onTrustyAlert}>
            <Text style={styles.menuRowText}>Trusty alert</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default HomeUpdateModal;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.sheetScrim,
    },
    menu: {
      position: 'absolute',
      backgroundColor: c.bg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 6,
      overflow: 'hidden',
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    menuRowPressed: {
      backgroundColor: c.chip,
    },
    menuAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    menuAvatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    menuAvatarInitial: {
      fontSize: 12,
      fontWeight: '900',
      color: c.brand,
    },
    menuRowText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginHorizontal: 12,
    },
  });
