import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import DraggableBottomDrawer, {
  DraggableBottomDrawerRef,
} from '../ui/DraggableBottomDrawer';
import {useTheme} from '../../context/ThemeContext';

const RECENT_LOCATIONS = [
  'India, Karnataka, Udupi, 576111',
  '5VH8+MQ Belman, Karnataka 576111',
  'India, Karnataka, Mangalore, 575001',
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
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const drawerRef = useRef<DraggableBottomDrawerRef>(null);
  const [address, setAddress] = useState(initialValue);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setAddress(initialValue);
    setHighlighted(null);
  }, [visible, initialValue]);

  const trimmed = address.trim();
  const canConfirm = trimmed.length > 0;

  const close = () => {
    drawerRef.current?.dismiss();
  };

  const confirmCustom = () => {
    if (!canConfirm) {
      return;
    }
    drawerRef.current?.dismiss(() => onSelect(trimmed));
  };

  const selectRecent = (loc: string) => {
    setHighlighted(loc);
    setAddress(loc);
    drawerRef.current?.dismiss(() => onSelect(loc));
  };

  return (
    <DraggableBottomDrawer
      ref={drawerRef}
      visible={visible}
      onClose={onClose}
      maxHeightRatio={0.8}
      title="Meet location"
      subtitle="Search or pick a recent place"
      footer={
        <View style={styles.footer}>
          <Pressable
            style={({pressed}) => [
              styles.confirmBtn,
              !canConfirm && styles.confirmBtnDisabled,
              pressed && canConfirm && styles.pressed,
            ]}
            disabled={!canConfirm}
            onPress={confirmCustom}>
            <Text style={styles.confirmText}>Use this address</Text>
          </Pressable>
          <Pressable
            style={({pressed}) => [styles.cancelBtn, pressed && styles.pressed]}
            onPress={close}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      }>
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Address</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={text => {
              setAddress(text);
              setHighlighted(null);
            }}
            placeholder="Street, area, city"
            placeholderTextColor={colors.textHint}
            returnKeyType="done"
            onSubmitEditing={confirmCustom}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.sectionLabelRecent]}>
          Recent places
        </Text>
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {RECENT_LOCATIONS.map(loc => {
            const selected = highlighted === loc;
            return (
              <Pressable
                key={loc}
                style={({pressed}) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => selectRecent(loc)}>
                <View
                  style={[styles.optionDot, selected && styles.optionDotSelected]}
                />
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                  numberOfLines={2}>
                  {loc}
                </Text>
                <Text style={styles.optionChevron}>›</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </DraggableBottomDrawer>
  );
};

export default LocationPickerSheet;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    body: {
      flex: 1,
      paddingHorizontal: 20,
      minHeight: 0,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.45,
      marginBottom: 8,
    },
    sectionLabelRecent: {
      marginTop: 16,
    },
    inputWrap: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 14,
      minHeight: 48,
      justifyContent: 'center',
    },
    input: {
      fontSize: 15,
      fontWeight: '500',
      color: c.text,
      paddingVertical: 12,
    },
    list: {
      flex: 1,
      maxHeight: 240,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
    },
    optionSelected: {
      borderColor: c.brand,
      backgroundColor: c.chip,
    },
    optionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.borderPill,
    },
    optionDotSelected: {
      backgroundColor: c.brand,
    },
    optionText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: c.text,
      lineHeight: 18,
    },
    optionTextSelected: {
      fontWeight: '700',
      color: c.brandDark,
    },
    optionChevron: {
      fontSize: 18,
      color: c.textHint,
      fontWeight: '300',
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
    confirmBtnDisabled: {
      opacity: 0.4,
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
