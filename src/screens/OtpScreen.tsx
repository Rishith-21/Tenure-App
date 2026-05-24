import React, {useEffect, useRef, useState} from 'react';
import {setLoggedIn} from '../utils/authStorage';
import {resetToOnboardingProfile} from '../navigation/navigationActions';
import EditPhoneSheet from '../components/auth/EditPhoneSheet';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {UI, uiLayout} from '../theme/ui';

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatPhoneDisplay = (digits: string) => {
  if (!digits) {
    return '——— ——— ———';
  }
  const spaced =
    digits.length > 5
      ? `${digits.slice(0, 5)} ${digits.slice(5)}`
      : digits;
  return spaced;
};

const OtpScreen = ({navigation, route}: any) => {
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
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const resetOtpEntry = () => {
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleOtpChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) {
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const finalOtp = otp.join('');
    if (finalOtp.length !== 4) {
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      await setLoggedIn(phoneNumber || '9999999999');
      resetToOnboardingProfile(navigation);
    }, 1500);
  };

  const handleResendOtp = () => {
    setTimer(30);
    resetOtpEntry();
  };

  const handlePhoneUpdated = (nextPhone: string) => {
    setPhoneNumber(nextPhone);
    navigation.setParams({phone: nextPhone});
    setTimer(30);
    resetOtpEntry();
    setPhoneUpdatedHint(true);
    setTimeout(() => setPhoneUpdatedHint(false), 3200);
  };

  const otpComplete = otp.every(d => d.length === 1);

  return (
    <>
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Pressable
            style={({pressed}) => [
              styles.phoneCard,
              pressed && styles.phoneCardPressed,
            ]}
            onPress={() => setEditSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Change phone number">
            <Text style={styles.phoneCardLabel}>OTP sent to WhatsApp</Text>
            <View style={styles.phoneCardRow}>
              <Text style={styles.phonePrefix}>+91</Text>
              <Text style={styles.numberText}>
                {formatPhoneDisplay(phoneNumber)}
              </Text>
              <View style={styles.changeChip}>
                <Text style={styles.changeChipText}>Change</Text>
              </View>
            </View>
          </Pressable>

          {phoneUpdatedHint ? (
            <View style={styles.updatedBanner}>
              <Text style={styles.updatedBannerText}>
                New code sent to +91 {formatPhoneDisplay(phoneNumber)}
              </Text>
            </View>
          ) : null}

          <Text style={styles.otpLabel}>Enter OTP</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={text => handleOtpChange(text, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpBoxFocused,
                  digit.length > 0 && styles.otpBoxFilled,
                ]}
              />
            ))}
          </View>

          <Pressable
            style={({pressed}) => [
              styles.button,
              loading && styles.buttonDisabled,
              pressed && !loading && styles.buttonPressed,
              !otpComplete && !loading && styles.buttonMuted,
            ]}
            onPress={handleVerifyOtp}
            disabled={loading || !otpComplete}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Confirm</Text>
                {timer > 0 ? (
                  <Text style={styles.buttonTimer}>{formatTimer(timer)}</Text>
                ) : null}
              </View>
            )}
          </Pressable>

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.resendDisabled}>
                Resend OTP in {timer}s
              </Text>
            ) : (
              <Pressable onPress={handleResendOtp} hitSlop={12}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <EditPhoneSheet
        visible={editSheetOpen}
        initialPhone={phoneNumber}
        onClose={() => setEditSheetOpen(false)}
        onConfirm={handlePhoneUpdated}
      />
    </>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: UI.bgCream,
  },
  container: {
    flex: 1,
    backgroundColor: UI.bgCream,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  phoneCard: {
    alignSelf: 'stretch',
    backgroundColor: UI.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.border,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phoneCardPressed: {
    opacity: 0.94,
    borderColor: UI.brandMuted,
  },
  phoneCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: UI.textMuted,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  phoneCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: UI.brand,
    marginRight: 8,
  },
  numberText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: UI.text,
    letterSpacing: 0.5,
  },
  changeChip: {
    backgroundColor: '#F0F7FA',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#C5DCE6',
  },
  changeChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: UI.brand,
  },
  updatedBanner: {
    ...uiLayout.infoPill,
    marginTop: -8,
    marginBottom: 18,
  },
  updatedBannerText: {
    ...uiLayout.infoPillText,
    textAlign: 'center',
    fontSize: 12,
  },
  otpLabel: {
    ...uiLayout.fieldLabel,
    fontSize: 14,
    color: UI.textMuted,
    marginBottom: 14,
    marginLeft: 2,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },
  otpBox: {
    flex: 1,
    maxWidth: 76,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: UI.card,
    borderWidth: 1.5,
    borderColor: UI.brand,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: UI.text,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  otpBoxFocused: {
    borderWidth: 2,
    borderColor: UI.brandMuted,
    backgroundColor: '#FAFCFD',
  },
  otpBoxFilled: {
    backgroundColor: '#F0F7FA',
  },
  button: {
    backgroundColor: UI.brand,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonMuted: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  buttonTimer: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'right',
  },
  resendContainer: {
    marginTop: 22,
    alignItems: 'center',
  },
  resendDisabled: {
    color: UI.textHint,
    fontSize: 14,
  },
  resendText: {
    color: UI.brand,
    fontSize: 15,
    fontWeight: '800',
  },
});
