import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import {useAppDialog} from '../../context/DialogContext';

type Props = {
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  onBack: () => void;
};

const ChatHeader = ({
  mateName,
  mateTenureId,
  mateAvatar,
  onBack,
}: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const {showAlert, showConfirm} = useAppDialog();

  const handleBlock = () => {
    setMenuVisible(false);
    showConfirm({
      title: 'Block user',
      message: `Block ${mateName}? You will no longer receive messages from them.`,
      confirmText: 'Block',
      destructive: true,
      onConfirm: () => {
        showAlert({
          title: 'Blocked',
          message: `${mateName} has been blocked.`,
        });
      },
    });
  };

  const handleReport = () => {
    setMenuVisible(false);
    showConfirm({
      title: 'Report user',
      message: `Report ${mateName} for review?`,
      confirmText: 'Report',
      destructive: true,
      onConfirm: () => {
        showAlert({
          title: 'Report submitted',
          message: 'Thank you. Our team will review this.',
        });
      },
    });
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <Image source={{uri: mateAvatar}} style={styles.avatar} />

      <View style={styles.headerTextBlock}>
        <Text style={styles.mateName}>{mateName}</Text>
        <Text style={styles.mateId}>Tenure id: {mateTenureId}</Text>
      </View>

      <Pressable style={styles.callButton}>
        <Text style={styles.callIcon}>📞</Text>
      </Pressable>

      <Pressable
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}>
        <Text style={styles.menuIcon}>⋮</Text>
      </Pressable>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}>
          <View style={styles.menuDropdown}>
            <Pressable style={styles.menuItem} onPress={handleBlock}>
              <Text style={styles.menuItemTextDanger}>Block</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuItem} onPress={handleReport}>
              <Text style={styles.menuItemTextDanger}>Report</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {marginRight: 8},
  backArrow: {fontSize: 26, color: '#111111'},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  headerTextBlock: {flex: 1},
  mateName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003B57',
  },
  mateId: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D6',
    marginRight: 8,
  },
  callIcon: {fontSize: 18},
  menuButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    color: '#333333',
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    minWidth: 160,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemTextDanger: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 12,
  },
});
