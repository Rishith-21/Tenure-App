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
import {useTheme} from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  keyboardAvoiding?: boolean;
  sheetContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Simple bottom sheet slot with the same black screen scrim as DraggableBottomDrawer.
 */
const BottomSheetModal = ({
  visible,
  onClose,
  children,
  keyboardAvoiding = true,
  sheetContainerStyle,
}: Props) => {
  const {colors} = useTheme();

  const body = (
    <View style={[styles.root, {backgroundColor: colors.sheetScrim}]}>
      <Pressable
        style={styles.backdropPress}
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
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent>
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
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetSlot: {
    width: '100%',
  },
});
