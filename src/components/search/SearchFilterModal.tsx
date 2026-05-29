import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

export type SearchFilters = {
  district: string | null;
  category: string | null;
  gender: 'all' | 'male' | 'female';
  ageRange: 'all' | 'under30' | '30to45' | 'over45';
};

type Props = {
  visible: boolean;
  filters: SearchFilters;
  districts: {label: string; value: string}[];
  categories: {label: string; value: string}[];
  onChange: (filters: SearchFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
};

const GENDER_OPTIONS = [
  {label: 'Any gender', value: 'all'},
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
];

const AGE_OPTIONS = [
  {label: 'Any age', value: 'all'},
  {label: 'Under 30', value: 'under30'},
  {label: '30 – 45', value: '30to45'},
  {label: 'Over 45', value: 'over45'},
];

const SearchFilterModal = ({
  visible,
  filters,
  districts,
  categories,
  onChange,
  onClose,
  onApply,
  onReset,
}: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={() => {}}>
        <View style={styles.handle} />

        <Text style={styles.title}>Filter mates</Text>
        <Text style={styles.subtitle}>
          Narrow results by location, category, and more
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <Text style={styles.label}>Location — District</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
            data={districts}
            labelField="label"
            valueField="value"
            placeholder="Select district"
            value={filters.district}
            onChange={item =>
              onChange({...filters, district: item.value})
            }
          />

          <Text style={styles.label}>Category</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
            data={categories}
            labelField="label"
            valueField="value"
            placeholder="Select mate type"
            value={filters.category}
            onChange={item =>
              onChange({...filters, category: item.value})
            }
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map(opt => {
              const active = filters.gender === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    onChange({
                      ...filters,
                      gender: opt.value as SearchFilters['gender'],
                    })
                  }
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Age</Text>
          <View style={styles.chipRowWrap}>
            {AGE_OPTIONS.map(opt => {
              const active = filters.ageRange === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    onChange({
                      ...filters,
                      ageRange: opt.value as SearchFilters['ageRange'],
                    })
                  }
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Pressable style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyText}>Apply filters</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

export default SearchFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#E8F4FC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '78%',
    borderWidth: 1,
    borderColor: '#C5DCE6',
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#A8C5D4',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#003B57',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#5A7A8A',
    marginBottom: 18,
  },
  scroll: {
    maxHeight: 340,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
    marginTop: 6,
  },
  dropdown: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D0E4EF',
  },
  placeholder: {
    color: '#888888',
    fontSize: 15,
  },
  selectedText: {
    color: '#111111',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D0E4EF',
  },
  chipActive: {
    backgroundColor: '#003B57',
    borderColor: '#003B57',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D0E4EF',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
  },
  applyBtn: {
    flex: 1.4,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#003B57',
    marginLeft: 8,
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
