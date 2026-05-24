import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {
  ChatMessage,
  formatMessageTime,
  formatVoiceDuration,
} from '../../types/chat';

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

const styles = StyleSheet.create({
  wrap: {paddingTop: 4},
  emptyChat: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 24,
  },
  dateChip: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: '#666666',
    marginBottom: 14,
    overflow: 'hidden',
  },
  systemText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginVertical: 8,
  },
  rowLeft: {alignItems: 'flex-start', marginBottom: 10},
  rowRight: {alignItems: 'flex-end', marginBottom: 10},
  bubbleThem: {
    backgroundColor: '#E8E8E8',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  bubbleMe: {
    backgroundColor: '#003B57',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  textThem: {fontSize: 15, color: '#111111'},
  textMe: {fontSize: 15, color: '#FFFFFF'},
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 14,
    marginBottom: 4,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceIcon: {fontSize: 16, color: '#003B57', marginRight: 6},
  voiceIconMe: {fontSize: 16, color: '#FFFFFF', marginRight: 6},
  timeThem: {
    fontSize: 10,
    color: '#888888',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  timeMe: {
    fontSize: 10,
    color: '#C5DCE6',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
});
