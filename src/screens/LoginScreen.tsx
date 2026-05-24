import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const LoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {

    if (phone.length !== 10) {
        setError('Mobile number must be 10 digits');
        return;
    }

    if (!['6', '7', '8', '9'].includes(phone[0])) {
        setError('Enter a valid Indian mobile number');
        return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {

        setLoading(false);

        navigation.navigate('Otp', {phone});

    }, 1500);
  };

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <View style={styles.container}>

        {/* Top Section */}
        <View style={styles.topSection}>

          <Text style={styles.logo}>
            Tenure
          </Text>

          <Text style={styles.heading}>
            Welcome Back
          </Text>

          <Text style={styles.subHeading}>
            Login using your WhatsApp number
          </Text>

        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>

          {/* Phone Input */}
          <View style={styles.phoneContainer}>

            <View style={styles.countryCode}>
              <Text style={styles.countryText}>
                +91
              </Text>
            </View>

            <TextInput
              placeholder="Enter WhatsApp number"
              placeholderTextColor="#8A8A8A"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {

                const cleaned = text.replace(/[^0-9]/g, '');

                setPhone(cleaned);

                if (
                  cleaned.length > 0 &&
                  !['6', '7', '8', '9'].includes(cleaned[0])
                ) {
                  setError('Enter a valid Indian mobile number');
                } else {
                  setError('');
                }
              }}
              style={styles.input}
            />

          </View>

          {/* Error Text */}
          {error ? (
            <Text style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          {/* Send OTP Button */}
          <Pressable
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSendOtp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </Pressable>

        </View>

      </View>
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
    disabledButton: {
  opacity: 0.7,
},
  topSection: {
    marginBottom: 50,
  },

  logo: {
    fontSize: 38,
    fontWeight: '700',
    color: '#003B57',
    marginBottom: 30,
    letterSpacing: 1,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 10,
  },

  subHeading: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },

  inputSection: {
    width: '100%',
  },

  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    marginBottom: 10,
    overflow: 'hidden',
  },

  countryCode: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: '#D9E2EC',
  },

  countryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003B57',
  },

  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111111',
  },

  errorText: {
    color: '#E53935',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 6,
    marginBottom: 16,
  },

  button: {
    backgroundColor: '#003B57',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  successText: {
    color: '#2E7D32',
    fontSize: 14,
    marginTop: 18,
    marginBottom: 18,
    marginLeft: 4,
  },

  otpContainer: {
    marginTop: 10,
  },

  otpInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E2EC',
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 16,
    color: '#111111',
    marginBottom: 18,
  },

  verifyButton: {
    backgroundColor: '#003B57',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },

  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

});