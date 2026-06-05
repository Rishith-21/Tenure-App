import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {radius, spacing, shadows} from '../theme/tokens';
import {useAppDialog} from '../context/DialogContext';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppInput from '../components/ui/AppInput';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80';

const LoginScreen = ({navigation, route}: any) => {
  const {colors, tokens} = useTheme();
  const {showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState((route.params?.phone as string) ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    const fromRoute = route.params?.phone as string | undefined;
    if (fromRoute != null) setPhone(fromRoute);
  }, [route.params?.phone]);

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
          {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32},
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

        <AppCard style={styles.formCard}>
          <Text style={styles.fieldLabel}>Your Phone Number</Text>

          <View style={styles.phoneRow}>
            <View style={styles.countryBox}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryText}>+91</Text>
            </View>

            <AppInput
              placeholder="98765 43210"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={text => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setPhone(cleaned);
                setError('');
              }}
              error={error}
              containerStyle={styles.phoneInputContainer}
            />
          </View>

          <AppButton
            label="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            style={styles.cta}
            pill
          />

          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms</Text> &{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </AppCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    flex: {flex: 1},
    scroll: {
      paddingHorizontal: spacing.screenH,
      flexGrow: 1,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    brand: {
      ...tokens.typography.h2,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -1.2,
    },
    helpBtn: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgElevated,
      ...tokens.shadows.soft(c.shadow),
    },
    helpIcon: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    heroFrame: {
      backgroundColor: c.brandDark,
      borderRadius: tokens.radius.xl,
      padding: spacing.xxxl,
      alignItems: 'center',
      marginBottom: spacing.xxxl,
      minHeight: 240,
      justifyContent: 'center',
      ...tokens.shadows.card(c.shadow),
    },
    phoneShell: {
      width: 148,
      height: 260,
      borderRadius: tokens.radius.lg,
      backgroundColor: '#000',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.12)',
      overflow: 'hidden',
      alignItems: 'center',
    },
    phoneNotch: {
      width: 52,
      height: 5,
      borderRadius: tokens.radius.pill,
      backgroundColor: '#333',
      marginTop: 10,
      marginBottom: 8,
    },
    heroImage: {
      width: '100%',
      flex: 1,
      resizeMode: 'cover',
    },
    welcome: {
      ...tokens.typography.display,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    sub: {
      ...tokens.typography.body,
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxxl,
      paddingHorizontal: spacing.lg,
    },
    formCard: {
      padding: spacing.xxl,
      borderRadius: tokens.radius.lg,
      marginBottom: spacing.xxxl,
    },
    fieldLabel: {
      ...tokens.typography.overline,
      color: c.textMuted,
      marginBottom: spacing.md,
    },
    phoneRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: 4,
    },
    countryBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: tokens.radius.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: c.bgElevated,
      height: 56,
      gap: spacing.sm,
    },
    flag: {fontSize: 18},
    countryText: {
      ...tokens.typography.bodyMedium,
      fontWeight: '700',
      color: c.text,
    },
    phoneInputContainer: {
      flex: 1,
    },
    cta: {
      marginTop: spacing.xl,
      marginBottom: spacing.xl,
    },
    legal: {
      ...tokens.typography.caption,
      color: c.textMuted,
      textAlign: 'center',
    },
    legalLink: {
      color: c.primary,
      fontWeight: '700',
    },
  });
