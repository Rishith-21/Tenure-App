import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAppDialog} from '../context/DialogContext';
import {useTheme} from '../context/ThemeContext';
import ScreenHeader from '../components/navigation/ScreenHeader';

const AlertsScreen = () => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const [filterActive, setFilterActive] = useState(false);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Alerts"
        right={
          <Pressable
            onPress={() => {
              setFilterActive(v => !v);
              showAlert({
                title: filterActive ? 'All activity' : 'Payments only',
                message: filterActive
                  ? 'Showing all history items.'
                  : 'Filtered to payment-related alerts.',
              });
            }}
            hitSlop={8}>
            <View style={styles.filterWrap}>
              <Text style={styles.filterIcon}>≡</Text>
            </View>
          </Pressable>
        }
      />

      <View style={styles.filterPillsRow}>
        <Pressable
          style={[
            styles.filterPill,
            !filterActive && styles.filterPillActive,
          ]}
          onPress={() => setFilterActive(false)}>
          <Text
            style={[
              styles.filterPillText,
              !filterActive && styles.filterPillTextActive,
            ]}>
            All activity
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterPill,
            filterActive && styles.filterPillActive,
          ]}
          onPress={() => setFilterActive(true)}>
          <Text
            style={[
              styles.filterPillText,
              filterActive && styles.filterPillTextActive,
            ]}>
            Payments only
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {paddingBottom: insets.bottom + 100},
        ]}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>All quiet for now</Text>
          <Text style={styles.emptyBody}>
            Request updates, payments, and session alerts will appear here once
            you start using Tenure.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AlertsScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  filterWrap: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: c.textSecondary,
    fontWeight: '700',
    letterSpacing: -1,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: c.bgElevated,
  },
  filterPillActive: {
    backgroundColor: c.bg,
    borderColor: c.brand,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textMuted,
  },
  filterPillTextActive: {
    color: c.brand,
  },
  emptyWrap: {
    marginTop: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: c.text,
    letterSpacing: -0.3,
  },
  emptyBody: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: c.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
});
