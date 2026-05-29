import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import HistoryAlertRow from '../components/alerts/HistoryAlertRow';
import {
  MOCK_HISTORY_ALERTS,
  MOCK_PENDING_PAYMENTS,
} from '../data/mockHistoryAlerts';
import {MainTabParamList} from '../navigation/MainTabNavigator';
import {useAppDialog} from '../context/DialogContext';
import BackButton from '../components/navigation/BackButton';
import {useTheme} from '../context/ThemeContext';

const AlertsScreen = () => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [filterActive, setFilterActive] = useState(false);

  const visibleAlerts = filterActive
    ? MOCK_HISTORY_ALERTS.filter(
        a =>
          a.kind === 'payment_sent' ||
          a.kind === 'payment_received' ||
          a.kind === 'payment_canceled',
      )
    : MOCK_HISTORY_ALERTS;

  return (
    <View style={[styles.container, {paddingTop: insets.top + 8}]}>

      <View style={styles.header}>
        <BackButton
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Go to home"
        />

        <Text style={styles.headerTitle}>Alerts</Text>

        <Pressable
          style={styles.headerSide}
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
            {filterActive ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </View>

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
        <View style={styles.pendingBar}>
          <View style={styles.pendingLeft}>
            <Text style={styles.pendingLabel}>Pending payments</Text>
            <Text style={styles.pendingCount}>
              {MOCK_PENDING_PAYMENTS.count} cancellation(s) to complete
            </Text>
          </View>
          <Pressable
            style={({pressed}) => [
              styles.payBtn,
              pressed && styles.payBtnPressed,
            ]}
            onPress={() =>
              showAlert({
                title: 'Pending payments',
                message: `You have ${MOCK_PENDING_PAYMENTS.count} canceled payment(s) to complete.`,
              })
            }>
            <Text style={styles.payBtnText}>Pay now</Text>
          </Pressable>
        </View>

        {visibleAlerts.map(alert => (
          <HistoryAlertRow
            key={alert.id}
            alert={alert}
            onFeedback={() =>
              showAlert({
                title: 'Feedback',
                message: `Share feedback about: "${alert.message}"`,
              })
            }
          />
        ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: c.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: c.text,
    textAlign: 'center',
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
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
  pendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  pendingLeft: {
    flex: 1,
    marginRight: 12,
  },
  pendingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.text,
  },
  pendingCount: {
    fontSize: 12,
    color: c.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  payBtn: {
    backgroundColor: c.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  payBtnPressed: {
    opacity: 0.88,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
