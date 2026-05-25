import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {UI} from '../../theme/ui';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  keyboardAvoiding?: boolean;
  sheetContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Bottom sheet with a full-screen scrim that fades in.
 * Avoids `animationType="slide"` on Modal, which drags the dark overlay up with the sheet.
 */
const BottomSheetModal = ({
  visible,
  onClose,
  children,
  keyboardAvoiding = true,
  sheetContainerStyle,
}: Props) => {
  const body = (
    <View style={styles.root}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      />
      <View style={[styles.sheetSlot, sheetContainerStyle]} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
    </Modal>
  );
};

export default BottomSheetModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: UI.sheetScrim,
  },
  sheetSlot: {
    width: '100%',
  },
});
