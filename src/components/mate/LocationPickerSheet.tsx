import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import BottomSheetModal from '../ui/BottomSheetModal';
import {UI, uiLayout, uiStyles} from '../../theme/ui';

const RECENT_LOCATIONS = [
  'India, karnataka, udupi, 576111',
  '5VH8+MQ Belman, Karnataka 576111',
  'India, karnataka, mangalore, 575001',
];

type Props = {
  visible: boolean;
  initialValue?: string;
  onClose: () => void;
  onSelect: (address: string) => void;
};

const LocationPickerSheet = ({
  visible,
  initialValue = '',
  onClose,
  onSelect,
}: Props) => {
  const [custom, setCustom] = useState(initialValue);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={uiStyles.sheetHandle} />
        <Text style={styles.title}>Choose meet location</Text>
        <Text style={styles.subtitle}>
          Pick a recent place or type your address
        </Text>

        <View style={styles.inputWrap}>
          <Text style={styles.inputPin}>📍</Text>
          <TextInput
            style={styles.input}
            value={custom}
            onChangeText={setCustom}
            placeholder="Type address"
            placeholderTextColor="#9A9A9A"
          />
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {RECENT_LOCATIONS.map(loc => (
            <Pressable
              key={loc}
              style={({pressed}) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
              onPress={() => {
                onSelect(loc);
                onClose();
              }}>
              <View style={styles.optionIconWrap}>
                <Text style={styles.optionPin}>📍</Text>
              </View>
              <Text style={styles.optionText}>{loc}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={({pressed}) => [
            uiStyles.pillPrimary,
            pressed && styles.btnPressed,
            !custom.trim() && styles.btnDisabled,
          ]}
          disabled={!custom.trim()}
          onPress={() => {
            if (custom.trim()) {
              onSelect(custom.trim());
              onClose();
            }
          }}>
          <Text style={uiStyles.pillPrimaryText}>Use this address</Text>
        </Pressable>
      </Pressable>
    </BottomSheetModal>
  );
};

export default LocationPickerSheet;

const styles = StyleSheet.create({
  sheet: {
    ...uiLayout.sheet,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: '72%',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: UI.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: UI.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 14,
    marginBottom: 12,
    minHeight: 52,
  },
  inputPin: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: UI.text,
    paddingVertical: 12,
  },
  list: {
    maxHeight: 200,
    marginBottom: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI.border,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionPin: {
    fontSize: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: UI.text,
    lineHeight: 20,
  },
  btnPressed: {
    opacity: 0.92,
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
