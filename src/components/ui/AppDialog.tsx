import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import {UI} from '../../theme/ui';

const CHOICE_LIST_MAX_HEIGHT = Math.min(
  Dimensions.get('window').height * 0.5,
  400,
);

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
  const choiceOptions = buttons.filter(b => b.style !== 'cancel');
  const showScrollHint = choiceOptions.length > 4;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.card, isChoiceList && styles.cardChoice]}
          onPress={e => e.stopPropagation()}>
          {!isChoiceList ? (
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>✓</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{title}</Text>
          {message ? (
            <Text style={[styles.message, isChoiceList && styles.messageChoice]}>
              {message}
            </Text>
          ) : null}

          {isChoiceList ? (
            <View style={styles.choiceWrap}>
              {showScrollHint ? (
                <Text style={styles.scrollHint}>Scroll for more options ↓</Text>
              ) : null}
              <View style={styles.choiceScrollFrame}>
                <ScrollView
                  style={styles.choiceScroll}
                  contentContainerStyle={styles.choiceScrollContent}
                  showsVerticalScrollIndicator
                  indicatorStyle="black"
                  nestedScrollEnabled
                  bounces>
                  {choiceOptions.map((button, index) => (
                    <Pressable
                      key={`${button.text}-${index}`}
                      style={({pressed}) => [
                        styles.choiceRow,
                        pressed && styles.choiceRowPressed,
                      ]}
                      onPress={() => handlePress(button)}>
                      {({pressed}) => (
                        <Text
                          style={[
                            styles.choiceText,
                            pressed && styles.choiceTextPressed,
                          ]}>
                          {button.text}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
                {showScrollHint ? <View style={styles.scrollFade} pointerEvents="none" /> : null}
              </View>
            </View>
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
    backgroundColor: UI.sheetScrim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: UI.card,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI.borderInput,
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  cardChoice: {
    paddingTop: 22,
    maxHeight: Dimensions.get('window').height * 0.82,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: UI.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
    color: UI.text,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: UI.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: UI.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  messageChoice: {
    marginBottom: 12,
  },
  choiceWrap: {
    width: '100%',
    marginBottom: 8,
  },
  scrollHint: {
    fontSize: 12,
    fontWeight: '600',
    color: UI.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
  choiceScrollFrame: {
    width: '100%',
    maxHeight: CHOICE_LIST_MAX_HEIGHT,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: UI.borderInput,
    backgroundColor: UI.cardMuted,
    overflow: 'hidden',
  },
  choiceScroll: {
    width: '100%',
    maxHeight: CHOICE_LIST_MAX_HEIGHT,
  },
  choiceScrollContent: {
    padding: 10,
    paddingBottom: 14,
  },
  scrollFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: 'rgba(229, 231, 233, 0.92)',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
  },
  choiceRow: {
    backgroundColor: UI.card,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: UI.borderInput,
  },
  choiceRowPressed: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    color: UI.text,
    textAlign: 'center',
  },
  choiceTextPressed: {
    color: '#FFFFFF',
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
    backgroundColor: UI.primary,
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
  choiceCancel: {
    marginTop: 8,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  choiceCancelText: {
    fontSize: 15,
    color: UI.textHint,
    fontWeight: '600',
  },
});
