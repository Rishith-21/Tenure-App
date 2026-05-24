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

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 13,
    color: '#B71C1C',
    fontWeight: '600',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 22,
  },
  inputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8E0D6',
    minHeight: 52,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  attachIcon: {
    fontSize: 22,
    color: '#333333',
    fontWeight: '600',
    marginTop: -2,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 8,
    maxHeight: 100,
  },
  micButton: {
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  micRecording: {
    backgroundColor: '#FFCDD2',
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  micIcon: {fontSize: 18},
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#003B57',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.45,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
});
