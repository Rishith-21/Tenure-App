import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import DraggableBottomDrawer, {
  DraggableBottomDrawerRef,
} from '../ui/DraggableBottomDrawer';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  initialPhone: string;
  onClose: () => void;
  onConfirm: (phone: string) => void;
};

/** Content + header + footer (excludes safe-area padding). */
const SHEET_BODY_HEIGHT = 360;
const DRAWER_OPEN_MS = 360;

const isValidIndianMobile = (digits: string) =>
  digits.length === 10 && ['6', '7', '8', '9'].includes(digits[0]);

const EditPhoneSheet = ({
  visible,
  initialPhone,
  onClose,
  onConfirm,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const drawerRef = useRef<DraggableBottomDrawerRef>(null);
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState(initialPhone);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      inputRef.current?.blur();
      return;
    }

    setDraft(initialPhone);
    setError('');
    setSubmitting(false);

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, DRAWER_OPEN_MS + 40);

    return () => clearTimeout(focusTimer);
  }, [visible, initialPhone]);

  const dismiss = () => {
    Keyboard.dismiss();
    drawerRef.current?.dismiss();
  };

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
      dismiss();
      return;
    }
    setError('');
    setSubmitting(true);
    Keyboard.dismiss();
    setTimeout(() => {
      setSubmitting(false);
      drawerRef.current?.dismiss(() => onConfirm(draft));
    }, 900);
  };

  return (
    <DraggableBottomDrawer
      ref={drawerRef}
      visible={visible}
      onClose={onClose}
      compactContent
      avoidKeyboard
      fixedHeight={SHEET_BODY_HEIGHT}
      header={
        <View style={styles.header}>
          <Text style={styles.title}>Change WhatsApp number</Text>
          <Text style={styles.subtitle}>
            We&apos;ll send a fresh 4-digit code to your updated number.
          </Text>
        </View>
      }
      footer={
        <View style={styles.footer}>
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
            onPress={dismiss}
            disabled={submitting}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      }>
      <View style={styles.content}>
        <Text style={styles.fieldLabel}>WhatsApp number</Text>
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
            ref={inputRef}
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
            placeholderTextColor={colors.textHint}
            style={styles.input}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={handleSubmit}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </DraggableBottomDrawer>
  );
};

export default EditPhoneSheet;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      paddingBottom: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textMuted,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 4,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.45,
      marginLeft: 4,
      marginBottom: 10,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: c.borderInput,
      overflow: 'hidden',
      minHeight: 56,
    },
    phoneRowFocused: {
      borderColor: c.primary,
      borderWidth: 2,
    },
    phoneRowError: {
      borderColor: c.danger,
    },
    countryCode: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRightWidth: 1,
      borderRightColor: c.borderInput,
    },
    countryText: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    input: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      fontWeight: '500',
      color: c.text,
    },
    errorText: {
      color: c.danger,
      fontSize: 13,
      marginLeft: 6,
      marginTop: 8,
    },
    footer: {
      gap: 4,
    },
    primaryBtn: {
      backgroundColor: c.primary,
      borderRadius: 22,
      paddingVertical: 17,
      alignItems: 'center',
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
    },
    cancelBtnPressed: {
      opacity: 0.65,
    },
    cancelBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textMuted,
    },
  });
