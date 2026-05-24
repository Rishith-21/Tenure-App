import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import RemovableChip from '../components/ui/RemovableChip';
import {UI, uiLayout, uiStyles} from '../theme/ui';
import BackButton from '../components/navigation/BackButton';
import {goBackSafe} from '../navigation/navigationActions';

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

const dropdownProps = {
  placeholderStyle: {color: UI.textHint, fontSize: 15},
  selectedTextStyle: {color: UI.text, fontSize: 15, fontWeight: '600'},
  itemTextStyle: {color: UI.text, fontSize: 15},
  activeColor: '#F0F7FA',
  iconStyle: {width: 22, height: 22},
};

const LocationLanguageScreen = ({navigation}: any) => {
  const [country, setCountry] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const addLanguage = (item: {value: string}) => {
    if (!selectedLanguages.includes(item.value)) {
      setSelectedLanguages([...selectedLanguages, item.value]);
    }
  };

  const removeLanguage = (lang: string) => {
    setSelectedLanguages(selectedLanguages.filter(item => item !== lang));
  };

  const handleSave = () => {
    navigation.navigate('CategoryPreference');
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
          <BackButton onPress={() => goBackSafe(navigation)} />

          <View style={styles.locationHeader}>
            <Text style={styles.heading}>Pin your primary location *</Text>
            <View style={styles.pinBadge}>
              <Text style={styles.pinIcon}>📍</Text>
            </View>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.row}>
              <Dropdown
                {...dropdownProps}
                style={styles.dropdownBox}
                data={countryData}
                labelField="label"
                valueField="value"
                placeholder="Country"
                value={country}
                onChange={item => setCountry(item.value)}
              />
              <Dropdown
                {...dropdownProps}
                style={styles.dropdownBox}
                data={stateData}
                labelField="label"
                valueField="value"
                placeholder="State"
                value={state}
                onChange={item => setState(item.value)}
              />
            </View>

            <View style={styles.row}>
              <Dropdown
                {...dropdownProps}
                style={styles.dropdownBox}
                data={districtData}
                labelField="label"
                valueField="value"
                placeholder="District"
                value={district}
                onChange={item => setDistrict(item.value)}
              />
              <TextInput
                placeholder="Zip Code"
                placeholderTextColor={UI.textHint}
                keyboardType="number-pad"
                maxLength={6}
                value={zipCode}
                onChangeText={setZipCode}
                style={styles.zipInput}
              />
            </View>
          </View>

          <Text style={styles.languageHeading}>Language known*</Text>

          <Dropdown
            {...dropdownProps}
            style={styles.languageDropdown}
            data={languageData}
            labelField="label"
            valueField="value"
            placeholder="Select *"
            value={null}
            onChange={item => addLanguage(item)}
          />

          {selectedLanguages.length > 0 ? (
            <View style={styles.languageContainer}>
              {selectedLanguages.map(lang => (
                <RemovableChip
                  key={lang}
                  label={lang.toLowerCase()}
                  onRemove={() => removeLanguage(lang)}
                />
              ))}
            </View>
          ) : null}

          <Pressable
            style={({pressed}) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
            <Text style={styles.saveArrow}>→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default LocationLanguageScreen;

const fieldBase = {
  ...uiLayout.inputField,
  height: 54,
  paddingVertical: 0,
  borderRadius: 20,
};

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
    paddingTop: 48,
    paddingBottom: 48,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 28,
    padding: 4,
  },
  backPressed: {
    opacity: 0.6,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heading: {
    flex: 1,
    fontSize: 17,
    color: UI.text,
    fontWeight: '700',
    lineHeight: 24,
    paddingRight: 12,
  },
  pinBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    fontSize: 18,
  },
  locationCard: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  dropdownBox: {
    ...fieldBase,
    flex: 1,
    paddingHorizontal: 14,
  },
  zipInput: {
    ...fieldBase,
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: UI.text,
  },
  languageHeading: {
    marginTop: 36,
    marginBottom: 14,
    fontSize: 17,
    fontWeight: '700',
    color: UI.text,
  },
  languageDropdown: {
    ...fieldBase,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 22,
    marginBottom: 18,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 48,
    alignSelf: 'center',
    backgroundColor: UI.brand,
    minWidth: 200,
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.92,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  saveArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '700',
  },
});
