import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BackButton from '../components/navigation/BackButton';
import {
  resolveSettingsNavigation,
  settingsItemTitle,
  SettingsItemId,
} from '../constants/settingsMenu';
import {goBackSafe} from '../navigation/navigationActions';
import {useTheme} from '../context/ThemeContext';
import {useAppDialog} from '../context/DialogContext';
import {
  fetchProfile,
  upsertProfile,
  changePassword,
  fetchBlockedUsers,
  unblockUser,
  submitReport,
  BlockedUserApi,
  BackendProfile,
} from '../utils/api';

type Props = {
  navigation: NativeStackNavigationProp<{
    SettingsDetail: {itemId?: SettingsItemId};
    AccountStatus: undefined;
    UserProfile: undefined;
  }>;
  route: {params?: {itemId?: SettingsItemId}};
};

const SettingsDetailScreen = ({navigation, route}: Props) => {
  const insets = useSafeAreaInsets();
  const itemId = route.params?.itemId;
  const {colors} = useTheme();
  const {showAlert, showConfirm} = useAppDialog();

  const title = useMemo(
    () => (itemId ? settingsItemTitle(itemId) : 'Settings'),
    [itemId],
  );

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BackendProfile | null>(null);

  // Forms states
  // 1. Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2. Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // 3. Blocked Users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserApi[]>([]);

  // 4. Report Problem
  const [reportCategory, setReportCategory] = useState('bug');
  const [reportMessage, setReportMessage] = useState('');

  // 5. General toggles & settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [notifyRequests, setNotifyRequests] = useState(true);
  const [notifyChat, setNotifyChat] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);

  // 6. Language selector
  const [appLanguage, setAppLanguage] = useState('English');

  // Load necessary data based on itemId
  const loadData = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      if (
        itemId === 'profile-visibility' ||
        itemId === 'emergency-contact' ||
        itemId === 'notifications-requests' ||
        itemId === 'notifications-chat' ||
        itemId === 'notifications-reminders' ||
        itemId === 'verification'
      ) {
        const fetchedProfile = await fetchProfile();
        if (fetchedProfile) {
          setProfile(fetchedProfile);
          setProfileVisibility(fetchedProfile.profileVisibility);
          setNotifyRequests(fetchedProfile.notifyRequests);
          setNotifyChat(fetchedProfile.notifyChat);
          setNotifyReminders(fetchedProfile.notifyReminders);
          setEmergencyName(fetchedProfile.emergencyName || '');
          setEmergencyPhone(fetchedProfile.emergencyPhone || '');
          setEmergencyRelation(fetchedProfile.emergencyRelation || '');
        }
      } else if (itemId === 'blocked-users') {
        const users = await fetchBlockedUsers();
        setBlockedUsers(users);
      }
    } catch (err: any) {
      console.log('Error loading setting details:', err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!itemId) {
      return;
    }
    if (resolveSettingsNavigation(itemId) === 'account-status') {
      navigation.replace('AccountStatus');
    }
  }, [itemId, navigation]);

  if (
    itemId &&
    (itemId === 'delete-account' || itemId === 'deactivate-account')
  ) {
    return null;
  }

  // --- SUBMIT ACTIONS ---
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({title: 'Validation Error', message: 'All password fields are required.'});
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({title: 'Validation Error', message: 'New passwords do not match.'});
      return;
    }
    if (newPassword.length < 8) {
      showAlert({title: 'Validation Error', message: 'New password must be at least 8 characters long.'});
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      showAlert({title: 'Success', message: 'Password has been updated successfully.'});
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showAlert({title: 'Error', message: err?.message || 'Failed to update password.'});
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmergencyContact = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const updated = await upsertProfile({
        fullName: profile.fullName,
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '2000-01-01',
        gender: profile.gender || 'male',
        country: profile.country,
        state: profile.state,
        district: profile.district,
        pinCode: profile.pinCode,
        languages: profile.languages,
        emergencyName: emergencyName.trim(),
        emergencyPhone: emergencyPhone.trim(),
        emergencyRelation: emergencyRelation.trim(),
      });
      setProfile(updated);
      showAlert({title: 'Success', message: 'Emergency contact details updated.'});
    } catch (err: any) {
      showAlert({title: 'Error', message: err?.message || 'Failed to save emergency contact.'});
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (val: boolean) => {
    if (!profile) return;
    setProfileVisibility(val);
    try {
      const updated = await upsertProfile({
        fullName: profile.fullName,
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '2000-01-01',
        gender: profile.gender || 'male',
        country: profile.country,
        state: profile.state,
        district: profile.district,
        pinCode: profile.pinCode,
        languages: profile.languages,
        profileVisibility: val,
      });
      setProfile(updated);
    } catch (err: any) {
      setProfileVisibility(!val); // revert
      showAlert({title: 'Error', message: err?.message || 'Failed to update visibility.'});
    }
  };

  const toggleNotification = async (field: 'requests' | 'chat' | 'reminders', val: boolean) => {
    if (!profile) return;
    if (field === 'requests') setNotifyRequests(val);
    if (field === 'chat') setNotifyChat(val);
    if (field === 'reminders') setNotifyReminders(val);

    try {
      const updated = await upsertProfile({
        fullName: profile.fullName,
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '2000-01-01',
        gender: profile.gender || 'male',
        country: profile.country,
        state: profile.state,
        district: profile.district,
        pinCode: profile.pinCode,
        languages: profile.languages,
        notifyRequests: field === 'requests' ? val : notifyRequests,
        notifyChat: field === 'chat' ? val : notifyChat,
        notifyReminders: field === 'reminders' ? val : notifyReminders,
      });
      setProfile(updated);
    } catch (err: any) {
      // Revert
      if (field === 'requests') setNotifyRequests(!val);
      if (field === 'chat') setNotifyChat(!val);
      if (field === 'reminders') setNotifyReminders(!val);
      showAlert({title: 'Error', message: err?.message || 'Failed to update preferences.'});
    }
  };

  const handleUnblockUser = (blockedId: string, name: string) => {
    showConfirm({
      title: 'Unblock user',
      message: `Unblock ${name}? They will be able to search and message you again.`,
      confirmText: 'Unblock',
      onConfirm: async () => {
        setLoading(true);
        try {
          await unblockUser(blockedId);
          setBlockedUsers(prev => prev.filter(u => u.userId !== blockedId));
          showAlert({title: 'Success', message: `${name} has been unblocked.`});
        } catch (err: any) {
          showAlert({title: 'Error', message: err?.message || 'Failed to unblock user.'});
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSubmitProblem = async () => {
    if (!reportMessage.trim()) {
      showAlert({title: 'Validation Error', message: 'Please describe the problem.'});
      return;
    }
    setLoading(true);
    try {
      await submitReport(reportCategory, reportMessage.trim());
      showAlert({title: 'Thank You', message: 'Your report has been submitted. Our support team will review it.'});
      setReportMessage('');
    } catch (err: any) {
      showAlert({title: 'Error', message: err?.message || 'Failed to submit report.'});
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW RENDERING ---

  const renderContent = () => {
    if (loading && !profile && blockedUsers.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#064B63" />
        </View>
      );
    }

    switch (itemId) {
      case 'change-password':
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Current Password</Text>
            <TextInput
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.sectionLabel}>New Password</Text>
            <TextInput
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.sectionLabel}>Confirm New Password</Text>
            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              style={({pressed}) => [styles.submitBtn, pressed && styles.pressed]}
              onPress={handleUpdatePassword}>
              <Text style={styles.submitBtnText}>Update Password</Text>
            </Pressable>
          </View>
        );

      case 'profile-visibility':
        return (
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.rowTitle}>Public Profile Visibility</Text>
                <Text style={styles.rowSubtitle}>
                  Allow other users to discover your profile in searches.
                </Text>
              </View>
              <Switch
                value={profileVisibility}
                onValueChange={toggleVisibility}
                trackColor={{true: '#064B63', false: '#D1D5DB'}}
              />
            </View>
          </View>
        );

      case 'verification':
        const isVerified = profile?.aadhaarVerified;
        return (
          <View style={[styles.sectionCard, styles.centerAlign]}>
            <Text style={styles.badgeIcon}>{isVerified ? '✅' : '⚠️'}</Text>
            <Text style={styles.rowTitle}>
              {isVerified ? 'Profile Verified' : 'Verification Pending'}
            </Text>
            <Text style={styles.verificationDesc}>
              {isVerified
                ? `Your identity is verified using Aadhaar Card (${profile?.aadhaarMasked}). This builds trust within the Tenure community.`
                : 'To unlock complete privileges and list your profile as a companion, complete Aadhaar validation on your Profile Screen.'}
            </Text>
            {!isVerified && (
              <Pressable
                style={styles.actionLink}
                onPress={() => navigation.navigate('UserProfile')}>
                <Text style={styles.actionLinkText}>Go to Profile to Verify</Text>
              </Pressable>
            )}
          </View>
        );

      case 'emergency-contact':
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Contact Name</Text>
            <TextInput
              value={emergencyName}
              onChangeText={setEmergencyName}
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.sectionLabel}>Relation</Text>
            <TextInput
              value={emergencyRelation}
              onChangeText={setEmergencyRelation}
              style={styles.input}
              placeholder="e.g. Mother, Spouse, Friend"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.sectionLabel}>Phone Number</Text>
            <TextInput
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="Emergency Mobile Number"
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              style={({pressed}) => [styles.submitBtn, pressed && styles.pressed]}
              onPress={handleSaveEmergencyContact}>
              <Text style={styles.submitBtnText}>Save Contact</Text>
            </Pressable>
          </View>
        );

      case 'blocked-users':
        if (blockedUsers.length === 0) {
          return (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No blocked users yet.</Text>
            </View>
          );
        }
        return (
          <FlatList
            data={blockedUsers}
            keyExtractor={item => item.userId}
            renderItem={({item}) => (
              <View style={styles.blockedUserCard}>
                <View style={styles.blockedUserLeft}>
                  <Text style={styles.blockedUserName}>
                    {item.fullName || item.name || 'Anonymous'}
                  </Text>
                  <Text style={styles.blockedUserSub}>
                    ID: {item.tenureId || 'Pending'}
                  </Text>
                </View>
                <Pressable
                  style={styles.unblockBtn}
                  onPress={() => handleUnblockUser(item.userId, item.fullName || 'User')}>
                  <Text style={styles.unblockBtnText}>Unblock</Text>
                </Pressable>
              </View>
            )}
          />
        );

      case 'report-problem':
        return (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Problem Category</Text>
            <View style={styles.categoryRow}>
              {['bug', 'safety', 'abuse', 'other'].map(cat => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    reportCategory === cat && styles.categoryChipSelected,
                  ]}
                  onPress={() => setReportCategory(cat)}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      reportCategory === cat && styles.categoryChipTextSelected,
                    ]}>
                    {cat.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput
              multiline
              numberOfLines={6}
              value={reportMessage}
              onChangeText={setReportMessage}
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue you are experiencing..."
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              style={({pressed}) => [styles.submitBtn, pressed && styles.pressed]}
              onPress={handleSubmitProblem}>
              <Text style={styles.submitBtnText}>Submit Report</Text>
            </Pressable>
          </View>
        );

      case 'notifications-requests':
      case 'notifications-chat':
      case 'notifications-reminders':
        return (
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.rowTitle}>Requests Notifications</Text>
                <Text style={styles.rowSubtitle}>
                  Receive alerts when a request is sent, accepted, or canceled.
                </Text>
              </View>
              <Switch
                value={notifyRequests}
                onValueChange={val => toggleNotification('requests', val)}
                trackColor={{true: '#064B63', false: '#D1D5DB'}}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.rowTitle}>Chat Messages</Text>
                <Text style={styles.rowSubtitle}>
                  Get real-time push alerts for new chat conversation messages.
                </Text>
              </View>
              <Switch
                value={notifyChat}
                onValueChange={val => toggleNotification('chat', val)}
                trackColor={{true: '#064B63', false: '#D1D5DB'}}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.rowTitle}>System Reminders</Text>
                <Text style={styles.rowSubtitle}>
                  Get reminded about active meets, session limits, or security updates.
                </Text>
              </View>
              <Switch
                value={notifyReminders}
                onValueChange={val => toggleNotification('reminders', val)}
                trackColor={{true: '#064B63', false: '#D1D5DB'}}
              />
            </View>
          </View>
        );

      case 'wallet':
      case 'earnings':
      case 'transactions':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.walletCard}>
              <Text style={styles.walletTitle}>Total Balance</Text>
              <Text style={styles.walletAmount}>₹1,450.00</Text>
              <View style={styles.walletRow}>
                <View>
                  <Text style={styles.walletSub}>Earnings (This Month)</Text>
                  <Text style={styles.walletSubVal}>₹3,840.00</Text>
                </View>
                <View>
                  <Text style={styles.walletSub}>Payouts</Text>
                  <Text style={styles.walletSubVal}>₹2,390.00</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitleHeader}>Recent Transactions</Text>
            <View style={styles.sectionCard}>
              {[
                {id: '1', title: 'Session Fee Received', date: '26 Jun 2026', amount: '+₹420.00', status: 'completed'},
                {id: '2', title: 'Withdrawal to UPI', date: '22 Jun 2026', amount: '-₹1,000.00', status: 'completed'},
                {id: '3', title: 'Session Fee Paid', date: '19 Jun 2026', amount: '-₹180.00', status: 'completed'},
                {id: '4', title: 'Platform Bonus', date: '15 Jun 2026', amount: '+₹50.00', status: 'completed'},
              ].map(t => (
                <View key={t.id} style={styles.transactionRow}>
                  <View>
                    <Text style={styles.transactionTitle}>{t.title}</Text>
                    <Text style={styles.transactionDate}>{t.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmt,
                      t.amount.startsWith('+') ? {color: '#10B981'} : {color: '#EF4444'},
                    ]}>
                    {t.amount}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'language':
        return (
          <View style={styles.sectionCard}>
            {['English', 'Hindi (हिन्दी)', 'Kannada (ಕನ್ನಡ)', 'Tamil (தமிழ்)'].map(lang => (
              <Pressable
                key={lang}
                style={styles.languageRow}
                onPress={() => setAppLanguage(lang.split(' ')[0])}>
                <Text
                  style={[
                    styles.languageText,
                    appLanguage === lang.split(' ')[0] && {color: '#064B63', fontWeight: '700'},
                  ]}>
                  {lang}
                </Text>
                {appLanguage === lang.split(' ')[0] && <Text style={styles.checkIcon}>✓</Text>}
              </Pressable>
            ))}
          </View>
        );

      case 'help-support':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitleHeader}>Frequently Asked Questions</Text>
            {[
              {
                q: 'How does billing work?',
                a: 'Billing is calculated per-minute based on the hourly rate specified in the mate request. Time only starts counting after the requester enters the 4-digit verification OTP provided by the companion.',
              },
              {
                q: 'What is a break?',
                a: 'If you want to temporarily pause a meet session (e.g. entering a cinema or resting), you can request a break. Once confirmed by your mate, billing pauses until you request to resume and they confirm.',
              },
              {
                q: 'Are my location details shared?',
                a: 'No. Location sharing is only used to display active companion maps during meets for safety. Your raw address is never made public.',
              },
            ].map((faq, i) => (
              <View key={i} style={styles.faqCard}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqA}>{faq.a}</Text>
              </View>
            ))}

            <Pressable
              style={styles.contactSupportBtn}
              onPress={() => showAlert({title: 'Contact Support', message: 'You can email us at support@tenure.app'})}>
              <Text style={styles.contactSupportBtnText}>Email Support Team</Text>
            </Pressable>
          </ScrollView>
        );

      case 'terms':
        return (
          <ScrollView style={styles.sectionCard} showsVerticalScrollIndicator={false}>
            <Text style={styles.termsText}>
              Welcome to Tenure. By using our mobile application, you agree to comply with and be bound by the following terms and conditions.
              {"\n\n"}
              1. User Verification: Users listing as mates/companions must provide accurate identification (Aadhaar validation). Misrepresentation will lead to instant account ban.
              {"\n\n"}
              2. Safe Engagement: All meets must be in public places as coordinates verify. Tenure does not tolerate private or unsafe arrangements.
              {"\n\n"}
              3. Fees & Platform Commission: Platform charges a set commission on all completed sessions. Payouts are made within 48 hours.
            </Text>
          </ScrollView>
        );

      case 'privacy-policy':
        return (
          <ScrollView style={styles.sectionCard} showsVerticalScrollIndicator={false}>
            <Text style={styles.termsText}>
              Tenure values your privacy. This policy outlines how we gather, store, and process your data.
              {"\n\n"}
              - Data Collection: We collect location coords, phone, name, dob, profile pictures, and transaction details to ensure safe meets.
              {"\n\n"}
              - Information Security: Your Aadhaar details are fully encrypted and only used for validation check. The raw numbers are masked.
              {"\n\n"}
              - Third-party Services: Payment details are securely handled by compliant gateway integration networks.
            </Text>
          </ScrollView>
        );

      default:
        return (
          <View style={styles.body}>
            <Text style={styles.hint}>
              This screen is ready for {title.toLowerCase()} — wire your flow here.
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <View style={styles.header}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>{renderContent()}</View>
    </View>
  );
};

export default SettingsDetailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 42,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  centerAlign: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#064B63',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  verificationDesc: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  actionLink: {
    paddingVertical: 8,
  },
  actionLinkText: {
    color: '#064B63',
    fontSize: 15,
    fontWeight: '700',
  },
  blockedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  blockedUserLeft: {
    flex: 1,
  },
  blockedUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  blockedUserSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  unblockBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unblockBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: '#E6F0F2',
    borderColor: '#064B63',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryChipTextSelected: {
    color: '#064B63',
  },
  walletCard: {
    backgroundColor: '#064B63',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  walletTitle: {
    color: '#E6F0F2',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 20,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletSub: {
    color: '#A0C3CD',
    fontSize: 11,
    fontWeight: '600',
  },
  walletSubVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitleHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  transactionDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionAmt: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  languageText: {
    fontSize: 15,
    color: '#374151',
  },
  checkIcon: {
    color: '#064B63',
    fontSize: 18,
    fontWeight: '700',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  faqA: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 6,
  },
  contactSupportBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#064B63',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  contactSupportBtnText: {
    color: '#064B63',
    fontSize: 15,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
});
