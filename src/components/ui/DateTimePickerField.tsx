import React, {useState} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {dateToMateString, formatTime12h} from '../../utils/meetTime';
import {UI, uiLayout, uiStyles} from '../../theme/ui';

type Mode = 'date' | 'time' | 'datetime';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  mode?: Mode;
  label?: string;
  hint?: string;
  minimumDate?: Date;
};

const coerceDate = (value: Date): Date =>
  value instanceof Date && !Number.isNaN(value.getTime())
    ? value
    : new Date(value);

const androidPickerMode = (mode: Mode): 'date' | 'time' =>
  mode === 'time' ? 'time' : 'date';

const DateTimePickerField = ({
  value,
  onChange,
  mode = 'datetime',
  label,
  hint,
  minimumDate,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [iosDraft, setIosDraft] = useState(value);
  const dateValue = coerceDate(value);

  const display =
    mode === 'time' ? formatTime12h(dateValue) : dateToMateString(dateValue);

  const applyChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      return;
    }
    const next =
      selected ??
      (event.type === 'set'
        ? new Date(event.nativeEvent.timestamp)
        : undefined);
    if (next && !Number.isNaN(next.getTime())) {
      onChange(next);
    }
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      applyChange(event, selected);
      return;
    }
    if (selected) {
      setIosDraft(selected);
    }
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      const pickerMode = androidPickerMode(mode);
      DateTimePickerAndroid.open({
        value: dateValue,
        mode: pickerMode,
        is24Hour: false,
        ...(pickerMode === 'date' && minimumDate ? {minimumDate} : {}),
        onChange: onPickerChange,
      });
      return;
    }
    setIosDraft(dateValue);
    setOpen(true);
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={uiStyles.fieldLabel}>{label}</Text> : null}
      <Pressable
        style={({pressed}) => [
          uiStyles.inputField,
          styles.fieldInner,
          pressed && styles.fieldPressed,
        ]}
        onPress={openPicker}>
        <Text style={styles.value} numberOfLines={2}>
          {display}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide">
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <Pressable style={styles.iosSheet} onPress={() => {}}>
              <View style={uiStyles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>
                  {mode === 'time' ? 'Select time' : 'Select date & time'}
                </Text>
                <Pressable
                  onPress={() => {
                    onChange(iosDraft);
                    setOpen(false);
                  }}
                  hitSlop={12}>
                  <Text style={styles.done}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={iosDraft}
                mode={mode === 'datetime' ? 'datetime' : mode}
                display="spinner"
                minimumDate={minimumDate}
                onChange={onPickerChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
};

export default DateTimePickerField;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  fieldInner: {
    position: 'relative',
  },
  fieldPressed: {
    opacity: 0.92,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: UI.text,
    paddingRight: 20,
  },
  chevron: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
    fontSize: 22,
    color: '#999999',
  },
  hint: {
    fontSize: 11,
    color: UI.textHint,
    marginTop: 6,
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: UI.overlay,
  },
  iosSheet: {
    ...uiLayout.sheet,
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.text,
  },
  cancel: {
    fontSize: 16,
    color: UI.textMuted,
    fontWeight: '600',
  },
  done: {
    fontSize: 16,
    fontWeight: '800',
    color: UI.brand,
  },
});
