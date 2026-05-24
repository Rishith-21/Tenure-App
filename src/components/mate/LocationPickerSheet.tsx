import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose}>
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

            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}>
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
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LocationPickerSheet;

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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: UI.textMuted,
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  inputPin: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 14,
    color: UI.text,
  },
  list: {
    maxHeight: 220,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: UI.border,
  },
  optionPressed: {
    opacity: 0.94,
    borderColor: UI.brand,
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
    fontSize: 13,
    color: UI.textSecondary,
    lineHeight: 18,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
