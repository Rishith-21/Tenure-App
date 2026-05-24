import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

export type AppDialogButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppDialogButton = {
  text: string;
  onPress?: () => void;
  style?: AppDialogButtonStyle;
};

export type AppDialogConfig = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AppDialogButton[];
};

type Props = AppDialogConfig & {
  onDismiss: () => void;
};

const AppDialog = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
}: Props) => {
  const handlePress = (button: AppDialogButton) => {
    onDismiss();
    button.onPress?.();
  };

  const isChoiceList = buttons.length > 2;
  const hasCancel = buttons.some(b => b.style === 'cancel');
  const actionButtons = buttons.filter(b => b.style !== 'cancel');
  const cancelButton = buttons.find(b => b.style === 'cancel');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={styles.card}
          onPress={e => e.stopPropagation()}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {isChoiceList ? (
            <ScrollView
              style={styles.choiceScroll}
              showsVerticalScrollIndicator={false}>
              {buttons
                .filter(b => b.style !== 'cancel')
                .map((button, index) => (
                  <Pressable
                    key={`${button.text}-${index}`}
                    style={styles.choiceRow}
                    onPress={() => handlePress(button)}>
                    <Text style={styles.choiceText}>{button.text}</Text>
                  </Pressable>
                ))}
            </ScrollView>
          ) : (
            <View style={styles.actionsRow}>
              {hasCancel && cancelButton ? (
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => handlePress(cancelButton)}>
                  <Text style={styles.cancelButtonText}>
                    {cancelButton.text}
                  </Text>
                </Pressable>
              ) : null}

              {actionButtons.map((button, index) => (
                <Pressable
                  key={`${button.text}-${index}`}
                  style={[
                    styles.button,
                    button.style === 'destructive'
                      ? styles.destructiveButton
                      : styles.primaryButton,
                    !hasCancel && actionButtons.length === 1
                      ? styles.buttonFull
                      : null,
                  ]}
                  onPress={() => handlePress(button)}>
                  <Text
                    style={
                      button.style === 'destructive'
                        ? styles.destructiveButtonText
                        : styles.primaryButtonText
                    }>
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {isChoiceList && cancelButton ? (
            <Pressable
              style={styles.choiceCancel}
              onPress={() => handlePress(cancelButton)}>
              <Text style={styles.choiceCancelText}>{cancelButton.text}</Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AppDialog;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D6',
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
    color: '#003B57',
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonFull: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#003B57',
  },
  destructiveButton: {
    backgroundColor: '#FEE8E8',
    borderWidth: 1,
    borderColor: '#F5C2C2',
  },
  cancelButton: {
    backgroundColor: '#F3F0EB',
    borderWidth: 1,
    borderColor: '#E5DDD3',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  destructiveButtonText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: '#444444',
    fontSize: 16,
    fontWeight: '600',
  },
  choiceScroll: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 8,
  },
  choiceRow: {
    backgroundColor: '#F7F2EA',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E0D6',
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#003B57',
    textAlign: 'center',
  },
  choiceCancel: {
    marginTop: 6,
    paddingVertical: 10,
  },
  choiceCancelText: {
    fontSize: 15,
    color: '#888888',
    fontWeight: '600',
  },
});
