import React, {useEffect, useMemo, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';
import {formatMateDateOnly, formatTime12h} from '../../utils/meetTime';

export type NativePickerMode = 'date' | 'time';

type Props = {
  visible: boolean;
  mode: NativePickerMode;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

const NativeDateTimePicker = ({
  visible,
  mode,
  value,
  minimumDate,
  maximumDate,
  title,
  subtitle,
  confirmLabel = 'Confirm',
  onClose,
  onConfirm,
}: Props) => {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const resolvedTitle =
    title ?? (mode === 'time' ? 'Select time' : 'Select date');
  const resolvedSubtitle =
    subtitle ??
    (mode === 'time'
      ? 'Scroll to set hours and minutes'
      : 'Scroll day, month, and year');

  const preview =
    mode === 'time' ? formatTime12h(draft) : formatMateDateOnly(draft);

  if (!visible) {
    return null;
  }

  const confirm = () => {
    onConfirm(draft);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[styles.scrim, {backgroundColor: colors.sheetScrim}]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close picker"
        />
        <View style={[styles.panel, {paddingBottom: Math.max(insets.bottom, 12)}]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{resolvedTitle}</Text>
            <Text style={styles.subtitle}>{resolvedSubtitle}</Text>
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Selected</Text>
            <Text style={styles.previewValue}>{preview}</Text>
          </View>

          <View style={styles.pickerCard}>
            <DatePicker
              date={draft}
              onDateChange={setDraft}
              mode={mode}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              theme={isDark ? 'dark' : 'light'}
              dividerColor={colors.primary}
              locale="en-GB"
              style={styles.picker}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              style={({pressed}) => [
                styles.confirmBtn,
                pressed && styles.pressed,
              ]}
              onPress={confirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.cancelBtn,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel">
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NativeDateTimePicker;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
    },
    panel: {
      backgroundColor: c.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: -8},
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 32,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.borderPill,
      marginTop: 10,
      marginBottom: 12,
    },
    header: {
      paddingBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.brandDark,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 2,
      lineHeight: 18,
    },
    previewCard: {
      backgroundColor: c.bgElevated,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    previewLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.45,
      marginBottom: 4,
    },
    previewValue: {
      fontSize: 22,
      fontWeight: '800',
      color: c.brandDark,
      letterSpacing: -0.3,
    },
    pickerCard: {
      backgroundColor: c.bgElevated,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      overflow: 'hidden',
      marginBottom: 12,
      alignItems: 'center',
    },
    picker: {
      alignSelf: 'center',
    },
    footer: {
      gap: 4,
    },
    confirmBtn: {
      backgroundColor: c.brand,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
    },
    confirmText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cancelBtn: {
      paddingVertical: 10,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textMuted,
    },
    pressed: {
      opacity: 0.9,
    },
  });
