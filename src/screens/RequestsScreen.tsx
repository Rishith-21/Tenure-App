import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
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

type SwipeTab = 'request' | 'sent';
type TabKey = SwipeTab | 'expired';

type RequestsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Requests'>,
  NativeStackNavigationProp<any>
>;

const {width: PAGE_WIDTH} = Dimensions.get('window');
const DRAWER_COLLAPSED = 168;

const RequestsScreen = () => {
  const {showConfirm, showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RequestsNav>();
  const pagerRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('sent');
  const [swipeTab, setSwipeTab] = useState<SwipeTab>('sent');

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
    () => [...archivedSent, ...sent.filter(r => r.status === 'expired')],
    [archivedSent, sent],
  );

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
            <Text style={styles.emptyText}>No new requests right now.</Text>
          ) : (
            pendingReceived.map(req => (
              <RequestListCard
                key={req.id}
                request={req}
                onPress={() => openReceivedDetail(req.id)}
              />
            ))
          )
        ) : pendingSent.length === 0 ? (
          <Text style={styles.emptyText}>
            No pending sent requests. Send one from a mate profile.
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

      <PreviousContactsDrawer contacts={previousContacts} />
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top + 8}]}>
      <StatusBar backgroundColor="#F9F9F7" barStyle="dark-content" />

      <View style={styles.header}>
        <BackButton
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Go to home"
        />
        <Text style={styles.headerTitle}>Requests</Text>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={styles.tabItem}
          onPress={() => goToSwipeTab('request')}>
          <Text
            style={[
              styles.tabText,
              (activeTab === 'request' || swipeTab === 'request') &&
                activeTab !== 'expired' &&
                styles.tabTextActive,
            ]}>
            request
          </Text>
          {swipeTab === 'request' && activeTab !== 'expired' ? (
            <View style={styles.tabLine} />
          ) : null}
        </Pressable>

        <Pressable style={styles.tabItem} onPress={() => goToSwipeTab('sent')}>
          <Text
            style={[
              styles.tabText,
              (activeTab === 'sent' || swipeTab === 'sent') &&
                activeTab !== 'expired' &&
                styles.tabTextActive,
            ]}>
            sent
          </Text>
          {swipeTab === 'sent' && activeTab !== 'expired' ? (
            <View style={[styles.tabLine, styles.tabLineSent]} />
          ) : null}
        </Pressable>

        <Pressable
          style={[styles.tabItem, styles.tabItemExpired]}
          onPress={() => setActiveTab('expired')}>
          <Text
            style={[
              styles.tabTextExpired,
              activeTab === 'expired' && styles.tabTextExpiredActive,
            ]}
            numberOfLines={1}>
            {expiredProfiles.length} expired profiles
          </Text>
          {activeTab === 'expired' ? (
            <View style={[styles.tabLine, styles.tabLineExpired]} />
          ) : null}
        </Pressable>
      </View>

      {activeTab === 'expired' ? (
        <View style={styles.expiredBody}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.pageScroll,
              {paddingBottom: DRAWER_COLLAPSED + 24},
            ]}>
            {expiredProfiles.length === 0 ? (
              <Text style={styles.emptyText}>No expired profiles yet.</Text>
            ) : (
              expiredProfiles.map(req => (
                <RequestListCard
                  key={req.id}
                  request={req}
                  subtitle={
                    req.expiresInDays
                      ? `Expired in ${req.expiresInDays} days`
                      : req.categoryLabel
                  }
                />
              ))
            )}
          </ScrollView>
          <PreviousContactsDrawer contacts={previousContacts} />
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
    </View>
  );
};

export default RequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
  },
  backArrow: {
    fontSize: 28,
    color: '#111111',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
    flex: 1,
    textAlign: 'right',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tabItem: {
    marginRight: 20,
    alignItems: 'center',
    maxWidth: 90,
  },
  tabItemExpired: {
    flex: 1,
    marginRight: 0,
    alignItems: 'flex-end',
    maxWidth: undefined,
  },
  tabText: {
    fontSize: 15,
    color: '#AAAAAA',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  tabTextActive: {
    color: '#111111',
    fontWeight: '800',
  },
  tabTextExpired: {
    fontSize: 13,
    color: '#C0392B',
    fontWeight: '600',
    textAlign: 'right',
  },
  tabTextExpiredActive: {
    fontWeight: '800',
  },
  tabLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#111111',
    borderRadius: 2,
    marginTop: 8,
  },
  tabLineSent: {
    backgroundColor: '#C0392B',
  },
  tabLineExpired: {
    backgroundColor: '#C0392B',
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
  pageScroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
});
