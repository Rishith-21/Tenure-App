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
  Dimensions,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {UI, uiLayout} from '../../theme/ui';

const DIALOG_MAX_H = Dimensions.get('window').height * 0.82;

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
      quality: 0.8,
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close edit profile"
          />

          <View style={styles.dialogWrap}>
            <Pressable style={styles.dialog} onPress={() => {}}>
              <View style={styles.dialogHeader}>
                <View style={styles.headerTextBlock}>
                  <Text style={styles.title}>Edit profile</Text>
                  <Text style={styles.subtitle}>
                    Name, photo, rate, and location
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  style={({pressed}) => [
                    styles.closeBtn,
                    pressed && styles.closeBtnPressed,
                  ]}
                  accessibilityLabel="Close">
                  <Text style={styles.closeBtnText}>×</Text>
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                  <View style={styles.avatarRing}>
                    <Image source={{uri: profileImage}} style={styles.avatar} />
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ProfileCardEditSheet;

const styles = StyleSheet.create({
  flex: {flex: 1},
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
    backgroundColor: 'rgba(0, 59, 87, 0.28)',
  },
  dialogWrap: {
    width: '100%',
    maxWidth: 380,
    maxHeight: DIALOG_MAX_H,
    zIndex: 2,
  },
  dialog: {
    backgroundColor: UI.bgCream,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI.borderInput,
    overflow: 'hidden',
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: UI.card,
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: UI.bgCream,
    borderWidth: 1,
    borderColor: UI.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {opacity: 0.85},
  closeBtnText: {
    fontSize: 22,
    lineHeight: 24,
    color: UI.text,
    fontWeight: '400',
    marginTop: -2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: UI.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: UI.textMuted,
    lineHeight: 17,
  },
  scroll: {
    maxHeight: DIALOG_MAX_H - 72,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: UI.primary,
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: UI.cardMuted,
  },
  photoBtn: {
    backgroundColor: UI.card,
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
    color: UI.text,
  },
  label: {
    ...uiLayout.fieldLabel,
    marginLeft: 2,
    marginBottom: 8,
  },
  input: {
    ...uiLayout.inputField,
    backgroundColor: UI.card,
    fontSize: 15,
    color: UI.text,
    marginBottom: 14,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    minHeight: 68,
    textAlignVertical: 'top',
  },
  error: {
    color: UI.danger,
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: UI.primary,
    borderRadius: 22,
    paddingVertical: 15,
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
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.textMuted,
  },
});
