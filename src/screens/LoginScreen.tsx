import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {UI, uiLayout} from '../theme/ui';

const LOGIN_LOGO = require('../../DummyLogo.png');

const LoginScreen = ({navigation, route}: any) => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState((route.params?.phone as string) ?? '');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const fromRoute = route.params?.phone as string | undefined;
    if (fromRoute != null) {
      setPhone(fromRoute);
    }
  }, [route.params?.phone]);

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
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.logoSection}>
            <Text style={styles.wordmark}>Tenure</Text>
            <Image
              source={LOGIN_LOGO}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="Tenure logo"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Enter Your Whatsapp no</Text>

            <View
              style={[
                styles.phoneContainer,
                focused && styles.phoneContainerFocused,
                error ? styles.phoneContainerError : null,
              ]}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>+91</Text>
              </View>
              <TextInput
                placeholder="10-digit mobile number"
                placeholderTextColor={UI.textHint}
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChangeText={text => {
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({pressed}) => [
                styles.button,
                loading && styles.buttonDisabled,
                pressed && !loading && styles.buttonPressed,
              ]}
              onPress={handleSendOtp}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send otp</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: UI.bgCream,
  },
  container: {
    flex: 1,
    backgroundColor: UI.bgCream,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '800',
    color: UI.brand,
    letterSpacing: 0.4,
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 140,
  },
  formSection: {
    width: '100%',
    paddingBottom: 8,
  },
  fieldLabel: {
    ...uiLayout.fieldLabel,
    fontSize: 13,
    color: UI.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: UI.text,
    marginBottom: 8,
    overflow: 'hidden',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  phoneContainerFocused: {
    borderColor: UI.brand,
    borderWidth: 2,
  },
  phoneContainerError: {
    borderColor: UI.danger,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: UI.borderInput,
  },
  countryText: {
    fontSize: 16,
    fontWeight: '700',
    color: UI.brand,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: UI.text,
  },
  errorText: {
    color: UI.danger,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 6,
    marginBottom: 14,
  },
  button: {
    backgroundColor: UI.brand,
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{scale: 0.99}],
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
