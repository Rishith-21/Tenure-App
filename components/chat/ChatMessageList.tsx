import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {
  ChatMessage,
  formatMessageTime,
  formatVoiceDuration,
} from '../../types/chat';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  messages: ChatMessage[];
  playingVoiceId: string | null;
  onPlayVoice: (messageId: string, uri: string) => void;
  sessionLabel?: string;
};

const ChatMessageList = ({
  messages,
  playingVoiceId,
  onPlayVoice,
  sessionLabel,
}: Props) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  if (messages.length === 0) {
    return (
      <Text style={styles.emptyChat}>
        No messages yet. Say hi or send a photo.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {sessionLabel ? (
        <Text style={styles.dateChip}>{sessionLabel}</Text>
      ) : null}
      <Text style={styles.dateChip}>Today</Text>

      {messages.map(msg => {
        if (msg.type === 'system') {
          return (
            <Text key={msg.id} style={styles.systemText}>
              {msg.text}
            </Text>
          );
        }

        const isMe = msg.sender === 'me';
        const rowStyle = isMe ? styles.rowRight : styles.rowLeft;
        const bubbleStyle = isMe ? styles.bubbleMe : styles.bubbleThem;

        return (
          <View key={msg.id} style={rowStyle}>
            <View style={bubbleStyle}>
              {msg.type === 'text' && (
                <Text style={isMe ? styles.textMe : styles.textThem}>
                  {msg.text}
                </Text>
              )}

              {msg.type === 'image' && msg.imageUri ? (
                <Image
                  source={{uri: msg.imageUri}}
                  style={styles.chatImage}
                  resizeMode="cover"
                />
              ) : null}

              {msg.type === 'voice' && msg.voiceUri ? (
                <Pressable
                  style={styles.voiceRow}
                  onPress={() => onPlayVoice(msg.id, msg.voiceUri!)}>
                  <Text style={isMe ? styles.voiceIconMe : styles.voiceIcon}>
                    {playingVoiceId === msg.id ? '⏸' : '▶'}
                  </Text>
                  <Text style={isMe ? styles.textMe : styles.textThem}>
                    Voice {formatVoiceDuration(msg.voiceDurationSec || 0)}
                  </Text>
                </Pressable>
              ) : null}

              <Text style={isMe ? styles.timeMe : styles.timeThem}>
                {formatMessageTime(msg.createdAt)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ChatMessageList;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrap: {paddingTop: 6},
    emptyChat: {
      textAlign: 'center',
      color: c.textHint,
      fontSize: 13,
      marginTop: 24,
    },
    dateChip: {
      alignSelf: 'center',
      backgroundColor: c.card,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 11,
      color: c.textSecondary,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
    },
    systemText: {
      textAlign: 'center',
      color: c.textHint,
      fontSize: 12,
      marginVertical: 8,
    },
    rowLeft: {alignItems: 'flex-start', marginBottom: 8},
    rowRight: {alignItems: 'flex-end', marginBottom: 8},
    bubbleThem: {
      backgroundColor: c.card,
      borderRadius: 16,
      borderBottomLeftRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      maxWidth: '82%',
      borderWidth: 1,
      borderColor: c.border,
    },
    bubbleMe: {
      backgroundColor: c.primary,
      borderRadius: 16,
      borderBottomRightRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      maxWidth: '82%',
    },
    textThem: {fontSize: 14, color: c.text},
    textMe: {fontSize: 14, color: '#FFFFFF'},
    chatImage: {
      width: 196,
      height: 196,
      borderRadius: 12,
      marginBottom: 4,
    },
    voiceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    voiceIcon: {fontSize: 15, color: c.brand, marginRight: 6},
    voiceIconMe: {fontSize: 15, color: '#FFFFFF', marginRight: 6},
    timeThem: {
      fontSize: 10,
      color: c.textHint,
      alignSelf: 'flex-end',
      marginTop: 6,
    },
    timeMe: {
      fontSize: 10,
      color: c.textHint,
      alignSelf: 'flex-end',
      marginTop: 6,
    },
  });
