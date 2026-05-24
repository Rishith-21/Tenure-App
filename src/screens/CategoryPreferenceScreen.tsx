import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {setOnboardingComplete} from '../utils/authStorage';
import BackButton from '../components/navigation/BackButton';
import {goBackSafe, resetToMainTabs} from '../navigation/navigationActions';
import RemovableChip from '../components/ui/RemovableChip';
import {UI, uiLayout, uiStyles} from '../theme/ui';

const categoryData = [
  {label: 'Movie Mate', value: 'Movie Mate'},
  {label: 'Travel Mate', value: 'Travel Mate'},
  {label: 'Time pass Mate', value: 'Time pass Mate'},
  {label: 'Gaming Mate', value: 'Gaming Mate'},
  {label: 'Study Mate', value: 'Study Mate'},
];

const dropdownProps = {
  placeholderStyle: {color: UI.textHint, fontSize: 15},
  selectedTextStyle: {color: UI.text, fontSize: 15, fontWeight: '600'},
  itemTextStyle: {color: UI.text, fontSize: 15},
  activeColor: '#F0F7FA',
  iconStyle: {width: 22, height: 22},
};

const CategoryPreferenceScreen = ({navigation}: any) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [finishing, setFinishing] = useState(false);

  const addCategory = (item: {value: string}) => {
    if (!selectedCategories.includes(item.value)) {
      setSelectedCategories([...selectedCategories, item.value]);
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(
      selectedCategories.filter(item => item !== category),
    );
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await setOnboardingComplete();
      resetToMainTabs(navigation);
    } finally {
      setFinishing(false);
    }
  };

  const displayBudget = budget.trim() || '50';

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

          <Text style={styles.heading}>Select Category*</Text>

          <View style={styles.requestBox}>
            <Text style={styles.requestText}>Depends on user request</Text>
          </View>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <Dropdown
            {...dropdownProps}
            style={styles.dropdown}
            data={categoryData}
            labelField="label"
            valueField="value"
            placeholder="Select Category*"
            value={null}
            onChange={item => addCategory(item)}
          />

          {selectedCategories.length > 0 ? (
            <View style={styles.chipContainer}>
              {selectedCategories.map(category => (
                <RemovableChip
                  key={category}
                  label={category}
                  onRemove={() => removeCategory(category)}
                />
              ))}
            </View>
          ) : null}

          <Text style={styles.budgetHeading}>Money spent per hour</Text>

          <View style={styles.budgetBox}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              placeholder="50"
              placeholderTextColor={UI.text}
              keyboardType="number-pad"
              maxLength={5}
              value={budget}
              onChangeText={setBudget}
              style={styles.budgetInput}
            />
            <Text style={styles.perHour}>/H</Text>
          </View>

          {!budget.trim() ? (
            <Text style={styles.budgetHint}>
              Suggested: ₹ {displayBudget}/H
            </Text>
          ) : null}

          <Pressable
            style={({pressed}) => [
              styles.updateButton,
              pressed && styles.updateButtonPressed,
            ]}>
            <Text style={styles.updateText}>Update more</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.finishButton,
              finishing && styles.finishButtonDisabled,
              pressed && !finishing && styles.finishButtonPressed,
            ]}
            onPress={handleFinish}
            disabled={finishing}>
            {finishing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.finishText}>Save & Finish</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default CategoryPreferenceScreen;

const pillField = {
  ...uiLayout.inputField,
  height: 56,
  borderRadius: 28,
  paddingVertical: 0,
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
    paddingBottom: 56,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 28,
    padding: 4,
  },
  backPressed: {
    opacity: 0.6,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 18,
  },
  requestBox: {
    ...pillField,
    justifyContent: 'center',
    paddingHorizontal: 22,
    backgroundColor: '#F0F7FA',
    borderColor: '#C5DCE6',
  },
  requestText: {
    color: UI.brand,
    fontSize: 16,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: UI.borderInput,
  },
  orText: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.textMuted,
    letterSpacing: 0.5,
  },
  dropdown: {
    ...pillField,
    paddingHorizontal: 22,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 10,
  },
  budgetHeading: {
    alignSelf: 'center',
    marginTop: 44,
    marginBottom: 16,
    fontSize: 17,
    fontWeight: '600',
    color: UI.textSecondary,
  },
  budgetBox: {
    minWidth: 210,
    paddingHorizontal: 20,
    height: 76,
    backgroundColor: UI.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.borderPill,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currency: {
    fontSize: 26,
    color: UI.text,
    fontWeight: '700',
    marginRight: 4,
  },
  budgetInput: {
    fontSize: 28,
    color: UI.text,
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'center',
    padding: 0,
  },
  perHour: {
    fontSize: 22,
    color: UI.text,
    fontWeight: '700',
    marginLeft: 2,
  },
  budgetHint: {
    alignSelf: 'center',
    marginTop: 10,
    fontSize: 12,
    color: UI.textHint,
    fontWeight: '500',
  },
  updateButton: {
    marginTop: 40,
    alignSelf: 'center',
    backgroundColor: '#E8EDF8',
    borderWidth: 1,
    borderColor: '#B8C9E8',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  updateButtonPressed: {
    opacity: 0.88,
  },
  updateText: {
    color: UI.brandMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  finishButton: {
    marginTop: 28,
    backgroundColor: UI.brand,
    minWidth: 220,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: UI.brand,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  finishButtonPressed: {
    opacity: 0.92,
  },
  finishButtonDisabled: {
    opacity: 0.75,
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
