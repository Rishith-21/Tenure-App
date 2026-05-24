import React, {useState} from 'react';
import DateTimePickerField from '../components/ui/DateTimePickerField';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import {showPhotoPickerActions} from '../utils/chatMedia';
import {useAppDialog} from '../context/DialogContext';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type ChipItem = {id: string; label: string; icon?: string};

const ProfileUpdateMoreScreen = ({navigation, route}: any) => {
  const {showAlert, showChoice} = useAppDialog();
  const initialDays: string[] = route.params?.selectedDays ?? ['SUN'];
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(17, 30, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(17, 30, 0, 0);
    return d;
  });
  const [about, setAbout] = useState('hi i am vikas');
  const [vehicleExpanded, setVehicleExpanded] = useState(true);
  const [professionExpanded, setProfessionExpanded] = useState(true);

  const [socialLinks, setSocialLinks] = useState<ChipItem[]>([
    {id: 'yt', label: 'You tube', icon: '▶'},
    {id: 'ig', label: 'Instagram', icon: '📷'},
  ]);

  const [vehicles, setVehicles] = useState<ChipItem[]>([
    {id: 'bike', label: 'Bike (petrole)', icon: '🏍'},
    {id: 'car', label: 'Car (electric)', icon: '🚗'},
  ]);

  const [professions, setProfessions] = useState<ChipItem[]>([
    {id: 'doc', label: 'Doctor'},
    {id: 'cc', label: 'content creater'},
  ]);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const removeChip = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<ChipItem[]>>,
  ) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const handleAddSocial = () => {
    showChoice({
      title: 'Add link',
      message: 'Choose a platform',
      options: [
        {
          text: 'YouTube',
          onPress: () =>
            setSocialLinks(prev => [
              ...prev,
              {id: `yt-${Date.now()}`, label: 'You tube', icon: '▶'},
            ]),
        },
        {
          text: 'Instagram',
          onPress: () =>
            setSocialLinks(prev => [
              ...prev,
              {id: `ig-${Date.now()}`, label: 'Instagram', icon: '📷'},
            ]),
        },
        {
          text: 'Website',
          onPress: () =>
            setSocialLinks(prev => [
              ...prev,
              {id: `web-${Date.now()}`, label: 'Own website', icon: '🌐'},
            ]),
        },
      ],
    });
  };

  const handleSave = () => {
    showAlert({
      title: 'Updated',
      message: 'Your profile details were saved.',
      onClose: () => navigation.navigate('UserProfile', {selectedDays}),
    });
  };

  const renderRemovableChips = (
    items: ChipItem[],
    onRemove: (id: string) => void,
  ) => (
    <View style={styles.chipWrap}>
      {items.map(item => (
        <View key={item.id} style={styles.removableChip}>
          {item.icon ? (
            <Text style={styles.chipIcon}>{item.icon}</Text>
          ) : null}
          <Text style={styles.chipLabel}>{item.label}</Text>
          <Pressable onPress={() => onRemove(item.id)} hitSlop={8}>
            <Text style={styles.chipRemove}>✕</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );

  return (
    <>
      <StatusBar backgroundColor="#F7F2EA" barStyle="dark-content" />

      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionLabel}>Set available time</Text>

          <View style={styles.timeCard}>
            <View style={styles.timeRow}>
              <DateTimePickerField
                mode="time"
                value={startTime}
                onChange={setStartTime}
              />
              <Text style={styles.timeTo}>TO</Text>
              <DateTimePickerField
                mode="time"
                value={endTime}
                minimumDate={startTime}
                onChange={setEndTime}
              />
            </View>
          </View>

          <View style={styles.daysRow}>
            {WEEK_DAYS.map(day => {
              const active = selectedDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.dayChip, active && styles.dayChipActive]}>
                  <Text
                    style={[styles.dayText, active && styles.dayTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Social media links / website</Text>

          <View style={styles.socialRow}>
            <Pressable style={styles.addLinkBtn} onPress={handleAddSocial}>
              <Text style={styles.addLinkIcon}>🔗</Text>
              <Text style={styles.addLinkPlus}>+</Text>
            </Pressable>
            <View style={styles.socialChipsCol}>
              {renderRemovableChips(socialLinks, id =>
                removeChip(id, setSocialLinks),
              )}
            </View>
          </View>

          <Pressable
            style={styles.expandHeader}
            onPress={() => setVehicleExpanded(v => !v)}>
            <Text style={styles.expandTitle}>I have a Vehicle</Text>
            <Text style={styles.chevron}>{vehicleExpanded ? '∧' : '∨'}</Text>
          </Pressable>
          {vehicleExpanded &&
            renderRemovableChips(vehicles, id => removeChip(id, setVehicles))}

          <Pressable
            style={styles.expandHeader}
            onPress={() => setProfessionExpanded(v => !v)}>
            <Text style={styles.expandTitle}>I am</Text>
            <Text style={styles.chevron}>{professionExpanded ? '∧' : '∨'}</Text>
          </Pressable>
          {professionExpanded &&
            renderRemovableChips(professions, id =>
              removeChip(id, setProfessions),
            )}

          <Text style={styles.sectionLabel}>About</Text>
          <TextInput
            style={styles.aboutInput}
            value={about}
            onChangeText={setAbout}
            multiline
            placeholder="Tell others about you"
            placeholderTextColor="#999999"
          />

          <Text style={styles.sectionLabel}>
            Upload your & your vehicle photos
          </Text>
          <Pressable
            style={styles.galleryPill}
            onPress={() =>
              showPhotoPickerActions(() =>
                showAlert({
                  title: 'Photo added',
                  message: 'Image saved to gallery list.',
                }),
              )
            }>
            <Text style={styles.galleryPillText}>Galary</Text>
            <Text style={styles.galleryPillIcon}>↻</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Update</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
};

export default ProfileUpdateMoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EA',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  backArrow: {
    fontSize: 28,
    color: '#111111',
    marginBottom: 16,
  },
  scroll: {
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
    marginTop: 8,
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8E0D6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  timeCapsule: {
    backgroundColor: '#003B57',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeCapsuleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  timeTo: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  changeBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#D5D5D5',
  },
  changeBtnText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayChipActive: {
    backgroundColor: '#003B57',
    borderColor: '#003B57',
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666666',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  addLinkBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#003B57',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  addLinkIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  addLinkPlus: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  socialChipsCol: {
    flex: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  removableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4E8EC',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginRight: 8,
  },
  chipRemove: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '700',
  },
  expandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  expandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  chevron: {
    fontSize: 18,
    color: '#333333',
  },
  aboutInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111111',
    minHeight: 56,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E0D6',
  },
  galleryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4E8EC',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 32,
  },
  galleryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginRight: 8,
  },
  galleryPillIcon: {
    fontSize: 14,
    color: '#555555',
  },
  saveButton: {
    backgroundColor: '#003B57',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
