import React, {useCallback, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BackButton from '../components/navigation/BackButton';
import SettingsRow from '../components/settings/SettingsRow';
import {appDialog} from '../context/dialogRef';
import {goBackSafe} from '../navigation/navigationActions';
import {setAccountDeactivated} from '../utils/accountStatusStorage';
import {resetToLogin} from '../utils/authNavigation';

type Nav = NativeStackNavigationProp<{
  AccountStatus: undefined;
  SettingsDetail: {itemId: 'help-support'};
}>;

const AccountStatusScreen = ({navigation}: {navigation: Nav}) => {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const confirmDeactivate = useCallback(() => {
    appDialog.showConfirm({
      title: 'Deactivate your account?',
      message:
        'Your profile will be hidden from search and you will not receive new requests. You can sign back in anytime to reactivate.',
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        if (busy) {
          return;
        }
        setBusy(true);
        try {
          await setAccountDeactivated(true);
          await resetToLogin(navigation);
        } finally {
          setBusy(false);
        }
      },
    });
  }, [busy, navigation]);

  const confirmDelete = useCallback(() => {
    appDialog.showConfirm({
      title: 'Delete account permanently?',
      message:
        'This removes your Tenure account and profile data after processing. This cannot be undone.',
      confirmText: 'Delete account',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        if (busy) {
          return;
        }
        setBusy(true);
        try {
          await setAccountDeactivated(false);
          await resetToLogin(navigation);
        } finally {
          setBusy(false);
        }
      },
    });
  }, [busy, navigation]);

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
      <View style={styles.header}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <Text style={styles.title}>Account status</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 32},
        ]}>
        <Text style={styles.lead}>
          Take a break or leave Tenure. Deactivating is reversible; deleting is
          permanent.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temporary</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Deactivate account"
              onPress={confirmDeactivate}
              isLast
            />
          </View>
          <Text style={styles.note}>
            Hides your passport from requesters and pauses new requests. Sign in
            again to reactivate.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permanent</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Delete account"
              danger
              onPress={confirmDelete}
              isLast
            />
          </View>
          <Text style={styles.noteDanger}>
            Deletes your account after confirmation. Use deactivate if you only
            need a pause.
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('SettingsDetail', {itemId: 'help-support'})}
          style={({pressed}) => [styles.helpLink, pressed && styles.pressed]}>
          <Text style={styles.helpLinkText}>
            Need help? Visit Help & Support
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default AccountStatusScreen;

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
  headerSpacer: {width: 42},
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 20,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {gap: 8},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  note: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    paddingHorizontal: 4,
  },
  noteDanger: {
    fontSize: 13,
    lineHeight: 19,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  helpLink: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  helpLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064B63',
  },
  pressed: {opacity: 0.78},
});
