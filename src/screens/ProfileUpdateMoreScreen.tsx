import React, {useState} from 'react';
import DateTimePickerField from '../components/ui/DateTimePickerField';
import RemovableChip from '../components/ui/RemovableChip';
import SocialLinkSheet from '../components/profile/SocialLinkSheet';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import {showPhotoPickerActions} from '../utils/chatMedia';
import {useAppDialog} from '../context/DialogContext';
import {
  PROFESSION_OPTIONS,
  SOCIAL_PLATFORMS,
  SocialPlatform,
  VEHICLE_OPTIONS,
} from '../constants/profileOptions';
import {UI, uiLayout} from '../theme/ui';
import {goBackSafe} from '../navigation/navigationActions';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type ChipItem = {id: string; label: string; icon?: string};

export type SocialLinkItem = {
  id: string;
  platformId: string;
  label: string;
  icon: string;
  url: string;
};

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
  const [about, setAbout] = useState('');
  const [vehicleExpanded, setVehicleExpanded] = useState(true);
  const [professionExpanded, setProfessionExpanded] = useState(true);

  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [vehicles, setVehicles] = useState<ChipItem[]>([]);
  const [professions, setProfessions] = useState<ChipItem[]>([]);

  const [socialSheetVisible, setSocialSheetVisible] = useState(false);
  const [pendingPlatform, setPendingPlatform] =
    useState<SocialPlatform | null>(null);

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
    const used = new Set(socialLinks.map(l => l.platformId));
    const available = SOCIAL_PLATFORMS.filter(p => !used.has(p.id));
    if (available.length === 0) {
      showAlert({
        title: 'All platforms added',
        message: 'Remove a link to add a different platform.',
      });
      return;
    }

    showChoice({
      title: 'Add social profile',
      message: 'Choose a platform',
      options: available.map(platform => ({
        text: `${platform.icon} ${platform.label}`,
        onPress: () => {
          setPendingPlatform(platform);
          setSocialSheetVisible(true);
        },
      })),
    });
  };

  const handleSocialLinkConfirm = (url: string) => {
    if (!pendingPlatform) {
      return;
    }
    setSocialLinks(prev => [
      ...prev,
      {
        id: `${pendingPlatform.id}-${Date.now()}`,
        platformId: pendingPlatform.id,
        label: pendingPlatform.label,
        icon: pendingPlatform.icon,
        url,
      },
    ]);
    setPendingPlatform(null);
  };

  const openSocialLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      showAlert({
        title: 'Could not open link',
        message: 'Check that the URL is valid.',
      });
    }
  };

  const addVehicle = (vehicleId: string) => {
    const option = VEHICLE_OPTIONS.find(v => v.id === vehicleId);
    if (!option) {
      return;
    }
    setVehicles(prev => {
      if (prev.some(v => v.id === vehicleId)) {
        return prev;
      }
      return [
        ...prev,
        {id: vehicleId, label: option.label, icon: option.icon},
      ];
    });
  };

  const handleAddVehicle = () => {
    const hasBike = vehicles.some(v => v.id === 'bike');
    const hasCar = vehicles.some(v => v.id === 'car');

    const options: {text: string; onPress: () => void}[] = [];
    if (!hasBike) {
      options.push({text: '🏍 Bike', onPress: () => addVehicle('bike')});
    }
    if (!hasCar) {
      options.push({text: '🚗 Car', onPress: () => addVehicle('car')});
    }
    if (!hasBike && !hasCar) {
      options.push({
        text: '🏍 + 🚗 Bike & Car',
        onPress: () => {
          addVehicle('bike');
          addVehicle('car');
        },
      });
    }

    if (options.length === 0) {
      showAlert({
        title: 'Vehicles added',
        message: 'You already added bike and car.',
      });
      return;
    }

    showChoice({
      title: 'Add vehicle',
      message: 'What do you have?',
      options,
    });
  };

  const handleAddProfession = () => {
    const used = new Set(professions.map(p => p.label));
    const available = PROFESSION_OPTIONS.filter(p => !used.has(p));

    if (available.length === 0) {
      showAlert({
        title: 'No more options',
        message: 'All profession options are already added.',
      });
      return;
    }

    showChoice({
      title: 'Add profession',
      message: 'Pick what best describes you',
      options: available.map(label => ({
        text: label,
        onPress: () =>
          setProfessions(prev => [
            ...prev,
            {id: `prof-${label}-${Date.now()}`, label},
          ]),
      })),
    });
  };

  const handleSave = () => {
    showAlert({
      title: 'Updated',
      message: 'Your profile details were saved.',
      onClose: () => navigation.navigate('UserProfile', {selectedDays}),
    });
  };

  return (
    <>
      <StatusBar backgroundColor={UI.bg} barStyle="dark-content" />

      <View style={styles.container}>
        <Pressable
          onPress={() => goBackSafe(navigation)}
          hitSlop={12}
          style={({pressed}) => pressed && styles.headerBtnPressed}>
          <Text style={styles.headerBack}>←</Text>
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>Set available time</Text>

          <View style={styles.timeBlock}>
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
            <Pressable onPress={handleAddSocial}>
              {({pressed}) => (
                <View
                  style={[
                    styles.addCircleBtn,
                    pressed && styles.addCircleBtnPressed,
                  ]}>
                  <Text style={styles.addCircleIcon}>+</Text>
                </View>
              )}
            </Pressable>
            <View style={styles.socialList}>
              {socialLinks.length === 0 ? (
                <Text style={styles.emptyHint}>
                  Add Instagram, Facebook, YouTube, or your website
                </Text>
              ) : (
                socialLinks.map(link => (
                  <Pressable
                    key={link.id}
                    style={styles.socialCard}
                    onPress={() => openSocialLink(link.url)}>
                    <View style={styles.socialCardText}>
                      <Text style={styles.socialCardTitle}>
                        {link.icon} {link.label}
                      </Text>
                      <Text style={styles.socialCardUrl} numberOfLines={1}>
                        {link.url}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        setSocialLinks(prev =>
                          prev.filter(item => item.id !== link.id),
                        )
                      }
                      hitSlop={10}
                      style={styles.socialRemoveHit}>
                      <Text style={styles.socialRemove}>×</Text>
                    </Pressable>
                  </Pressable>
                ))
              )}
            </View>
          </View>

          <Pressable
            style={styles.expandHeader}
            onPress={() => setVehicleExpanded(v => !v)}>
            <Text style={styles.expandTitle}>I have a Vehicle</Text>
            <Text style={styles.chevron}>{vehicleExpanded ? '∧' : '∨'}</Text>
          </Pressable>
          {vehicleExpanded ? (
            <View style={styles.expandBody}>
              <View style={styles.chipRow}>
                {vehicles.map(v => (
                  <RemovableChip
                    key={v.id}
                    label={`${v.icon ? `${v.icon} ` : ''}${v.label}`}
                    onRemove={() => removeChip(v.id, setVehicles)}
                  />
                ))}
              </View>
              <Pressable
                onPress={handleAddVehicle}
                style={({pressed}) => [
                  styles.addPillBtn,
                  pressed && styles.addPillBtnPressed,
                ]}>
                {({pressed}) => (
                  <Text
                    style={[
                      styles.addPillText,
                      pressed && styles.addPillTextPressed,
                    ]}>
                    + Add vehicle
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}

          <Pressable
            style={styles.expandHeader}
            onPress={() => setProfessionExpanded(v => !v)}>
            <Text style={styles.expandTitle}>I am</Text>
            <Text style={styles.chevron}>
              {professionExpanded ? '∧' : '∨'}
            </Text>
          </Pressable>
          {professionExpanded ? (
            <View style={styles.expandBody}>
              <View style={styles.chipRow}>
                {professions.map(p => (
                  <RemovableChip
                    key={p.id}
                    label={p.label}
                    onRemove={() => removeChip(p.id, setProfessions)}
                  />
                ))}
              </View>
              <Pressable
                onPress={handleAddProfession}
                style={({pressed}) => [
                  styles.addPillBtn,
                  pressed && styles.addPillBtnPressed,
                ]}>
                {({pressed}) => (
                  <Text
                    style={[
                      styles.addPillText,
                      pressed && styles.addPillTextPressed,
                    ]}>
                    + Add profession
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>About</Text>
          <TextInput
            style={styles.aboutInput}
            value={about}
            onChangeText={setAbout}
            multiline
            placeholder="Tell others about you"
            placeholderTextColor={UI.textHint}
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
            <Text style={styles.galleryPillText}>Gallery</Text>
            <Text style={styles.galleryPillIcon}>↻</Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Update</Text>
          </Pressable>
        </ScrollView>
      </View>

      <SocialLinkSheet
        visible={socialSheetVisible}
        platform={pendingPlatform}
        onClose={() => {
          setSocialSheetVisible(false);
          setPendingPlatform(null);
        }}
        onConfirm={handleSocialLinkConfirm}
      />
    </>
  );
};

export default ProfileUpdateMoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingTop: 48,
    paddingHorizontal: 18,
  },
  headerBack: {
    fontSize: 26,
    color: UI.text,
    marginBottom: 14,
  },
  headerBtnPressed: {
    opacity: 0.5,
  },
  scroll: {
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 12,
    marginTop: 6,
  },
  timeBlock: {
    backgroundColor: UI.cardMuted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  timeTo: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 14,
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
    backgroundColor: UI.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: UI.borderPill,
  },
  dayChipActive: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '700',
    color: UI.textMuted,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  addCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addCircleBtnPressed: {
    backgroundColor: UI.primaryPressed,
  },
  addCircleIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  socialList: {
    flex: 1,
    gap: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: UI.textHint,
    lineHeight: 18,
    paddingTop: 8,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: UI.borderInput,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 8,
  },
  socialCardText: {
    flex: 1,
    marginRight: 8,
  },
  socialCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.text,
    marginBottom: 2,
  },
  socialCardUrl: {
    fontSize: 12,
    color: UI.textMuted,
  },
  socialRemoveHit: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: UI.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialRemove: {
    fontSize: 18,
    color: UI.textMuted,
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
    color: UI.text,
  },
  chevron: {
    fontSize: 18,
    color: UI.textSecondary,
  },
  expandBody: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  addPillBtn: {
    alignSelf: 'flex-start',
    backgroundColor: UI.cardMuted,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addPillBtnPressed: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  addPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: UI.text,
  },
  addPillTextPressed: {
    color: '#FFFFFF',
  },
  aboutInput: {
    ...uiLayout.inputField,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 20,
  },
  galleryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.chip,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 32,
  },
  galleryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: UI.textSecondary,
    marginRight: 8,
  },
  galleryPillIcon: {
    fontSize: 14,
    color: UI.textMuted,
  },
  saveButton: {
    backgroundColor: UI.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonPressed: {
    backgroundColor: UI.primaryPressed,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
