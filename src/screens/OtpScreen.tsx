import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {setLoggedIn} from '../utils/authStorage';
import {resetToOnboardingProfile} from '../navigation/navigationActions';
import EditPhoneSheet from '../components/auth/EditPhoneSheet';
import {useTheme} from '../context/ThemeContext';

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatPhoneDisplay = (digits: string) => {
  if (!digits) return '——— ——— ———';
  return digits.length > 5
    ? `${digits.slice(0, 5)} ${digits.slice(5)}`
    : digits;
};

const OtpScreen = ({navigation, route}: any) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const initialPhone = (route.params?.phone as string) ?? '';
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [phoneUpdatedHint, setPhoneUpdatedHint] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    setPhoneNumber(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const resetOtpEntry = () => {
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleOtpChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) return;
    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);
    if (text && index < 3) inputRefs.current[index + 1]?.focus();
    if (!text && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length !== 4) return;
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      await setLoggedIn(phoneNumber || '9999999999');
      resetToOnboardingProfile(navigation);
    }, 1200);
  };

  const otpComplete = otp.every(d => d.length === 1);

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.flex, {backgroundColor: colors.bg}]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.sub}>Code sent on WhatsApp</Text>

          <Pressable
            style={({pressed}) => [
              styles.phoneCard,
              pressed && {opacity: 0.92},
            ]}
            onPress={() => setEditSheetOpen(true)}>
            <Text style={styles.phoneLabel}>+91 {formatPhoneDisplay(phoneNumber)}</Text>
            <Text style={styles.change}>Change</Text>
          </Pressable>

          {phoneUpdatedHint ? (
            <Text style={styles.hint}>New code sent to your number</Text>
          ) : null}

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={t => handleOtpChange(t, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpFocused,
                  digit.length > 0 && {borderColor: colors.brand},
                ]}
              />
            ))}
          </View>

          <Pressable
            style={({pressed}) => [
              styles.cta,
              (!otpComplete || loading) && styles.ctaMuted,
              pressed && otpComplete && !loading && {opacity: 0.92},
            ]}
            onPress={handleVerifyOtp}
            disabled={loading || !otpComplete}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.ctaInner}>
                <Text style={styles.ctaText}>Continue</Text>
                {timer > 0 ? (
                  <Text style={styles.timer}>{formatTimer(timer)}</Text>
                ) : null}
              </View>
            )}
          </Pressable>

          <View style={styles.resendWrap}>
            {timer > 0 ? (
              <Text style={styles.resendDisabled}>Resend in {timer}s</Text>
            ) : (
              <Pressable
                onPress={() => {
                  setTimer(30);
                  resetOtpEntry();
                }}>
                <Text style={styles.resend}>Resend OTP</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <EditPhoneSheet
        visible={editSheetOpen}
        initialPhone={phoneNumber}
        onClose={() => setEditSheetOpen(false)}
        onConfirm={next => {
          setPhoneNumber(next);
          navigation.setParams({phone: next});
          setTimer(30);
          resetOtpEntry();
          setPhoneUpdatedHint(true);
          setTimeout(() => setPhoneUpdatedHint(false), 3000);
        }}
      />
    </>
  );
};

export default OtpScreen;

const createStyles = (c: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    flex: {flex: 1},
    container: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: 'center',
      paddingVertical: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: c.text,
      marginBottom: 6,
    },
    sub: {
      fontSize: 14,
      color: c.textMuted,
      marginBottom: 28,
    },
    phoneCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.bg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: c.border,
    },
    phoneLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    change: {
      fontSize: 13,
      fontWeight: '700',
      color: c.brand,
    },
    hint: {
      fontSize: 12,
      color: c.brand,
      marginTop: -20,
      marginBottom: 20,
      textAlign: 'center',
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 32,
    },
    otpBox: {
      flex: 1,
      maxWidth: 72,
      aspectRatio: 1,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '800',
      color: c.text,
    },
    otpFocused: {
      borderColor: c.brand,
      backgroundColor: c.bg,
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 17,
      paddingHorizontal: 20,
      minHeight: 56,
    },
    ctaMuted: {opacity: 0.45},
    ctaInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    ctaText: {
      flex: 1,
      textAlign: 'center',
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    timer: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 14,
      fontWeight: '600',
    },
    resendWrap: {marginTop: 24, alignItems: 'center'},
    resendDisabled: {color: c.textHint, fontSize: 14},
    resend: {color: c.brand, fontSize: 15, fontWeight: '700'},
  });
