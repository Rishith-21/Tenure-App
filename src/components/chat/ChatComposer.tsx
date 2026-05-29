import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {formatVoiceDuration} from '../../types/chat';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  message: string;
  onChangeMessage: (text: string) => void;
  onSendText: () => void;
  onAttachPress: () => void;
  onMicPress: () => void;
  isRecording: boolean;
  recordMs: number;
  sending?: boolean;
};

const ChatComposer = ({
  message,
  onChangeMessage,
  onSendText,
  onAttachPress,
  onMicPress,
  isRecording,
  recordMs,
  sending = false,
}: Props) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const canSend = message.trim().length > 0 && !sending;

  return (
    <View style={styles.wrap}>
      {isRecording ? (
        <View style={styles.recordingBanner}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            Recording {formatVoiceDuration(Math.max(1, Math.round(recordMs / 1000)))}{' '}
            — tap mic to send
          </Text>
        </View>
      ) : null}

      <View style={styles.composerRow}>
        <View style={styles.inputShell}>
          <Pressable
            style={styles.attachButton}
            onPress={onAttachPress}
            disabled={isRecording || sending}>
            <Text style={styles.attachIcon}>+</Text>
          </Pressable>

          <TextInput
            placeholder="Type here"
            placeholderTextColor="#9A9A9A"
            value={message}
            onChangeText={onChangeMessage}
            style={styles.messageInput}
            editable={!isRecording && !sending}
            multiline
            maxLength={2000}
            onSubmitEditing={onSendText}
            blurOnSubmit={false}
          />

          <Pressable
            style={[styles.micButton, isRecording && styles.micRecording]}
            onPress={onMicPress}
            disabled={sending}>
            <Text style={styles.micIcon}>{isRecording ? '■' : '🎤'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.sendButton, !canSend && styles.sendDisabled]}
          onPress={onSendText}
          disabled={!canSend}>
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendIcon}>↑</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default ChatComposer;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrap: {
      paddingTop: 4,
    },
    recordingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.chip,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    recordingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.danger,
      marginRight: 8,
    },
    recordingText: {
      fontSize: 12,
      color: c.textSecondary,
      fontWeight: '600',
    },
    composerRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingBottom: 14,
    },
    inputShell: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: c.card,
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginRight: 10,
      borderWidth: 1,
      borderColor: c.border,
      minHeight: 50,
    },
    attachButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: c.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
      marginBottom: 4,
    },
    attachIcon: {
      fontSize: 20,
      color: c.textSecondary,
      fontWeight: '600',
      marginTop: -2,
    },
    messageInput: {
      flex: 1,
      fontSize: 15,
      color: c.text,
      paddingVertical: 8,
      maxHeight: 100,
    },
    micButton: {
      paddingHorizontal: 8,
      paddingBottom: 6,
      borderRadius: 10,
    },
    micRecording: {
      backgroundColor: c.chip,
      paddingHorizontal: 10,
    },
    micIcon: {fontSize: 17, color: c.text},
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendDisabled: {
      opacity: 0.45,
    },
    sendIcon: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '700',
      marginTop: -2,
    },
  });
