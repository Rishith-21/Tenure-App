import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import DraggableBottomDrawer, {
  DraggableBottomDrawerRef,
} from '../ui/DraggableBottomDrawer';
import {Dropdown} from 'react-native-element-dropdown';
import {MATE_CATEGORIES} from '../../constants/mateCategories';
import DateTimePickerField from '../ui/DateTimePickerField';
import NativeDateTimePicker from '../ui/NativeDateTimePicker';
import LocationPickerSheet from './LocationPickerSheet';
import {useTheme} from '../../context/ThemeContext';
import {
  calcMeetDurationMinutes,
  dateToMateString,
  defaultMateRequestDatePair,
  formatDurationHuman,
  mergeDatePart,
  mergeTimePart,
  startOfDay,
} from '../../utils/meetTime';

export type MateRequestForm = {
  meetLocation: string;
  locationSource: 'current' | 'chosen';
  fromDateTime: string;
  toDateTime: string;
  category: string;
};

type Props = {
  visible: boolean;
  defaultCategoryId?: string;
  profileLocation?: string;
  onClose: () => void;
  onSend: (form: MateRequestForm) => void;
};

const CATEGORY_OPTIONS = MATE_CATEGORIES.map(c => ({
  label: c.label,
  value: c.id,
}));

type PickerField = 'fromDate' | 'fromTime' | 'toDate' | 'toTime';
type LocationSource = 'current' | 'chosen';

/** Content area height (drawer adds safe-area padding). Fits form + location line. */
const SHEET_HEIGHT = 620;

type LocationOptionProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

const LocationOption = ({
  title,
  subtitle,
  selected,
  onPress,
  styles,
}: LocationOptionProps) => (
  <Pressable
    style={({pressed}) => [
      styles.locOption,
      selected && styles.locOptionSelected,
      pressed && styles.locOptionPressed,
    ]}
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{selected}}>
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
    <View style={styles.locOptionBody}>
      <Text
        style={[styles.locOptionTitle, selected && styles.locOptionTitleSelected]}>
        {title}
      </Text>
      <Text style={styles.locOptionSub} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  </Pressable>
);

const MateRequestModal = ({
  visible,
  defaultCategoryId,
  profileLocation = '',
  onClose,
  onSend,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const drawerRef = useRef<DraggableBottomDrawerRef>(null);

  const [locationSource, setLocationSource] = useState<LocationSource | null>(
    null,
  );
  const [meetLocation, setMeetLocation] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(
    () => new Date(Date.now() + 2 * 60 * 60 * 1000),
  );
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [pickerField, setPickerField] = useState<PickerField | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const {from, to} = defaultMateRequestDatePair();
    setLocationSource(null);
    setMeetLocation('');
    setFromDate(from);
    setToDate(to);
    setCategory(defaultCategoryId ?? null);
    setPickerField(null);
  }, [visible, defaultCategoryId]);

  const todayStart = useMemo(() => startOfDay(new Date()), [visible]);
  const toMinDate = useMemo(() => startOfDay(fromDate), [fromDate]);

  const fromDateTime = dateToMateString(fromDate);
  const toDateTime = dateToMateString(toDate);
  const durationMin = calcMeetDurationMinutes(fromDateTime, toDateTime);
  const durationOk = durationMin !== null && durationMin > 0;

  const handleFromDateChange = (picked: Date) => {
    const next = mergeDatePart(fromDate, picked);
    setFromDate(next);
    if (next.getTime() >= toDate.getTime()) {
      setToDate(new Date(next.getTime() + 60 * 60 * 1000));
    }
  };

  const handleFromTimeChange = (picked: Date) => {
    const next = mergeTimePart(fromDate, picked);
    setFromDate(next);
    if (next.getTime() >= toDate.getTime()) {
      setToDate(new Date(next.getTime() + 60 * 60 * 1000));
    }
  };

  const handleToDateChange = (picked: Date) => {
    const next = mergeDatePart(toDate, picked);
    setToDate(next);
    if (next.getTime() <= fromDate.getTime()) {
      setToDate(new Date(fromDate.getTime() + 60 * 60 * 1000));
    }
  };

  const handleToTimeChange = (picked: Date) => {
    const next = mergeTimePart(toDate, picked);
    setToDate(next);
    if (next.getTime() <= fromDate.getTime()) {
      setToDate(new Date(fromDate.getTime() + 60 * 60 * 1000));
    }
  };

  const handleSend = () => {
    if (!canSend) {
      return;
    }
    drawerRef.current?.dismiss(() =>
      onSend({
        meetLocation,
        locationSource: locationSource!,
        fromDateTime,
        toDateTime,
        category: category!,
      }),
    );
  };

  const canSend =
    locationSource !== null &&
    meetLocation.trim().length > 0 &&
    category !== null &&
    toDate.getTime() > fromDate.getTime();

  const pickerMode =
    pickerField === 'fromTime' || pickerField === 'toTime' ? 'time' : 'date';
  const pickerValue =
    pickerField === 'toDate' || pickerField === 'toTime' ? toDate : fromDate;
  const pickerMinDate =
    pickerField === 'fromDate'
      ? todayStart
      : pickerField === 'toDate'
        ? toMinDate
        : undefined;

  const handlePickerConfirm = (picked: Date) => {
    switch (pickerField) {
      case 'fromDate':
        handleFromDateChange(picked);
        break;
      case 'fromTime':
        handleFromTimeChange(picked);
        break;
      case 'toDate':
        handleToDateChange(picked);
        break;
      case 'toTime':
        handleToTimeChange(picked);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <DraggableBottomDrawer
        ref={drawerRef}
        visible={visible}
        onClose={onClose}
        compactContent
        fixedHeight={SHEET_HEIGHT}
        header={
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.sheetTitle}>Mate request</Text>
              <Text style={styles.sheetSubtitle}>
                Where & when to meet
              </Text>
            </View>
            <Pressable
              style={({pressed}) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
              onPress={() => drawerRef.current?.dismiss()}
              hitSlop={10}
              accessibilityLabel="Close">
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>
        }
        footer={
          <View style={styles.footerBlock}>
            <Text style={styles.footerNote}>
              Chat opens after they accept your request
            </Text>
            <Pressable
              style={({pressed}) => [
                styles.sendBtn,
                !canSend && styles.sendBtnDisabled,
                pressed && canSend && styles.sendBtnPressed,
              ]}
              onPress={handleSend}
              disabled={!canSend}>
              <Text style={styles.sendText}>Send request</Text>
            </Pressable>
          </View>
        }>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={styles.form}>
          <View style={styles.formCard}>
            <Text style={styles.blockLabel}>Meet location</Text>
            <View style={styles.locRow}>
              <LocationOption
                title="Current"
                subtitle="GPS"
                selected={locationSource === 'current'}
                onPress={() => {
                  setLocationSource('current');
                  setMeetLocation('Current location');
                }}
                styles={styles}
              />
              <LocationOption
                title="Choose"
                subtitle="Address"
                selected={locationSource === 'chosen'}
                onPress={() => setLocationPickerOpen(true)}
                styles={styles}
              />
            </View>
            {meetLocation ? (
              <Text style={styles.locChosen} numberOfLines={2}>
                {meetLocation}
              </Text>
            ) : null}
          </View>

          <View style={styles.formCard}>
            <View style={styles.blockLabelRow}>
              <Text style={styles.blockLabel}>Schedule</Text>
              {durationOk ? (
                <Text style={styles.durationText}>
                  {formatDurationHuman(durationMin!)}
                </Text>
              ) : null}
            </View>

            <Text style={styles.rowHint}>From</Text>
            <View style={styles.dateRow}>
              <DateTimePickerField
                compact
                mode="date"
                value={fromDate}
                onPress={() => setPickerField('fromDate')}
              />
              <DateTimePickerField
                compact
                mode="time"
                value={fromDate}
                onPress={() => setPickerField('fromTime')}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.rowHint}>To</Text>
            <View style={styles.dateRow}>
              <DateTimePickerField
                compact
                mode="date"
                value={toDate}
                onPress={() => setPickerField('toDate')}
              />
              <DateTimePickerField
                compact
                mode="time"
                value={toDate}
                onPress={() => setPickerField('toTime')}
              />
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.blockLabel}>Activity</Text>
            <Dropdown
              style={styles.categoryDropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              containerStyle={styles.dropdownContainer}
              activeColor={colors.chip}
              data={CATEGORY_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder="Select category"
              value={category}
              onChange={item => setCategory(item.value)}
            />
          </View>
        </ScrollView>
      </DraggableBottomDrawer>

      <LocationPickerSheet
        visible={locationPickerOpen}
        initialValue={profileLocation}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={address => {
          setLocationSource('chosen');
          setMeetLocation(address);
          setLocationPickerOpen(false);
        }}
      />

      <NativeDateTimePicker
        visible={pickerField !== null}
        mode={pickerMode}
        value={pickerValue}
        minimumDate={pickerMinDate}
        onClose={() => setPickerField(null)}
        onConfirm={handlePickerConfirm}
      />
    </>
  );
};

export default MateRequestModal;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    headerText: {
      flex: 1,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: c.brandDark,
    },
    sheetSubtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 2,
    },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    closeBtnPressed: {
      opacity: 0.85,
    },
    closeIcon: {
      fontSize: 15,
      color: c.textSecondary,
      fontWeight: '600',
    },
    form: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 10,
    },
    formCard: {
      backgroundColor: c.bgElevated,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 12,
      gap: 10,
    },
    blockLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.45,
    },
    blockLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    durationText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.brand,
    },
    locRow: {
      flexDirection: 'row',
      gap: 8,
    },
    locOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.bg,
    },
    locOptionSelected: {
      borderColor: c.brand,
      backgroundColor: c.chip,
    },
    locOptionPressed: {
      opacity: 0.9,
    },
    radio: {
      width: 15,
      height: 15,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: c.borderPill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: c.brand,
    },
    radioDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.brand,
    },
    locOptionBody: {
      flex: 1,
      minWidth: 0,
    },
    locOptionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    locOptionTitleSelected: {
      color: c.brandDark,
    },
    locOptionSub: {
      fontSize: 10,
      color: c.textMuted,
      marginTop: 1,
    },
    locChosen: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
      lineHeight: 17,
    },
    rowHint: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.35,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryDropdown: {
      height: 42,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingHorizontal: 12,
      backgroundColor: c.bg,
    },
    dropdownContainer: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    dropdownPlaceholder: {
      fontSize: 14,
      color: c.textHint,
    },
    dropdownSelected: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    footerBlock: {
      gap: 8,
    },
    footerNote: {
      fontSize: 11,
      fontWeight: '500',
      color: c.textHint,
      textAlign: 'center',
    },
    sendBtn: {
      backgroundColor: c.brand,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    sendBtnPressed: {
      backgroundColor: c.primaryPressed,
    },
    sendBtnDisabled: {
      opacity: 0.42,
    },
    sendText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });
