import React, { useState } from 'react';
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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
const ProfileRegScreen = ({ navigation}: any) => {

  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(
    'https://i.pravatar.cc/300',
   );
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

    console.log('Profile Saved');

    navigation.navigate('LocationLanguage');

  }, 1500);
};

    const handlePickImage = async () => {

    const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
    });

    if (
        result.assets &&
        result.assets.length > 0
    ) {
        setProfileImage(result.assets[0].uri || '');
    }
    };

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Steps */}
        <Text style={styles.stepsText}>
          Only 3 Steps
        </Text>

        {/* User ID */}
        <Text style={styles.userId}>
          Tenure ID : 763GCG76
        </Text>

        {/* Profile Image */}
        <View style={styles.imageSection}>

          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />

          <Pressable style={styles.changeButton} onPress={handlePickImage}>
            <Text style={styles.changeButtonText}>
              Change Image
            </Text>
          </Pressable>

        </View>

        {/* Name Input */}
        <TextInput
          placeholder="Your Name *"
          placeholderTextColor="#8A8A8A"
          value={name}
          onChangeText={setName}
          style={styles.nameInput}
        />

        {/* Gender */}
        <View style={styles.genderRow}>

          {['Man', 'Women', 'Other'].map(
            (gender) => (

              <Pressable
                key={gender}
                onPress={() =>
                  setSelectedGender(gender)
                }
                style={[
                  styles.genderButton,

                  selectedGender === gender &&
                  styles.genderButtonActive,
                ]}>

                <Text
                  style={[
                    styles.genderText,

                    selectedGender === gender &&
                    styles.genderTextActive,
                  ]}>

                  {gender}

                </Text>

              </Pressable>
            ),
          )}

        </View>

        {/* DOB */}
        <Text style={styles.dobLabel}>
          Date of Birth
        </Text>

        <View style={styles.dobRow}>

          <TextInput
            placeholder="DD"
            placeholderTextColor="#8A8A8A"
            keyboardType="number-pad"
            maxLength={2}
            value={date}
            onChangeText={setDate}
            style={styles.dobInput}
          />

          <TextInput
            placeholder="MM"
            placeholderTextColor="#8A8A8A"
            keyboardType="number-pad"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
            style={styles.dobInput}
          />

          <TextInput
            placeholder="YYYY"
            placeholderTextColor="#8A8A8A"
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={setYear}
            style={styles.dobInput}
          />

        </View>

        {/* Skip */}
        <Pressable>
          <Text style={styles.skipText}>
            Skip for now
          </Text>
        </Pressable>
          {error ? (
            <Text style={styles.errorText}>
                {error}
            </Text>
            ) : null}
        {/* Save Button */}
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}>

          {loading ? (

            <ActivityIndicator color="#FFFFFF" />

          ) : (
            
            <View style={styles.saveContent}>

              <Text style={styles.saveButtonText}>
                Save
              </Text>

              <Text style={styles.arrow}>
                →
              </Text>

            </View>

          )}

        </Pressable>

      </ScrollView>
    </>
  );
};

export default ProfileRegScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
  },

  stepsText: {
    alignSelf: 'flex-end',
    fontSize: 18,
    color: '#111111',
    marginBottom: 30,
  },

  userId: {
    alignSelf: 'center',
    color: '#777777',
    fontSize: 14,
    marginBottom: 20,
  },

  imageSection: {
    alignItems: 'center',
    marginBottom: 50,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
  },

  changeButton: {
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 30,
  },

  changeButtonText: {
    color: '#555555',
    fontSize: 13,
  },

  nameInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 16,
    color: '#111111',
    marginBottom: 24,
  },

  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 36,
  },

  genderButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  genderButtonActive: {
    backgroundColor: '#003B57',
    borderColor: '#003B57',
  },

  genderText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },

  genderTextActive: {
    color: '#FFFFFF',
  },

  dobLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 18,
  },

  dobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },

  dobInput: {
    width: '30%',
    backgroundColor: '#F8F8F8',
    borderRadius: 18,
    paddingVertical: 18,
    textAlign: 'center',
    fontSize: 16,
    color: '#111111',
  },

  skipText: {
    color: '#666666',
    fontSize: 15,
    marginBottom: 30,
  },

  saveButton: {
    backgroundColor: '#003B57',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    width: 170,
    alignSelf: 'center',
  },

  saveContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 12,
    marginTop: -2,
  },
  errorText: {
  color: '#E53935',
  fontSize: 14,
  marginBottom: 20,
},

});