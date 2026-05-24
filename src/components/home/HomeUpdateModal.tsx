import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';

type Props = {
  visible: boolean;
  profileAvatar: string;
  onClose: () => void;
  onOpenProfile: () => void;
  onPrivacyPolicy: () => void;
  onTrustyAlert: () => void;
};

const HomeUpdateModal = ({
  visible,
  profileAvatar,
  onClose,
  onOpenProfile,
  onPrivacyPolicy,
  onTrustyAlert,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Pressable style={styles.profileTile} onPress={onOpenProfile}>
            <Image source={{uri: profileAvatar}} style={styles.profileImage} />
            <Text style={styles.profileLabel}>Profile</Text>
          </Pressable>

          <Pressable style={styles.actionPill} onPress={onPrivacyPolicy}>
            <Text style={styles.actionText}>Privacy Policy...</Text>
          </Pressable>

          <Pressable style={styles.actionPill} onPress={onTrustyAlert}>
            <Text style={styles.actionText}>Trusty alert !</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default HomeUpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#E4E8EC',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
  },
  profileTile: {
    width: '100%',
    backgroundColor: '#D5DBE1',
    borderRadius: 22,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 18,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  actionPill: {
    width: '100%',
    backgroundColor: '#F0F2F5',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D0D6DC',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
});
