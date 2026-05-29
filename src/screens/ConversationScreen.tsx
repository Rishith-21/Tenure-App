import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatComposer from '../components/chat/ChatComposer';
import {useVoiceRecorder} from '../hooks/useVoiceRecorder';
import {
  ChatMessage,
  createMessageId,
} from '../types/chat';
import {showPhotoPickerActions} from '../utils/chatMedia';
import {
  MAX_TENURE_SECONDS,
  useActiveSessionStore,
} from '../store/activeSessionStore';
import {useTheme} from '../context/ThemeContext';

export type ChatFlow =
  | 'active'
  | 'outgoing_request'
  | 'incoming_request'
  | 'incoming_otp';

export type ConversationParams = {
  chatFlow: ChatFlow;
  mateName: string;
  mateTenureId: string;
  mateAvatar: string;
  sessionLabel: string;
  meetDetails?: string;
  requestSentAt?: string;
  initialElapsedSec?: number;
  /** OTP Eagle must enter (set when requester sends OTP). */
  sessionOtp?: string;
};

type TenureTimerStatus =
  | 'running'
  | 'pause_requested'
  | 'paused'
  | 'resume_requested';

type OutgoingPhase = 'awaiting_confirm' | 'otp_sent';

type IncomingPhase = 'waiting_confirmation' | 'otp_display';

const formatTimerShort = (totalSec: number) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')} mins`;
};

const generateOtp = () =>
  String(Math.floor(1000 + Math.random() * 9000));

const CHAT_ENABLED_FLOWS: ChatFlow[] = [
  'active',
  'outgoing_request',
  'incoming_request',
];

const seedMessages = (mateName: string): ChatMessage[] => [
  {
    id: createMessageId(),
    sender: 'them',
    type: 'text',
    text: 'hi',
    createdAt: Date.now() - 360000,
  },
  {
    id: createMessageId(),
    sender: 'them',
    type: 'text',
    text: '📞 Missed call',
    createdAt: Date.now() - 300000,
  },
  {
    id: createMessageId(),
    sender: 'me',
    type: 'text',
    text: `hello ${mateName}`,
    createdAt: Date.now() - 120000,
  },
];

const ConversationScreen = ({navigation, route}: any) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const params = (route.params || {}) as ConversationParams;
  const {
    chatFlow = 'active',
    mateName = 'Swan',
    mateTenureId = 'V8HDF533',
    mateAvatar = 'https://i.pravatar.cc/150?img=12',
    sessionLabel = '12-12-2024 7.00 Hours',
    meetDetails = 'meet on 26-12-2026 Pay 67 Per Hour',
    requestSentAt = '22-08-2026 12:31 PM',
    initialElapsedSec = 283,
    sessionOtp: routeSessionOtp,
  } = params;

  const [sessionStarted, setSessionStarted] = useState(chatFlow === 'active');
  const [outgoingPhase, setOutgoingPhase] =
    useState<OutgoingPhase>('awaiting_confirm');
  const [incomingPhase, setIncomingPhase] =
    useState<IncomingPhase>('waiting_confirmation');
  const [generatedOtp, setGeneratedOtp] = useState(routeSessionOtp || '');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [confirmingIncoming, setConfirmingIncoming] = useState(false);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const [elapsedSec, setElapsedSec] = useState(initialElapsedSec);
  const [timerStatus, setTimerStatus] = useState<TenureTimerStatus>('running');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    CHAT_ENABLED_FLOWS.includes(chatFlow) ? seedMessages(mateName) : [],
  );
  const scrollRef = useRef<ScrollView>(null);
  const autoStoppedRef = useRef(false);
  const startGlobalSession = useActiveSessionStore(s => s.startSession);

  const {
    isRecording,
    recordMs,
    playingId,
    startRecording,
    stopRecording,
    playVoice,
  } = useVoiceRecorder();

  const isActiveSession = sessionStarted;

  const startTenureSession = useCallback(() => {
    const [fromDateTime = sessionLabel, toDateTime = sessionLabel] =
      sessionLabel.split(' - ');
    setSessionStarted(true);
    setElapsedSec(0);
    setTimerStatus('running');
    autoStoppedRef.current = false;
    startGlobalSession({
      mateName,
      mateTenureId,
      mateAvatar,
      fromDateTime,
      toDateTime,
      startedAt: Date.now(),
    });
  }, [
    mateAvatar,
    mateName,
    mateTenureId,
    sessionLabel,
    startGlobalSession,
  ]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({animated: true});
    }, 120);
  }, []);

  const appendMessage = useCallback(
    (partial: Omit<ChatMessage, 'id' | 'createdAt'>) => {
      const entry: ChatMessage = {
        id: createMessageId(),
        createdAt: Date.now(),
        ...partial,
      };
      setMessages(prev => [...prev, entry]);
      scrollToBottom();
      return entry;
    },
    [scrollToBottom],
  );

  const handleSendText = useCallback(() => {
    const text = message.trim();
    if (!text) {
      return;
    }

    appendMessage({
      sender: 'me',
      type: 'text',
      text,
    });
    setMessage('');
  }, [appendMessage, message]);

  const handleSendImage = useCallback(
    (uri: string) => {
      appendMessage({
        sender: 'me',
        type: 'image',
        imageUri: uri,
      });
    },
    [appendMessage],
  );

  const handleAttachPress = useCallback(() => {
    showPhotoPickerActions(handleSendImage);
  }, [handleSendImage]);

  const handleMicPress = useCallback(async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result?.uri) {
        appendMessage({
          sender: 'me',
          type: 'voice',
          voiceUri: result.uri,
          voiceDurationSec: result.durationSec,
        });
      }
      return;
    }

    await startRecording();
  }, [
    appendMessage,
    isRecording,
    startRecording,
    stopRecording,
  ]);

  useEffect(() => {
    if (!isActiveSession || timerStatus !== 'running') {
      return;
    }

    const id = setInterval(() => {
      setElapsedSec(prev => {
        if (prev >= MAX_TENURE_SECONDS) {
          return prev;
        }
        const next = prev + 1;
        if (next >= MAX_TENURE_SECONDS) {
          setTimerStatus('paused');
          if (!autoStoppedRef.current) {
            autoStoppedRef.current = true;
            appendMessage({
              sender: 'system',
              type: 'system',
              text: 'Tenure auto-stopped after 24 hours for safety.',
            });
          }
          return MAX_TENURE_SECONDS;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [appendMessage, isActiveSession, timerStatus]);

  const handleStopPress = () => {
    if (timerStatus === 'running') {
      setTimerStatus('pause_requested');
      return;
    }

    if (timerStatus === 'paused') {
      setTimerStatus('resume_requested');
    }
  };

  const simulatePartnerConfirmedBreak = () => {
    if (timerStatus === 'pause_requested') {
      setTimerStatus('paused');
    }
  };

  const simulatePartnerConfirmedResume = () => {
    if (timerStatus === 'resume_requested') {
      setTimerStatus('running');
    }
  };

  const handleConfirmAndSendOtp = () => {
    setSendingOtp(true);
    const otp = generateOtp();

    setTimeout(() => {
      setGeneratedOtp(otp);
      setSendingOtp(false);
      setOutgoingPhase('otp_sent');
    }, 1200);
  };

  const openReceiverPreview = () => {
    navigation.replace('Conversation', {
      ...params,
      chatFlow: 'incoming_otp',
      sessionOtp: generatedOtp,
    });
  };

  const handleConfirmIncomingRequest = () => {
    setConfirmingIncoming(true);
    const otp = generateOtp();

    setTimeout(() => {
      setGeneratedOtp(otp);
      setIncomingPhase('otp_display');
      setConfirmingIncoming(false);
    }, 1000);
  };

  const simulateRequesterEnteredOtp = () => {
    startTenureSession();
    appendMessage({
      sender: 'system',
      type: 'system',
      text: 'Meet confirmed. Hourly billing has started.',
    });
  };

  const handleOtpChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) {
      return;
    }

    const next = [...otpDigits];
    next[index] = text;
    setOtpDigits(next);
    setOtpError('');

    if (text && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (text && index === 3) {
      const code = next.join('');
      if (code.length === 4) {
        verifyOtp(code);
      }
    }
  };

  const verifyOtp = (code: string) => {
    const expected = generatedOtp || routeSessionOtp || '';

    if (code !== expected) {
      setOtpError('Invalid OTP. Ask your mate to share the code.');
      return;
    }

    setOtpError('');
    startTenureSession();

    if (messages.length === 0) {
      setMessages(seedMessages(mateName));
    }

    appendMessage({
      sender: 'system',
      type: 'system',
      text: 'Meet confirmed. Hourly billing has started.',
    });
  };

  const timerButtonLabel =
    timerStatus === 'running'
      ? 'stop'
      : timerStatus === 'pause_requested'
        ? 'waiting…'
        : timerStatus === 'resume_requested'
          ? 'waiting…'
          : 'resume';

  const statusHint = !isActiveSession
    ? null
    : timerStatus === 'running'
      ? 'Tenure time is running — hourly fees are counting'
      : timerStatus === 'pause_requested'
        ? `Waiting for ${mateName} to confirm the break`
        : timerStatus === 'resume_requested'
          ? `Waiting for ${mateName} to confirm resume`
          : 'Break confirmed — tap resume when you are ready';

  const renderCreamCard = () => (
    <View style={styles.creamCard}>
      <View style={styles.pinkCardTopRow}>
        <Pressable style={styles.cancelPill}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Text style={styles.pinkCardTime}>{requestSentAt}</Text>
      </View>

      <Text style={styles.pinkCardMeet}>{meetDetails}</Text>

      {incomingPhase === 'waiting_confirmation' && (
        <>
          <View style={styles.waitingPill}>
            <Text style={styles.waitingPillText}>
              Waiting for Confirmation
            </Text>
          </View>

          <Pressable
            style={styles.confirmIncomingButton}
            onPress={handleConfirmIncomingRequest}
            disabled={confirmingIncoming}>
            {confirmingIncoming ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={styles.confirmIncomingText}>
                Confirm request
              </Text>
            )}
          </Pressable>
        </>
      )}

      {incomingPhase === 'otp_display' && (
        <>
          <Text style={styles.otpDisclaimer}>
            *your hourly amount counting will start only after entering the
            OTP.
          </Text>

          <View style={styles.otpDisplayRow}>
            {generatedOtp.split('').map((digit, index) => (
              <Text key={`${digit}-${index}`} style={styles.otpDisplayDigit}>
                {digit}
              </Text>
            ))}
          </View>

          <Text style={styles.otpShareHint}>
            Share this OTP with {mateName}. They must enter it in their chat
            to start billing.
          </Text>

          <Pressable
            style={styles.demoSwitchButton}
            onPress={simulateRequesterEnteredOtp}>
            <Text style={styles.demoSwitchText}>
              (Demo) {mateName} entered OTP — start session
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );

  const renderPinkCard = () => {
    const showOtpEntry = chatFlow === 'incoming_otp' && !sessionStarted;

    return (
      <View style={styles.pinkCard}>
        <View style={styles.pinkCardTopRow}>
          <Pressable style={styles.cancelPill}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.pinkCardTime}>{requestSentAt}</Text>
        </View>

        <Text style={styles.pinkCardMeet}>{meetDetails}</Text>

        {outgoingPhase === 'awaiting_confirm' && chatFlow === 'outgoing_request' && (
          <Pressable
            style={styles.confirmOtpButton}
            onPress={handleConfirmAndSendOtp}
            disabled={sendingOtp}>
            {sendingOtp ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <Text style={styles.confirmOtpText}>
                Confirm and send OTP
              </Text>
            )}
          </Pressable>
        )}

        {outgoingPhase === 'otp_sent' && chatFlow === 'outgoing_request' && (
          <View style={styles.otpSentBlock}>
            <Text style={styles.otpSentTitle}>
              OTP sent to {mateName}
            </Text>
            <Text style={styles.otpSentCode}>
              Demo code: {generatedOtp}
            </Text>
            <Text style={styles.otpSentHint}>
              {mateName} must enter this OTP in their chat. Hourly billing
              starts only after they confirm.
            </Text>
            <Pressable
              style={styles.demoSwitchButton}
              onPress={openReceiverPreview}>
              <Text style={styles.demoSwitchText}>
                (Demo) Open as {mateName} to enter OTP
              </Text>
            </Pressable>
          </View>
        )}

        {showOtpEntry && (
          <>
            <Text style={styles.otpDisclaimer}>
              *Your hourly amount counting will start only after entering
              the OTP.
            </Text>

            <View style={styles.otpRow}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    otpRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={t => handleOtpChange(t, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.otpBox}
                />
              ))}
            </View>

            {otpError ? (
              <Text style={styles.otpError}>{otpError}</Text>
            ) : null}

            {routeSessionOtp ? (
              <Pressable
                style={styles.demoSwitchButton}
                onPress={() => verifyOtp(routeSessionOtp)}>
                <Text style={styles.demoSwitchText}>
                  (Demo) Auto-fill OTP {routeSessionOtp}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    );
  };

  const renderRequestCard = () => {
    if (chatFlow === 'incoming_request') {
      return renderCreamCard();
    }
    if (chatFlow === 'outgoing_request' || chatFlow === 'incoming_otp') {
      return renderPinkCard();
    }
    return null;
  };

  const renderTimerBar = () => (
    <>
      <View style={styles.timerBar}>
        <View style={styles.timerPill}>
          <Text style={styles.timerIcon}>⏱</Text>
          <Text style={styles.timerValue}>
            {formatTimerShort(elapsedSec)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.stopButton,
            timerStatus !== 'running' && styles.stopButtonMuted,
          ]}
          onPress={handleStopPress}
          disabled={
            timerStatus === 'pause_requested' ||
            timerStatus === 'resume_requested'
          }>
          <Text style={styles.stopButtonText}>{timerButtonLabel}</Text>
        </Pressable>
      </View>

      {timerStatus === 'pause_requested' && (
        <Pressable
          style={styles.demoConfirmRow}
          onPress={simulatePartnerConfirmedBreak}>
          <Text style={styles.demoConfirmText}>
            (Demo) {mateName} confirms break
          </Text>
        </Pressable>
      )}

      {timerStatus === 'resume_requested' && (
        <Pressable
          style={styles.demoConfirmRow}
          onPress={simulatePartnerConfirmedResume}>
          <Text style={styles.demoConfirmText}>
            (Demo) {mateName} confirms resume
          </Text>
        </Pressable>
      )}

      {statusHint ? (
        <Text style={styles.statusHint}>{statusHint}</Text>
      ) : null}
    </>
  );

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <ChatHeader
            mateName={mateName}
            mateTenureId={mateTenureId}
            mateAvatar={mateAvatar}
            onBack={() => navigation.goBack()}
          />

          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>{sessionLabel}</Text>
          </View>

          {!isActiveSession && renderRequestCard()}

          {isActiveSession && renderTimerBar()}

          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToBottom}>
            {!isActiveSession &&
            chatFlow === 'outgoing_request' &&
            outgoingPhase === 'otp_sent' ? (
              <Text style={styles.waitingBanner}>
                Waiting for {mateName} to enter the OTP… You can still chat
                below.
              </Text>
            ) : null}

            {!isActiveSession &&
            chatFlow === 'incoming_request' &&
            incomingPhase === 'otp_display' ? (
              <Text style={styles.waitingBanner}>
                Share the OTP with {mateName}. Chat is open while you wait.
              </Text>
            ) : null}

            <ChatMessageList
              messages={messages}
              playingVoiceId={playingId}
              onPlayVoice={playVoice}
              sessionLabel={
                isActiveSession ? undefined : sessionLabel
              }
            />
          </ScrollView>

          <ChatComposer
            message={message}
            onChangeMessage={setMessage}
            onSendText={handleSendText}
            onAttachPress={handleAttachPress}
            onMicPress={handleMicPress}
            isRecording={isRecording}
            recordMs={recordMs}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ConversationScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    flex: {flex: 1},
    container: {
      flex: 1,
      backgroundColor: c.bgElevated,
      paddingTop: 36,
      paddingHorizontal: 16,
    },
    sessionBadge: {
      alignSelf: 'flex-start',
      backgroundColor: c.card,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    sessionBadgeText: {
      fontSize: 11,
      color: c.textSecondary,
      fontWeight: '600',
    },
    pinkCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    creamCard: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    waitingPill: {
      backgroundColor: c.bgElevated,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 10,
    },
    waitingPillText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    confirmIncomingButton: {
      backgroundColor: c.chip,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.primary,
    },
    confirmIncomingText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.primary,
    },
    otpDisplayRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 12,
    },
    otpDisplayDigit: {
      fontSize: 30,
      fontWeight: '800',
      color: c.text,
      marginHorizontal: 8,
    },
    otpShareHint: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 8,
    },
    pinkCardTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    cancelPill: {
      backgroundColor: c.bgElevated,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: c.border,
    },
    cancelText: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },
    pinkCardTime: {
      fontSize: 11,
      color: c.textHint,
    },
    pinkCardMeet: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
      marginBottom: 14,
      lineHeight: 22,
    },
    confirmOtpButton: {
      backgroundColor: c.bgElevated,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    confirmOtpText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    otpSentBlock: {
      backgroundColor: c.bgElevated,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    otpSentTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.brand,
      marginBottom: 6,
    },
    otpSentCode: {
      fontSize: 20,
      fontWeight: '800',
      color: c.text,
      letterSpacing: 3,
      marginBottom: 8,
    },
    otpSentHint: {
      fontSize: 12,
      color: c.textSecondary,
      lineHeight: 18,
    },
    otpDisclaimer: {
      fontSize: 12,
      fontStyle: 'italic',
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 18,
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    otpBox: {
      width: '22%',
      height: 52,
      backgroundColor: c.bgElevated,
      borderRadius: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: c.text,
      borderWidth: 1,
      borderColor: c.border,
    },
    otpError: {
      color: c.danger,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 6,
    },
    timerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginBottom: 8,
    },
    timerPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginRight: 8,
    },
    timerIcon: {fontSize: 15, marginRight: 8},
    timerValue: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    stopButton: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: c.brandDark,
    },
    stopButtonMuted: {backgroundColor: c.textHint},
    stopButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'lowercase',
    },
    demoConfirmRow: {
      backgroundColor: c.chip,
      borderRadius: 10,
      padding: 10,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    demoConfirmText: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
    demoSwitchButton: {
      marginTop: 10,
      paddingVertical: 8,
    },
    demoSwitchText: {
      fontSize: 12,
      color: c.brand,
      fontWeight: '700',
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    statusHint: {
      fontSize: 12,
      color: c.textHint,
      marginBottom: 10,
      marginLeft: 4,
    },
    chatArea: {flex: 1},
    chatContent: {
      flexGrow: 1,
      paddingBottom: 10,
    },
    waitingBanner: {
      textAlign: 'center',
      color: c.textHint,
      fontSize: 12,
      marginBottom: 12,
      lineHeight: 18,
      paddingHorizontal: 8,
    },
  });
