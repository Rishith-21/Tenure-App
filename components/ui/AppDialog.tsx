import React, {useMemo} from 'react';
import {useTheme} from '../../context/ThemeContext';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
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
  const {colors} = useTheme();
  const styles = useMemo(() => createDialogStyles(colors), [colors]);

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
                  indicatorStyle={colors.statusBar === 'light-content' ? 'white' : 'black'}
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

const createDialogStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: c.sheetScrim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: c.card,
    borderRadius: 32, // More rounded
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: c.shadow,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  cardChoice: {
    paddingTop: 24,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: c.meetConfirmedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
    color: c.success,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: c.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  messageChoice: {
    marginBottom: 16,
  },
  choiceWrap: {
    width: '100%',
    marginBottom: 12,
  },
  scrollHint: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  choiceScrollFrame: {
    width: '100%',
    maxHeight: CHOICE_LIST_MAX_HEIGHT,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.bgElevated,
    overflow: 'hidden',
  },
  choiceScroll: {
    width: '100%',
    maxHeight: CHOICE_LIST_MAX_HEIGHT,
  },
  choiceScrollContent: {
    padding: 12,
  },
  scrollFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    backgroundColor: c.bgElevated,
    opacity: 0.8,
  },
  choiceRow: {
    backgroundColor: c.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.border,
  },
  choiceRowPressed: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',
  },
  choiceTextPressed: {
    color: c.bgElevated,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: c.primary,
  },
  destructiveButton: {
    backgroundColor: c.meetPendingConfirmCardBg,
    borderWidth: 1,
    borderColor: c.danger,
  },
  cancelButton: {
    backgroundColor: c.bgElevated,
    borderWidth: 1,
    borderColor: c.border,
  },
  primaryButtonText: {
    color: c.bgElevated,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  destructiveButtonText: {
    color: c.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: c.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  choiceCancel: {
    marginTop: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  choiceCancelText: {
    fontSize: 16,
    color: c.primary,
    fontWeight: '700',
  },
});
