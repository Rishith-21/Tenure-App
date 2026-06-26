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
import {useTheme} from '../../context/ThemeContext';
import BackButton from '../navigation/BackButton';
import { blockUser, submitReport } from '../../utils/api';

type Props = {
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  mateUserId?: string;
  onBack: () => void;
};

const ChatHeader = ({
  mateName,
  mateTenureId,
  mateAvatar,
  mateUserId,
  onBack,
}: Props) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [menuVisible, setMenuVisible] = useState(false);
  const {showAlert, showConfirm} = useAppDialog();
  const avatarUri = mateAvatar.trim();
  const avatarInitial = (mateName.trim().charAt(0) || 'T').toUpperCase();

  const handleBlock = () => {
    setMenuVisible(false);
    showConfirm({
      title: 'Block user',
      message: `Block ${mateName}? You will no longer receive messages from them.`,
      confirmText: 'Block',
      destructive: true,
      onConfirm: async () => {
        if (!mateUserId) {
          showAlert({
            title: 'Block Failed',
            message: 'User ID is missing.',
          });
          return;
        }
        try {
          await blockUser(mateUserId);
          showAlert({
            title: 'Blocked',
            message: `${mateName} has been blocked.`,
          });
        } catch (error: any) {
          showAlert({
            title: 'Block Failed',
            message: error?.message || 'Could not block user.',
          });
        }
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
      onConfirm: async () => {
        if (!mateUserId) {
          showAlert({
            title: 'Report Failed',
            message: 'User ID is missing.',
          });
          return;
        }
        try {
          await submitReport('abuse', `Reported from chat conversation with ${mateName}`, mateUserId);
          showAlert({
            title: 'Report submitted',
            message: 'Thank you. Our team will review this.',
          });
        } catch (error: any) {
          showAlert({
            title: 'Report Failed',
            message: error?.message || 'Could not submit report.',
          });
        }
      },
    });
  };

  return (
    <View style={styles.header}>
      <BackButton onPress={onBack} style={styles.backButtonSlot} />

      {avatarUri ? (
        <Image source={{uri: avatarUri}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{avatarInitial}</Text>
        </View>
      )}

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

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backButtonSlot: {marginRight: 8},
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      marginRight: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    avatarInitial: {
      fontSize: 17,
      fontWeight: '900',
      color: c.brand,
    },
    headerTextBlock: {flex: 1},
    mateName: {
      fontSize: 18,
      fontWeight: '700',
      color: c.brandDark,
    },
    mateId: {
      fontSize: 12,
      color: c.textHint,
      marginTop: 2,
    },
    callButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
      marginRight: 6,
    },
    callIcon: {fontSize: 17},
    menuButton: {
      width: 34,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    menuIcon: {
      fontSize: 20,
      color: c.textSecondary,
      fontWeight: '700',
    },
    menuOverlay: {
      flex: 1,
      backgroundColor: c.sheetScrim,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 96,
      paddingRight: 20,
    },
    menuDropdown: {
      backgroundColor: c.card,
      borderRadius: 12,
      minWidth: 156,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
    menuItem: {
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    menuItemTextDanger: {
      fontSize: 15,
      color: c.danger,
      fontWeight: '600',
    },
    menuDivider: {
      height: 1,
      backgroundColor: c.border,
      marginHorizontal: 12,
    },
  });
