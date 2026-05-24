import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';

const countryData = [
  {label: 'India', value: 'india'},
  {label: 'USA', value: 'usa'},
];

const stateData = [
  {label: 'Karnataka', value: 'karnataka'},
  {label: 'Kerala', value: 'kerala'},
];

const districtData = [
  {label: 'Dakshina Kannada', value: 'dk'},
  {label: 'Udupi', value: 'udupi'},
];

const languageData = [
  {label: 'Kannada', value: 'Kannada'},
  {label: 'Malayalam', value: 'Malayalam'},
  {label: 'Tulu', value: 'Tulu'},
  {label: 'Hindi', value: 'Hindi'},
];

const LocationLanguageScreen = ({navigation}: any) => {

  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [district, setDistrict] = useState(null);
  const [zipCode, setZipCode] = useState('');

  const [selectedLanguages, setSelectedLanguages] =
    useState<string[]>([]);

  const addLanguage = (item: any) => {

    if (
      !selectedLanguages.includes(item.value)
    ) {
      setSelectedLanguages([
        ...selectedLanguages,
        item.value,
      ]);
    }
  };

  const removeLanguage = (lang: string) => {
    setSelectedLanguages(
      selectedLanguages.filter(
        item => item !== lang,
      ),
    );
  };
const handleSave = () => {

  console.log({
    country,
    state,
    district,
    zipCode,
    selectedLanguages,
  });

  navigation.navigate('CategoryPreference');
};
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>

        <Text style={styles.backArrow}>
          ←
        </Text>
      </TouchableOpacity>

      {/* Heading */}
      <Text style={styles.heading}>
        Pin your primary location *
      </Text>

      {/* Row 1 */}
      <View style={styles.row}>

        <Dropdown
          style={styles.dropdownBox}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          data={countryData}
          labelField="label"
          valueField="value"
          placeholder="Country"
          value={country}
          onChange={item => setCountry(item.value)}
        />

        <Dropdown
          style={styles.dropdownBox}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          data={stateData}
          labelField="label"
          valueField="value"
          placeholder="State"
          value={state}
          onChange={item => setState(item.value)}
        />

      </View>

      {/* Row 2 */}
      <View style={styles.row}>

        <Dropdown
          style={styles.dropdownBox}
          placeholderStyle={styles.placeholder}
          selectedTextStyle={styles.selectedText}
          data={districtData}
          labelField="label"
          valueField="value"
          placeholder="District"
          value={district}
          onChange={item => setDistrict(item.value)}
        />

        <TextInput
          placeholder="Zip Code"
          placeholderTextColor="#B5B5B5"
          keyboardType="number-pad"
          value={zipCode}
          onChangeText={setZipCode}
          style={styles.zipInput}
        />

      </View>

      {/* Language */}
      <Text style={styles.languageHeading}>
        Language known*
      </Text>

      {/* Language Dropdown */}
      <Dropdown
        style={styles.languageDropdown}
        placeholderStyle={styles.languagePlaceholder}
        selectedTextStyle={styles.selectedText}
        data={languageData}
        labelField="label"
        valueField="value"
        placeholder="Select *"
        onChange={item => addLanguage(item)}
      />

      {/* Chips */}
      <View style={styles.languageContainer}>

        {selectedLanguages.map(lang => (

          <TouchableOpacity
            key={lang}
            style={styles.languageChip}
            onPress={() => removeLanguage(lang)}>

            <Text style={styles.languageText}>
              {lang}
            </Text>

          </TouchableOpacity>

        ))}

      </View>

      {/* Save */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}>


        <Text style={styles.saveText}>
          Save
        </Text>

        <Text style={styles.saveArrow}>
          →
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
};

export default LocationLanguageScreen;


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 50,
  },

  backButton: {
    marginBottom: 45,
  },

  backArrow: {
    fontSize: 28,
    color: '#111',
  },

  heading: {
    fontSize: 18,
    color: '#333',
    marginBottom: 28,
    fontWeight: '400',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  dropdownBox: {
    width: '48%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  zipInput: {
    width: '48%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#111',
  },

  placeholder: {
    color: '#B5B5B5',
    fontSize: 15,
  },

  selectedText: {
    color: '#111111',
    fontSize: 15,
  },

  languageHeading: {
    marginTop: 55,
    marginBottom: 18,
    fontSize: 18,
    color: '#333',
  },

  languageDropdown: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    marginBottom: 20,
  },

  languagePlaceholder: {
    color: '#111',
    fontSize: 18,
  },

  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  languageChip: {
    backgroundColor: '#DCE7FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 14,
    marginBottom: 14,
  },

  languageText: {
    color: '#003B57',
    fontSize: 16,
  },

  saveButton: {
    marginTop: 90,
    alignSelf: 'center',
    backgroundColor: '#003B57',
    width: 165,
    height: 58,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  saveArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 12,
  },

});