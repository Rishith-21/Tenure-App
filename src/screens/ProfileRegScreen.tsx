import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {UI, uiLayout} from '../theme/ui';

const TENURE_ID = '763GCG76';
const GENDERS = ['man', 'women', 'other'] as const;
const DEFAULT_AVATAR = 'https://i.pravatar.cc/300';

const ProfileRegScreen = ({navigation}: any) => {
  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);

  const goToLocationStep = () => {
    navigation.navigate('LocationLanguage');
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!selectedGender) {
      setError('Please select your gender');
      return;
    }
    if (!date || !month || !year) {
      setError('Date of birth is required');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      goToLocationStep();
    }, 1500);
  };

  const handleFillInLater = () => {
    if (loading) {
      return;
    }
    setError('');
    goToLocationStep();
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri || DEFAULT_AVATAR);
    }
  };

  return (
    <>
      <StatusBar backgroundColor={UI.bgCream} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.stepsText}>3 Step&apos;s only</Text>

          <Text style={styles.userId}>Tenure id : {TENURE_ID}</Text>

          <View style={styles.imageSection}>
            <View style={styles.avatarRing}>
              <Image source={{uri: profileImage}} style={styles.profileImage} />
            </View>
            <Pressable
              style={({pressed}) => [
                styles.changeButton,
                pressed && styles.changeButtonPressed,
              ]}
              onPress={handlePickImage}>
              <Text style={styles.changeButtonText}>Change Image</Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Your Name*"
            placeholderTextColor={UI.textHint}
            value={name}
            onChangeText={setName}
            style={styles.nameInput}
          />

          <View style={styles.genderRow}>
            {GENDERS.map(gender => {
              const active = selectedGender === gender;
              return (
                <Pressable
                  key={gender}
                  onPress={() => setSelectedGender(gender)}
                  style={({pressed}) => [
                    styles.genderButton,
                    active && styles.genderButtonActive,
                    pressed && !active && styles.genderButtonPressed,
                  ]}>
                  <Text
                    style={[
                      styles.genderText,
                      active && styles.genderTextActive,
                    ]}>
                    {gender}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.dobLabel}>Date of Birth</Text>
          <View style={styles.dobRow}>
            <View style={styles.dobField}>
              <TextInput
                placeholder="date"
                placeholderTextColor={UI.textHint}
                keyboardType="number-pad"
                maxLength={2}
                value={date}
                onChangeText={setDate}
                style={styles.dobInput}
              />
            </View>
            <View style={styles.dobField}>
              <TextInput
                placeholder="month"
                placeholderTextColor={UI.textHint}
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={setMonth}
                style={styles.dobInput}
              />
            </View>
            <View style={styles.dobField}>
              <TextInput
                placeholder="year *"
                placeholderTextColor={UI.textHint}
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={setYear}
                style={styles.dobInput}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.footer}>
            <Pressable
              style={({pressed}) => [
                styles.laterButton,
                pressed && styles.laterButtonPressed,
              ]}
              onPress={handleFillInLater}
              disabled={loading}
              hitSlop={8}>
              <Text style={styles.laterText}>Fill in later</Text>
              <Text style={styles.laterArrow}>→</Text>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.saveButton,
                loading && styles.saveButtonDisabled,
                pressed && !loading && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.saveContent}>
                  <Text style={styles.saveButtonText}>Save</Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default ProfileRegScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: UI.bgCream,
  },
  container: {
    flex: 1,
    backgroundColor: UI.bgCream,
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 52,
    paddingBottom: 40,
  },
  stepsText: {
    alignSelf: 'flex-end',
    fontSize: 13,
    fontWeight: '600',
    color: UI.textMuted,
    marginBottom: 8,
  },
  userId: {
    alignSelf: 'center',
    color: UI.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 28,
    letterSpacing: 0.2,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: UI.brand,
    marginBottom: 14,
    backgroundColor: UI.card,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: UI.cardMuted,
  },
  changeButton: {
    backgroundColor: UI.card,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: UI.borderInput,
  },
  changeButtonPressed: {
    opacity: 0.88,
  },
  changeButtonText: {
    color: UI.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  nameInput: {
    ...uiLayout.inputField,
    fontSize: 16,
    color: UI.text,
    marginBottom: 20,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },
  genderButton: {
    flex: 1,
    backgroundColor: UI.card,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  genderButtonActive: {
    backgroundColor: UI.brand,
    borderColor: UI.brand,
  },
  genderButtonPressed: {
    opacity: 0.9,
  },
  genderText: {
    color: UI.text,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dobLabel: {
    ...uiLayout.fieldLabel,
    fontSize: 15,
    color: UI.text,
    marginBottom: 12,
  },
  dobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 28,
  },
  dobField: {
    flex: 1,
  },
  dobInput: {
    ...uiLayout.inputField,
    textAlign: 'center',
    fontSize: 15,
    paddingVertical: 16,
    minHeight: 52,
  },
  errorText: {
    color: UI.danger,
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 4,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  laterButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.borderInput,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginLeft: 2,
  },
  laterButtonPressed: {
    opacity: 0.88,
    backgroundColor: '#F5F5F3',
  },
  laterText: {
    color: UI.brandMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  laterArrow: {
    color: UI.brandMuted,
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: UI.brand,
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.92,
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '700',
  },
});
