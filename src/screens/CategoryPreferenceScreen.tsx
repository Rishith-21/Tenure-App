import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

import {Dropdown} from 'react-native-element-dropdown';
import {setOnboardingComplete} from '../utils/authStorage';

const categoryData = [
  {label: 'Movie Mate', value: 'Movie Mate'},
  {label: 'Travel Mate', value: 'Travel Mate'},
  {label: 'Time pass Mate', value: 'Time pass Mate'},
  {label: 'Gaming Mate', value: 'Gaming Mate'},
  {label: 'Study Mate', value: 'Study Mate'},
];

const CategoryPreferenceScreen = ({navigation}: any) => {

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [budget, setBudget] = useState('');

  const addCategory = (item: any) => {

    if (
      !selectedCategories.includes(item.value)
    ) {
      setSelectedCategories([
        ...selectedCategories,
        item.value,
      ]);
    }
  };

  const removeCategory = (category: string) => {

    setSelectedCategories(
      selectedCategories.filter(
        item => item !== category,
      ),
    );
  };

  const handleFinish = async () => {
    await setOnboardingComplete();
    navigation.navigate('MainTabs');
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
        Select Category*
      </Text>

      {/* Request Type */}
      <View style={styles.requestBox}>

        <Text style={styles.requestText}>
          Depends on user request
        </Text>

      </View>

      {/* OR */}
      <Text style={styles.orText}>
        OR
      </Text>

      {/* Dropdown */}
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        data={categoryData}
        labelField="label"
        valueField="value"
        placeholder="Select Category*"
        onChange={item => addCategory(item)}
      />

      {/* Chips */}
      <View style={styles.chipContainer}>

        {selectedCategories.map(category => (

          <TouchableOpacity
            key={category}
            style={styles.chip}
            onPress={() =>
              removeCategory(category)
            }>

            <Text style={styles.chipText}>
              {category}
            </Text>

            <Text style={styles.infoIcon}>
              ⓘ
            </Text>

          </TouchableOpacity>

        ))}

      </View>

      {/* Budget */}
      <Text style={styles.budgetHeading}>
        Money spent per hour
      </Text>

      <View style={styles.budgetBox}>

        <Text style={styles.currency}>
          ₹
        </Text>

        <TextInput
          placeholder="50"
          placeholderTextColor="#111"
          keyboardType="number-pad"
          value={budget}
          onChangeText={setBudget}
          style={styles.budgetInput}
        />

        <Text style={styles.perHour}>
          /H
        </Text>

      </View>

      {/* Update More */}
      <TouchableOpacity style={styles.updateButton}>

        <Text style={styles.updateText}>
          Update more
        </Text>

      </TouchableOpacity>

      {/* Finish */}
      <TouchableOpacity
        style={styles.finishButton}
        onPress={handleFinish}>

        <Text style={styles.finishText}>
          Save & Finish
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
};

export default CategoryPreferenceScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 60,
  },

  backButton: {
    marginBottom: 40,
  },

  backArrow: {
    fontSize: 28,
    color: '#111',
  },

  heading: {
    fontSize: 18,
    color: '#222',
    marginBottom: 20,
  },

  requestBox: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  requestText: {
    color: '#003B57',
    fontSize: 16,
  },

  orText: {
    alignSelf: 'center',
    marginVertical: 18,
    fontSize: 16,
    color: '#111',
  },

  dropdown: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
  },

  placeholder: {
    color: '#111',
    fontSize: 18,
  },

  selectedText: {
    color: '#111',
    fontSize: 16,
  },

  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCE7FF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 14,
    marginBottom: 14,
  },

  chipText: {
    color: '#003B57',
    fontSize: 16,
  },

  infoIcon: {
    marginLeft: 8,
    color: '#333',
    fontSize: 15,
  },

  budgetHeading: {
    alignSelf: 'center',
    marginTop: 80,
    marginBottom: 18,
    fontSize: 18,
    color: '#444',
  },

  budgetBox: {
    width: 210,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  currency: {
    fontSize: 26,
    color: '#111',
    fontWeight: '600',
  },

  budgetInput: {
    fontSize: 28,
    color: '#111',
    minWidth: 50,
    textAlign: 'center',
  },

  perHour: {
    fontSize: 22,
    color: '#111',
    fontWeight: '600',
  },

  updateButton: {
    marginTop: 70,
    borderWidth: 1,
    borderColor: '#3A3AFF',
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },

  updateText: {
    color: '#3A3AFF',
    fontSize: 15,
    fontWeight: '500',
  },

  finishButton: {
    marginTop: 55,
    backgroundColor: '#003B57',
    width: 190,
    height: 58,
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  finishText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

});