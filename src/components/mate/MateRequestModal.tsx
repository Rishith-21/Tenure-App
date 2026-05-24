import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dropdown} from 'react-native-element-dropdown';
import {MATE_CATEGORIES} from '../../constants/mateCategories';
import DateTimePickerField from '../ui/DateTimePickerField';
import LocationPickerSheet from './LocationPickerSheet';
import {
  calcMeetDurationMinutes,
  dateToMateString,
  defaultMateRequestDatePair,
  formatDurationHuman,
} from '../../utils/meetTime';
import {UI, uiStyles} from '../../theme/ui';

export type MateRequestForm = {
  meetLocation: string;
  locationSource: 'current' | 'chosen';
  fromDateTime: string;
  toDateTime: string;
  category: string;
  message: string;
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

const MateRequestModal = ({
  visible,
  defaultCategoryId,
  profileLocation = '',
  onClose,
  onSend,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [locationSource, setLocationSource] = useState<
    'current' | 'chosen' | null
  >(null);
  const [meetLocation, setMeetLocation] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(
    () => new Date(Date.now() + 2 * 60 * 60 * 1000),
  );
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');

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
    setMessage('');
  }, [visible, defaultCategoryId]);

  const useCurrentLocation = () => {
    setLocationSource('current');
    setMeetLocation('Current location');
  };

  const chooseOnMap = () => {
    setLocationPickerOpen(true);
  };

  const fromDateTime = dateToMateString(fromDate);
  const toDateTime = dateToMateString(toDate);
  const durationMin = calcMeetDurationMinutes(fromDateTime, toDateTime);

  const handleSend = () => {
    if (!locationSource || !meetLocation.trim()) {
      return;
    }
    if (!category) {
      return;
    }
    if (toDate.getTime() <= fromDate.getTime()) {
      return;
    }
    onSend({
      meetLocation,
      locationSource,
      fromDateTime,
      toDateTime,
      category,
      message: message.trim(),
    });
  };

  const canSend =
    locationSource !== null &&
    meetLocation.trim().length > 0 &&
    category !== null &&
    toDate.getTime() > fromDate.getTime();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Dismiss mate request"
          />
          <View
            style={[styles.sheet, {paddingBottom: insets.bottom + 16}]}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderSpacer} />
              <Pressable
                style={styles.closeBtn}
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Close mate request">
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              <Text style={styles.sectionLabel}>
                Select Meet Location <Text style={styles.required}>*</Text>
              </Text>

              <Pressable
                style={[
                  styles.outlinePill,
                  locationSource === 'current' && styles.outlinePillActive,
                ]}
                onPress={useCurrentLocation}>
                <Text
                  style={[
                    styles.outlinePillText,
                    locationSource === 'current' &&
                      styles.outlinePillTextActive,
                  ]}>
                  Use Current Location
                </Text>
              </Pressable>

              <Text style={styles.orText}>OR</Text>

              <Pressable
                style={[
                  styles.choosePill,
                  locationSource === 'chosen' && styles.choosePillActive,
                ]}
                onPress={chooseOnMap}>
                <View style={styles.mapsIcon}>
                  <Text style={styles.mapsIconPin}>📍</Text>
                </View>
                <Text style={styles.chooseText}>Choose</Text>
              </Pressable>

              {meetLocation ? (
                <View style={styles.locationPreviewRow}>
                  <Text style={styles.locationPreviewPin}>📍</Text>
                  <Text style={styles.locationPreview} numberOfLines={2}>
                    {meetLocation}
                  </Text>
                </View>
              ) : null}

              <View style={styles.dateRow}>
                <DateTimePickerField
                  label="From Date : Time *"
                  hint="Now"
                  value={fromDate}
                  minimumDate={new Date()}
                  onChange={d => {
                    setFromDate(d);
                    if (d.getTime() >= toDate.getTime()) {
                      setToDate(new Date(d.getTime() + 60 * 60 * 1000));
                    }
                  }}
                />
                <DateTimePickerField
                  label="To Date : Time"
                  hint="depends"
                  value={toDate}
                  minimumDate={fromDate}
                  onChange={setToDate}
                />
              </View>

              {durationMin !== null && durationMin > 0 ? (
                <View style={uiStyles.infoPill}>
                  <Text style={uiStyles.infoPillText}>
                    Meet duration: {formatDurationHuman(durationMin)}
                  </Text>
                </View>
              ) : (
                <View style={styles.durationWarnPill}>
                  <Text style={styles.durationWarn}>
                    End time must be after start time
                  </Text>
                </View>
              )}

              <Text style={styles.fieldLabel}>Request :</Text>
              <Dropdown
                style={styles.categoryDropdown}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelected}
                data={CATEGORY_OPTIONS}
                labelField="label"
                valueField="value"
                placeholder="Category"
                value={category}
                onChange={item => setCategory(item.value)}
              />

              <View style={styles.messageRow}>
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarIcon}>👤</Text>
                </View>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="message like i will pay vehicle expenses or you have vehicle"
                  placeholderTextColor="#9A9A9A"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!canSend}>
                <Text style={styles.sendText}>Send</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
      <LocationPickerSheet
        visible={locationPickerOpen}
        initialValue={profileLocation}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={address => {
          setLocationSource('chosen');
          setMeetLocation(address);
        }}
      />
    </Modal>
  );
};

export default MateRequestModal;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: UI.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '72%',
    minHeight: '58%',
    paddingHorizontal: 22,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  sheetHeaderSpacer: {
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 22,
    color: '#333333',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 14,
  },
  required: {
    color: '#C0392B',
  },
  outlinePill: {
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlinePillActive: {
    borderColor: '#003B57',
    backgroundColor: '#F0F7FA',
  },
  outlinePillText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  outlinePillTextActive: {
    color: '#003B57',
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginVertical: 14,
  },
  choosePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  choosePillActive: {
    borderColor: '#003B57',
    backgroundColor: '#F0F7FA',
  },
  mapsIcon: {
    marginRight: 10,
  },
  mapsIconPin: {
    fontSize: 20,
  },
  chooseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  locationPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: UI.border,
  },
  locationPreviewPin: {
    fontSize: 16,
    marginRight: 8,
  },
  locationPreview: {
    flex: 1,
    fontSize: 13,
    color: UI.textSecondary,
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 6,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },
  durationWarnPill: {
    backgroundColor: '#FDEEEE',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  durationWarn: {
    fontSize: 12,
    fontWeight: '600',
    color: UI.danger,
  },
  hint: {
    fontSize: 11,
    color: '#888888',
    marginTop: 6,
    fontStyle: 'italic',
  },
  categoryDropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 26,
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: UI.card,
  },
  dropdownPlaceholder: {
    color: '#999999',
    fontSize: 15,
  },
  dropdownSelected: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 28,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 10,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    minHeight: 88,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  messageAvatarIcon: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    minHeight: 72,
    paddingTop: 8,
  },
  sendBtn: {
    backgroundColor: '#003B57',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 4,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
