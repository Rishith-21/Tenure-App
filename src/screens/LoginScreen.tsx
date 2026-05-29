import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {useAppDialog} from '../context/DialogContext';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80';

const LoginScreen = ({navigation, route}: any) => {
  const {colors} = useTheme();
  const {showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState((route.params?.phone as string) ?? '');
  const [error, setError] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);

  useEffect(() => {
    const fromRoute = route.params?.phone as string | undefined;
    if (fromRoute != null) setPhone(fromRoute);
  }, [route.params?.phone]);

  const formatDisplay = (digits: string) => {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  const handleSendOtp = () => {
    if (phone.length !== 10) {
      setError('Enter a 10-digit mobile number');
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
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: colors.bg}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>Tenure</Text>
          <Pressable
            hitSlop={12}
            onPress={() =>
              showAlert({
                title: 'Need help?',
                message:
                  'Enter your WhatsApp number to receive a one-time OTP. Activity mates only — not dating or matrimony.',
              })
            }
            style={styles.helpBtn}>
            <Text style={styles.helpIcon}>?</Text>
          </Pressable>
        </View>

        <View style={styles.heroFrame}>
          <View style={styles.phoneShell}>
            <View style={styles.phoneNotch} />
            <Image source={{uri: HERO_IMAGE}} style={styles.heroImage} />
          </View>
        </View>

        <Text style={styles.welcome}>Welcome back.</Text>
        <Text style={styles.sub}>
          Sign in to find activity mates for outings, errands, and time together.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Your Phone Number</Text>

          <View style={styles.phoneRow}>
            <Pressable style={styles.countryBox}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryText}>India</Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>

            <TextInput
              placeholder="98765 43210"
              placeholderTextColor={colors.textHint}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              onChangeText={text => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setPhone(cleaned);
                setError('');
              }}
              style={[
                styles.phoneInput,
                phoneFocused && styles.phoneInputFocused,
                error ? styles.phoneInputError : null,
              ]}
            />
          </View>

          {phone.length > 0 ? (
            <Text style={styles.preview}>+91 {formatDisplay(phone)}</Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({pressed}) => [
              styles.cta,
              loading && styles.ctaDisabled,
              pressed && !loading && {opacity: 0.92},
            ]}
            onPress={handleSendOtp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.ctaInner}>
                <Text style={styles.ctaText}>Send OTP</Text>
                <Text style={styles.ctaArrow}>→</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms</Text> &{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    flex: {flex: 1},
    scroll: {
      paddingHorizontal: 24,
      flexGrow: 1,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    brand: {
      fontSize: 22,
      fontWeight: '800',
      color: c.brandDark,
    },
    helpBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.brandDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    helpIcon: {
      fontSize: 16,
      fontWeight: '700',
      color: c.brandDark,
    },
    heroFrame: {
      backgroundColor: c.brandDark,
      borderRadius: 28,
      padding: 20,
      alignItems: 'center',
      marginBottom: 28,
      minHeight: 200,
      justifyContent: 'center',
    },
    phoneShell: {
      width: 148,
      height: 260,
      borderRadius: 28,
      backgroundColor: '#0A0A0A',
      borderWidth: 3,
      borderColor: '#2A2A2A',
      overflow: 'hidden',
      alignItems: 'center',
    },
    phoneNotch: {
      width: 56,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#333',
      marginTop: 10,
      marginBottom: 6,
    },
    heroImage: {
      width: '100%',
      flex: 1,
      resizeMode: 'cover',
    },
    welcome: {
      fontSize: 28,
      fontWeight: '800',
      color: c.brandDark,
      textAlign: 'center',
      marginBottom: 10,
    },
    sub: {
      fontSize: 15,
      lineHeight: 22,
      color: c.textMuted,
      textAlign: 'center',
      marginBottom: 28,
      paddingHorizontal: 8,
    },
    formCard: {
      backgroundColor: c.bg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: c.border,
      padding: 22,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 12,
    },
    phoneRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    countryBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 14,
      gap: 6,
      backgroundColor: c.bg,
    },
    flag: {fontSize: 16},
    countryText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    chevron: {
      fontSize: 10,
      color: c.textHint,
    },
    phoneInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontWeight: '500',
      color: c.text,
      backgroundColor: c.bg,
    },
    phoneInputFocused: {borderColor: c.brand},
    phoneInputError: {borderColor: c.danger},
    preview: {
      fontSize: 12,
      color: c.textHint,
      marginBottom: 4,
    },
    error: {
      color: c.danger,
      fontSize: 13,
      marginBottom: 8,
    },
    cta: {
      backgroundColor: c.primary,
      borderRadius: 999,
      paddingVertical: 18,
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 16,
    },
    ctaDisabled: {opacity: 0.7},
    ctaInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    ctaText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '800',
    },
    ctaArrow: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
    legal: {
      fontSize: 12,
      lineHeight: 18,
      color: c.textHint,
      textAlign: 'center',
    },
    legalLink: {
      color: c.textSecondary,
      fontWeight: '700',
    },
  });
