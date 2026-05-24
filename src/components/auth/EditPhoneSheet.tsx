import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {UI, uiLayout, uiStyles} from '../../theme/ui';

type Props = {
  visible: boolean;
  initialPhone: string;
  onClose: () => void;
  onConfirm: (phone: string) => void;
};

const isValidIndianMobile = (digits: string) =>
  digits.length === 10 && ['6', '7', '8', '9'].includes(digits[0]);

const EditPhoneSheet = ({
  visible,
  initialPhone,
  onClose,
  onConfirm,
}: Props) => {
  const [draft, setDraft] = useState(initialPhone);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(initialPhone);
      setError('');
      setSubmitting(false);
    }
  }, [visible, initialPhone]);

  const handleSubmit = () => {
    if (!isValidIndianMobile(draft)) {
      if (draft.length !== 10) {
        setError('Mobile number must be 10 digits');
      } else {
        setError('Enter a valid Indian mobile number');
      }
      return;
    }
    if (draft === initialPhone) {
      onClose();
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onConfirm(draft);
      onClose();
    }, 900);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={uiStyles.sheetHandle} />

            <Text style={styles.title}>Change WhatsApp number</Text>
            <Text style={styles.subtitle}>
              We&apos;ll send a fresh 4-digit code to your updated number.
            </Text>

            <Text style={styles.fieldLabel}>Enter Your Whatsapp no</Text>
            <View
              style={[
                styles.phoneRow,
                focused && styles.phoneRowFocused,
                error ? styles.phoneRowError : null,
              ]}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>+91</Text>
              </View>
              <TextInput
                value={draft}
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
                  setDraft(cleaned);
                  if (
                    cleaned.length > 0 &&
                    !['6', '7', '8', '9'].includes(cleaned[0])
                  ) {
                    setError('Enter a valid Indian mobile number');
                  } else {
                    setError('');
                  }
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="10-digit mobile number"
                placeholderTextColor={UI.textHint}
                style={styles.input}
                autoFocus={visible}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={({pressed}) => [
                styles.primaryBtn,
                submitting && styles.primaryBtnDisabled,
                pressed && !submitting && styles.primaryBtnPressed,
              ]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Update & send OTP</Text>
              )}
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.cancelBtn,
                pressed && styles.cancelBtnPressed,
              ]}
              onPress={onClose}
              disabled={submitting}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditPhoneSheet;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: UI.overlay,
  },
  sheet: {
    ...uiLayout.sheet,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: UI.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: UI.textMuted,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  fieldLabel: {
    ...uiLayout.fieldLabel,
    marginLeft: 4,
    marginBottom: 10,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: UI.borderInput,
    overflow: 'hidden',
    minHeight: 56,
    marginBottom: 6,
  },
  phoneRowFocused: {
    borderColor: UI.brand,
    borderWidth: 2,
  },
  phoneRowError: {
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
    marginLeft: 6,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: UI.brand,
    borderRadius: 22,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnPressed: {
    opacity: 0.92,
  },
  primaryBtnDisabled: {
    opacity: 0.75,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnPressed: {
    opacity: 0.65,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.textMuted,
  },
});
