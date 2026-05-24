import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {UI, uiLayout, uiStyles} from '../../theme/ui';

export type ProfileCardEditValues = {
  name: string;
  profileImage: string;
  ratePerHour: string;
  location: string;
};

type Props = {
  visible: boolean;
  initial: ProfileCardEditValues;
  onClose: () => void;
  onSave: (values: ProfileCardEditValues) => void;
};

const ProfileCardEditSheet = ({
  visible,
  initial,
  onClose,
  onSave,
}: Props) => {
  const [name, setName] = useState(initial.name);
  const [profileImage, setProfileImage] = useState(initial.profileImage);
  const [ratePerHour, setRatePerHour] = useState(initial.ratePerHour);
  const [location, setLocation] = useState(initial.location);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initial.name);
      setProfileImage(initial.profileImage);
      setRatePerHour(initial.ratePerHour);
      setLocation(initial.location);
      setError('');
    }
  }, [visible, initial]);

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.85,
      selectionLimit: 1,
    });
    if (result.assets?.[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    const rate = ratePerHour.replace(/[^0-9]/g, '');
    if (!rate) {
      setError('Enter a valid hourly rate');
      return;
    }
    if (!location.trim()) {
      setError('Location is required');
      return;
    }
    onSave({
      name: name.trim(),
      profileImage,
      ratePerHour: rate,
      location: location.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={uiStyles.sheetHandle} />
            <Text style={styles.title}>Edit profile</Text>
            <Text style={styles.subtitle}>
              Name, photo, rate, and location only
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.avatarSection}>
                <View style={styles.avatarRing}>
                  <Image
                    source={{uri: profileImage}}
                    style={styles.avatar}
                  />
                </View>
                <Pressable
                  style={({pressed}) => [
                    styles.photoBtn,
                    pressed && styles.photoBtnPressed,
                  ]}
                  onPress={handlePickPhoto}>
                  <Text style={styles.photoBtnText}>Change photo</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Your name</Text>
              <TextInput
                value={name}
                onChangeText={text => {
                  setName(text);
                  setError('');
                }}
                placeholder="Your name"
                placeholderTextColor={UI.textHint}
                style={styles.input}
              />

              <Text style={styles.label}>Money per hour (₹)</Text>
              <View style={styles.rateRow}>
                <Text style={styles.ratePrefix}>₹</Text>
                <TextInput
                  value={ratePerHour}
                  onChangeText={text => {
                    setRatePerHour(text.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="50"
                  placeholderTextColor={UI.textHint}
                  style={[styles.input, styles.rateInput]}
                />
                <Text style={styles.rateSuffix}>/H</Text>
              </View>

              <Text style={styles.label}>Location</Text>
              <TextInput
                value={location}
                onChangeText={text => {
                  setLocation(text);
                  setError('');
                }}
                placeholder="City, state, zip"
                placeholderTextColor={UI.textHint}
                style={[styles.input, styles.locationInput]}
                multiline
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={({pressed}) => [
                  styles.saveBtn,
                  pressed && styles.saveBtnPressed,
                ]}
                onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save changes</Text>
              </Pressable>

              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ProfileCardEditSheet;

const styles = StyleSheet.create({
  flex: {flex: 1},
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: UI.overlay,
  },
  sheet: {
    ...uiLayout.sheet,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    maxHeight: '88%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: UI.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: UI.textMuted,
    textAlign: 'center',
    marginBottom: 18,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: UI.brand,
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: UI.cardMuted,
  },
  photoBtn: {
    backgroundColor: '#F0F7FA',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C5DCE6',
  },
  photoBtnPressed: {opacity: 0.88},
  photoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: UI.brand,
  },
  label: {
    ...uiLayout.fieldLabel,
    marginLeft: 2,
    marginBottom: 8,
  },
  input: {
    ...uiLayout.inputField,
    fontSize: 15,
    color: UI.text,
    marginBottom: 16,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratePrefix: {
    fontSize: 20,
    fontWeight: '800',
    color: UI.text,
    marginRight: 8,
  },
  rateInput: {
    flex: 1,
    marginBottom: 0,
    textAlign: 'center',
    fontWeight: '800',
  },
  rateSuffix: {
    fontSize: 18,
    fontWeight: '700',
    color: UI.textSecondary,
    marginLeft: 8,
  },
  locationInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  error: {
    color: UI.danger,
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: UI.brand,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnPressed: {opacity: 0.92},
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.textMuted,
  },
});
