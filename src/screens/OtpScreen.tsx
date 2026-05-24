import React, { useEffect, useRef, useState } from 'react';
import { setLoggedIn } from '../utils/authStorage';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const OtpScreen = ({ navigation, route }: any) => {
  const phone = (route.params?.phone as string) ?? '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown Timer
  useEffect(() => {

    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [timer]);

  const handleOtpChange = (
    text: string,
    index: number,
  ) => {

    if (!/^[0-9]?$/.test(text)) {
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = text;

    setOtp(updatedOtp);

    // Move next
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move back
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
      await setLoggedIn(phone || '9999999999');
      navigation.replace('ProfileCreation');
    }, 1500);
  };

  const handleResendOtp = () => {

    setTimer(30);

    setOtp(['', '', '', '']);

    inputRefs.current[0]?.focus();

    console.log('OTP Resent');
  };

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <View style={styles.container}>

        {/* Phone Number */}
        <View style={styles.numberRow}>

          <Text style={styles.numberText}>
            +91 6263246705
          </Text>

          <Text style={styles.editIcon}>
            ✎
          </Text>

        </View>

        {/* OTP Label */}
        <Text style={styles.otpLabel}>
          Enter OTP
        </Text>

        {/* OTP BOXES */}
        <View style={styles.otpContainer}>

          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) =>
                handleOtpChange(text, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              style={styles.otpBox}
            />
          ))}

        </View>

        {/* Confirm Button */}
        <Pressable
          style={styles.button}
          onPress={handleVerifyOtp}
          disabled={loading}>

          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Confirm
            </Text>
          )}

        </Pressable>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>

          {timer > 0 ? (

            <Text style={styles.resendDisabled}>
              Resend OTP in {timer}s
            </Text>

          ) : (

            <Pressable onPress={handleResendOtp}>
              <Text style={styles.resendText}>
                Resend OTP
              </Text>
            </Pressable>

          )}

        </View>

      </View>
    </>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 50,
  },

  numberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003B57',
  },

  editIcon: {
    marginLeft: 10,
    fontSize: 16,
    color: '#777777',
  },

  otpLabel: {
    fontSize: 16,
    color: '#777777',
    marginBottom: 18,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  otpBox: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },

  button: {
    backgroundColor: '#003B57',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },

  resendDisabled: {
    color: '#999999',
    fontSize: 14,
  },

  resendText: {
    color: '#003B57',
    fontSize: 15,
    fontWeight: '700',
  },

});