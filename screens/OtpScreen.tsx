import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
} from 'react-native';
import {setLoggedIn} from '../utils/authStorage';
import {isAccountDeactivated, setAccountDeactivated} from '../utils/accountStatusStorage';
import {appDialog} from '../context/dialogRef';
import {resetToOnboardingProfile} from '../navigation/navigationActions';
import EditPhoneSheet from '../components/auth/EditPhoneSheet';
import BackButton from '../components/navigation/BackButton';
import {useTheme} from '../context/ThemeContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {goBackSafe} from '../navigation/navigationActions';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';

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
  const insets = useSafeAreaInsets();
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
    const interval = setInterval(() => setTimer((prev: number) => prev - 1), 1000);
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

  const finishLogin = async () => {
    await setLoggedIn(phoneNumber || '9999999999');
    resetToOnboardingProfile(navigation);
  };

  const handleVerifyOtp = () => {
    if (otp.join('').length !== 4) return;
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      const deactivated = await isAccountDeactivated();
      if (deactivated) {
        appDialog.showConfirm({
          title: 'Reactivate your account?',
          message:
            'This account is deactivated. Sign in again to show your profile and receive requests.',
          confirmText: 'Reactivate',
          cancelText: 'Cancel',
          onConfirm: async () => {
            await setAccountDeactivated(false);
            await finishLogin();
          },
        });
        return;
      }
      await finishLogin();
    }, 1200);
  };

  const otpComplete = otp.every((d: string) => d.length === 1);

  return (
    <>
      <View style={[styles.flex, {backgroundColor: colors.bg}]}>
        <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
          <BackButton onPress={() => goBackSafe(navigation)} />
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.sub}>Code sent on WhatsApp</Text>

          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setEditSheetOpen(true);
            }}>
            <AppCard style={styles.phoneCard}>
              <View>
                <Text style={styles.phoneLabel}>+91 {formatPhoneDisplay(phoneNumber)}</Text>
                <Text style={styles.change}>Change number</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </AppCard>
          </Pressable>

          {phoneUpdatedHint ? (
            <Text style={styles.hint}>New code sent to your number</Text>
          ) : null}

          <View style={styles.otpRow}>
            {otp.map((digit: string, index: number) => (
              <TextInput
                key={index}
                ref={(ref: TextInput | null) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(t: string) => handleOtpChange(t, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpFocused,
                  digit.length > 0 && {borderColor: colors.primary},
                ]}
              />
            ))}
          </View>

          <AppButton
            label={timer > 0 ? `Continue (${formatTimer(timer)})` : 'Continue'}
            onPress={handleVerifyOtp}
            loading={loading}
            disabled={!otpComplete}
            pill
            style={styles.cta}
          />

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
      </View>

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

const createStyles = (c: any) =>
  StyleSheet.create({
    flex: {flex: 1},
    topBar: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
      paddingBottom: 64,
    },
    title: {
      fontSize: 32,
      fontWeight: '900',
      color: c.text,
      marginBottom: 8,
      letterSpacing: -1,
    },
    sub: {
      fontSize: 16,
      color: c.textSecondary,
      marginBottom: 32,
      fontWeight: '500',
    },
    phoneCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 32,
      borderRadius: 24,
    },
    phoneLabel: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
      marginBottom: 2,
    },
    change: {
      fontSize: 14,
      fontWeight: '700',
      color: c.primary,
    },
    chevron: {
      fontSize: 24,
      color: c.textMuted,
      fontWeight: '600',
    },
    hint: {
      fontSize: 13,
      color: c.success,
      marginTop: -24,
      marginBottom: 24,
      textAlign: 'center',
      fontWeight: '600',
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 40,
    },
    otpBox: {
      width: 70,
      height: 70,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
      textAlign: 'center',
      fontSize: 28,
      fontWeight: '900',
      color: c.text,
    },
    otpFocused: {
      borderColor: c.primary,
      backgroundColor: c.bg,
      shadowColor: c.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    cta: {
      marginBottom: 24,
    },
    resendWrap: {alignItems: 'center'},
    resendDisabled: {color: c.textMuted, fontSize: 14, fontWeight: '600'},
    resend: {color: c.primary, fontSize: 16, fontWeight: '800'},
  });

export default OtpScreen;
