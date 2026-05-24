import React, {useState} from 'react';
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

const FILTER_BADGE_COUNT = 2;

const AlertsScreen = () => {
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
      <StatusBar backgroundColor="#F9F9F7" barStyle="dark-content" />

      <View style={styles.header}>
        <BackButton
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Go to home"
        />

        <Text style={styles.headerTitle}>History and Transactions</Text>

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
            <Text style={styles.filterIcon}>☰</Text>
            {FILTER_BADGE_COUNT > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{FILTER_BADGE_COUNT}</Text>
              </View>
            ) : null}
          </View>
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
            <Text style={styles.pendingLabel}>
              {MOCK_PENDING_PAYMENTS.label}
            </Text>
            <Text style={styles.pendingCount}>
              {MOCK_PENDING_PAYMENTS.count} Pending
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
            <Text style={styles.payBtnText}>PAY</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#111111',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
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
    fontSize: 22,
    color: '#333333',
    fontWeight: '700',
    letterSpacing: -2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#111111',
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
  pendingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E5E5E5',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  pendingLeft: {
    flex: 1,
    marginRight: 12,
  },
  pendingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textTransform: 'lowercase',
  },
  pendingCount: {
    fontSize: 13,
    color: '#555555',
    marginTop: 4,
    fontWeight: '500',
  },
  payBtn: {
    backgroundColor: '#2A2A2A',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  payBtnPressed: {
    opacity: 0.88,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
