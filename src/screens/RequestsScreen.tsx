import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import RequestListCard from '../components/requests/RequestListCard';
import SentRequestCard from '../components/requests/SentRequestCard';
import PreviousContactsDrawer from '../components/requests/PreviousContactsDrawer';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {MainTabParamList} from '../navigation/MainTabNavigator';
import {useAppDialog} from '../context/DialogContext';
import BackButton from '../components/navigation/BackButton';
import {useTheme} from '../context/ThemeContext';

type SwipeTab = 'request' | 'sent';
type TabKey = SwipeTab | 'expired';
type ExpiredFilter = 'all' | 'sent' | 'received';

type RequestsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Requests'>,
  NativeStackNavigationProp<any>
>;

const {width: PAGE_WIDTH} = Dimensions.get('window');
const DRAWER_COLLAPSED = 168;

const RequestsScreen = () => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {showConfirm, showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RequestsNav>();
  const pagerRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('sent');
  const [swipeTab, setSwipeTab] = useState<SwipeTab>('sent');
  const [expiredFilter, setExpiredFilter] = useState<ExpiredFilter>('all');

  const received = useMateRequestsStore(s => s.received);
  const sent = useMateRequestsStore(s => s.sent);
  const archivedReceived = useMateRequestsStore(s => s.archivedReceived);
  const archivedSent = useMateRequestsStore(s => s.archivedSent);
  const cancelSentRequest = useMateRequestsStore(s => s.cancelSentRequest);

  const pendingReceived = received.filter(r => r.status === 'pending');
  const pendingSent = sent.filter(
    r => r.status === 'pending' || r.status === 'confirmed',
  );

  const previousContacts = useMemo(
    () => [...archivedSent, ...archivedReceived],
    [archivedSent, archivedReceived],
  );

  const expiredProfiles = useMemo(
    () => [
      ...archivedSent,
      ...archivedReceived,
      ...sent.filter(r => r.status === 'expired'),
      ...received.filter(r => r.status === 'expired'),
    ],
    [archivedSent, archivedReceived, sent, received],
  );
  const filteredExpiredProfiles = useMemo(() => {
    if (expiredFilter === 'all') {
      return expiredProfiles;
    }
    return expiredProfiles.filter(r => r.direction === expiredFilter);
  }, [expiredFilter, expiredProfiles]);
  const expiredCount = expiredProfiles.length;

  useEffect(() => {
    if (activeTab !== 'expired') {
      pagerRef.current?.scrollTo({
        x: swipeTab === 'sent' ? PAGE_WIDTH : 0,
        animated: false,
      });
    }
  }, []);

  const goToSwipeTab = (tab: SwipeTab) => {
    setActiveTab(tab);
    setSwipeTab(tab);
    pagerRef.current?.scrollTo({
      x: tab === 'request' ? 0 : PAGE_WIDTH,
      animated: true,
    });
  };

  const onPagerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    const tab: SwipeTab = index === 0 ? 'request' : 'sent';
    setSwipeTab(tab);
    setActiveTab(tab);
  };

  const openReceivedDetail = (requestId: string) => {
    navigation.getParent()?.navigate('ReceivedRequestDetail', {requestId});
  };

  const openSentDetail = (requestId: string) => {
    navigation.getParent()?.navigate('SentRequestDetail', {requestId});
  };

  const handleCancelSent = (id: string, name: string) => {
    showConfirm({
      title: 'Cancel request',
      message: `Cancel your mate request to ${name}?`,
      confirmText: 'Cancel request',
      onConfirm: () => {
        cancelSentRequest(id);
        showAlert({
          title: 'Request cancelled',
          message: 'Your request was withdrawn.',
        });
      },
    });
  };

  const renderSwipePage = (tab: SwipeTab) => (
    <View style={[styles.page, {width: PAGE_WIDTH}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.pageScroll,
          {paddingBottom: DRAWER_COLLAPSED + 24},
        ]}>
        {tab === 'request' ? (
          pendingReceived.length === 0 ? (
            <Text style={styles.emptyText}>No incoming requests right now.</Text>
          ) : (
            pendingReceived.map(req => (
              <RequestListCard
                key={req.id}
                request={req}
                statusText="Pending"
                actionText="Review"
                onPress={() => openReceivedDetail(req.id)}
                onActionPress={() => openReceivedDetail(req.id)}
              />
            ))
          )
        ) : pendingSent.length === 0 ? (
          <Text style={styles.emptyText}>
            No sent requests yet. Open a mate profile to send one.
          </Text>
        ) : (
          pendingSent.map(req => (
            <SentRequestCard
              key={req.id}
              request={req}
              onPress={() => openSentDetail(req.id)}
              onCancel={() => handleCancelSent(req.id, req.mateName)}
            />
          ))
        )}
      </ScrollView>

    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top + 8}]}>

      <View style={styles.header}>
        <BackButton
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Go to home"
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Requests</Text>
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>
              {pendingReceived.length + pendingSent.length} active
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.segmentWrap}>
        <Pressable
          style={[
            styles.segmentBtn,
            (activeTab === 'request' || swipeTab === 'request') &&
              activeTab !== 'expired' &&
              styles.segmentBtnActive,
          ]}
          onPress={() => goToSwipeTab('request')}>
          <Text
            style={[
              styles.segmentText,
              (activeTab === 'request' || swipeTab === 'request') &&
                activeTab !== 'expired' &&
                styles.segmentTextActive,
            ]}>
            Incoming
          </Text>
          <View style={styles.segmentCount}>
            <Text style={styles.segmentCountText}>{pendingReceived.length}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.segmentBtn,
            (activeTab === 'sent' || swipeTab === 'sent') &&
              activeTab !== 'expired' &&
              styles.segmentBtnActive,
          ]}
          onPress={() => goToSwipeTab('sent')}>
          <Text
            style={[
              styles.segmentText,
              (activeTab === 'sent' || swipeTab === 'sent') &&
                activeTab !== 'expired' &&
                styles.segmentTextActive,
            ]}>
            Sent
          </Text>
          <View style={styles.segmentCount}>
            <Text style={styles.segmentCountText}>{pendingSent.length}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.segmentBtn,
            activeTab === 'expired' && styles.segmentBtnExpiredActive,
          ]}
          onPress={() => setActiveTab('expired')}>
          <Text
            style={[
              styles.segmentText,
              activeTab === 'expired'
                ? styles.segmentTextExpiredActive
                : styles.segmentTextExpired,
            ]}>
            Expired
          </Text>
          <View
            style={[
              styles.segmentCount,
              activeTab === 'expired' && styles.segmentCountExpired,
            ]}>
            <Text
              style={[
                styles.segmentCountText,
                activeTab === 'expired' && styles.segmentCountTextExpired,
              ]}>
              {expiredCount}
            </Text>
          </View>
        </Pressable>
      </View>

      {activeTab === 'expired' ? (
        <View style={styles.expiredBody}>
          <View style={styles.expiredFilterRow}>
            <Pressable
              style={[
                styles.expiredFilterBtn,
                expiredFilter === 'all' && styles.expiredFilterBtnActive,
              ]}
              onPress={() => setExpiredFilter('all')}>
              <Text
                style={[
                  styles.expiredFilterText,
                  expiredFilter === 'all' && styles.expiredFilterTextActive,
                ]}>
                All ({expiredProfiles.length})
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.expiredFilterBtn,
                expiredFilter === 'sent' && styles.expiredFilterBtnActive,
              ]}
              onPress={() => setExpiredFilter('sent')}>
              <Text
                style={[
                  styles.expiredFilterText,
                  expiredFilter === 'sent' && styles.expiredFilterTextActive,
                ]}>
                Sent ({expiredProfiles.filter(r => r.direction === 'sent').length})
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.expiredFilterBtn,
                expiredFilter === 'received' && styles.expiredFilterBtnActive,
              ]}
              onPress={() => setExpiredFilter('received')}>
              <Text
                style={[
                  styles.expiredFilterText,
                  expiredFilter === 'received' &&
                    styles.expiredFilterTextActive,
                ]}>
                Received ({expiredProfiles.filter(r => r.direction === 'received').length})
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pageScroll}>
            {filteredExpiredProfiles.length === 0 ? (
              <Text style={styles.emptyText}>No expired profiles yet.</Text>
            ) : (
              filteredExpiredProfiles.map(req => (
                <RequestListCard
                  key={req.id}
                  request={req}
                  statusText="Expired"
                  subtitle={
                    req.expiresInDays
                      ? `Expired in ${req.expiresInDays} days`
                      : req.categoryLabel
                  }
                />
              ))
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onPagerScrollEnd}
          scrollEventThrottle={16}
          style={styles.pager}>
          {renderSwipePage('request')}
          {renderSwipePage('sent')}
        </ScrollView>
      )}

      {activeTab !== 'expired' ? (
        <PreviousContactsDrawer contacts={previousContacts} />
      ) : null}
    </View>
  );
};

export default RequestsScreen;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: c.text,
  },
  headerCount: {
    backgroundColor: c.chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerCountText: {
    color: c.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  segmentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: c.bgElevated,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    padding: 4,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  segmentBtnActive: {
    backgroundColor: c.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
  },
  segmentBtnExpiredActive: {
    backgroundColor: c.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.danger,
  },
  segmentText: {
    fontSize: 13,
    color: c.textHint,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: c.brand,
    fontWeight: '800',
  },
  segmentTextExpired: {
    color: c.danger,
    fontWeight: '700',
  },
  segmentTextExpiredActive: {
    color: c.danger,
    fontWeight: '800',
  },
  segmentCount: {
    minWidth: 22,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentCountExpired: {
    backgroundColor: 'rgba(192,57,43,0.12)',
  },
  segmentCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textSecondary,
  },
  segmentCountTextExpired: {
    color: c.danger,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  expiredBody: {
    flex: 1,
  },
  expiredFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  expiredFilterBtn: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  expiredFilterBtnActive: {
    borderColor: c.brand,
    backgroundColor: c.bg,
  },
  expiredFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textMuted,
  },
  expiredFilterTextActive: {
    color: c.brand,
  },
  pageScroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 15,
    color: c.textMuted,
    textAlign: 'center',
    marginTop: 34,
    lineHeight: 22,
  },
});
