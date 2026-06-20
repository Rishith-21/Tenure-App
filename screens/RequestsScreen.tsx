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
import {CompositeNavigationProp, useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import RequestListCard from '../components/requests/RequestListCard';
import SentRequestCard from '../components/requests/SentRequestCard';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {MainTabParamList} from '../navigation/MainTabNavigator';
import {MAIN_TAB_BAR_RESERVE} from '../navigation/tabBarLayout';
import {useAppDialog} from '../context/DialogContext';
import {useTheme} from '../context/ThemeContext';
import {radius, spacing} from '../theme/tokens';
import ScreenHeader from '../components/navigation/ScreenHeader';
import {
  collectHistoryRequests,
  historyCardSubtitle,
  historyDirectionLabel,
  historyStatusLabel,
} from '../utils/requestHistoryDisplay';

type SwipeTab = 'request' | 'sent';
type TabKey = SwipeTab | 'history';
type HistoryFilter = 'all' | 'sent' | 'received';

type RequestsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Requests'>,
  NativeStackNavigationProp<any>
>;

const {width: PAGE_WIDTH} = Dimensions.get('window');

const RequestsScreen = () => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const {showConfirm, showAlert} = useAppDialog();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RequestsNav>();
  const pagerRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('sent');
  const [swipeTab, setSwipeTab] = useState<SwipeTab>('sent');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  const received = useMateRequestsStore(s => s.received);
  const sent = useMateRequestsStore(s => s.sent);
  const archivedReceived = useMateRequestsStore(s => s.archivedReceived);
  const archivedSent = useMateRequestsStore(s => s.archivedSent);
  const cancelSentRequest = useMateRequestsStore(s => s.cancelSentRequest);
  const fetchRequests = useMateRequestsStore(s => s.fetchRequests);

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const pendingReceived = received.filter(r => r.status === 'pending');
  const pendingSent = sent.filter(
    r => r.status === 'pending' || r.status === 'confirmed',
  );

  const historyRequests = useMemo(
    () =>
      collectHistoryRequests(
        archivedSent,
        archivedReceived,
        sent,
        received,
      ),
    [archivedSent, archivedReceived, sent, received],
  );

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') {
      return historyRequests;
    }
    return historyRequests.filter(r => r.direction === historyFilter);
  }, [historyFilter, historyRequests]);

  const listBottomPad = insets.bottom + MAIN_TAB_BAR_RESERVE + 24;

  useEffect(() => {
    if (activeTab !== 'history') {
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
          {paddingBottom: listBottomPad},
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
    <View style={styles.container}>
      <ScreenHeader
        title="Requests"
        right={
          <View style={styles.headerCount}>
            <Text style={styles.headerCountText}>
              {pendingReceived.length + pendingSent.length} active
            </Text>
          </View>
        }
      />

      <View style={styles.segmentWrap}>
        <Pressable
          style={[
            styles.segmentBtn,
            (activeTab === 'request' || swipeTab === 'request') &&
              activeTab !== 'history' &&
              styles.segmentBtnActive,
          ]}
          onPress={() => goToSwipeTab('request')}>
          <Text
            style={[
              styles.segmentText,
              (activeTab === 'request' || swipeTab === 'request') &&
                activeTab !== 'history' &&
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
              activeTab !== 'history' &&
              styles.segmentBtnActive,
          ]}
          onPress={() => goToSwipeTab('sent')}>
          <Text
            style={[
              styles.segmentText,
              (activeTab === 'sent' || swipeTab === 'sent') &&
                activeTab !== 'history' &&
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
            activeTab === 'history' && styles.segmentBtnActive,
          ]}
          onPress={() => setActiveTab('history')}>
          <Text
            style={[
              styles.segmentText,
              activeTab === 'history' && styles.segmentTextActive,
            ]}>
            History
          </Text>
          <View style={styles.segmentCount}>
            <Text style={styles.segmentCountText}>{historyRequests.length}</Text>
          </View>
        </Pressable>
      </View>

      {activeTab === 'history' ? (
        <View style={styles.historyBody}>
          <Text style={styles.historyHint}>
            Past contacts and expired requests
          </Text>
          <View style={styles.historyFilterRow}>
            <Pressable
              style={[
                styles.historyFilterBtn,
                historyFilter === 'all' && styles.historyFilterBtnActive,
              ]}
              onPress={() => setHistoryFilter('all')}>
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === 'all' && styles.historyFilterTextActive,
                ]}>
                All ({historyRequests.length})
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.historyFilterBtn,
                historyFilter === 'sent' && styles.historyFilterBtnActive,
              ]}
              onPress={() => setHistoryFilter('sent')}>
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === 'sent' && styles.historyFilterTextActive,
                ]}>
                Sent (
                {historyRequests.filter(r => r.direction === 'sent').length})
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.historyFilterBtn,
                historyFilter === 'received' && styles.historyFilterBtnActive,
              ]}
              onPress={() => setHistoryFilter('received')}>
              <Text
                style={[
                  styles.historyFilterText,
                  historyFilter === 'received' &&
                    styles.historyFilterTextActive,
                ]}>
                Incoming (
                {historyRequests.filter(r => r.direction === 'received').length}
                )
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.pageScroll,
              {paddingBottom: listBottomPad},
            ]}>
            {filteredHistory.length === 0 ? (
              <Text style={styles.emptyText}>No history yet.</Text>
            ) : (
              filteredHistory.map(req => (
                <RequestListCard
                  key={req.id}
                  request={req}
                  directionLabel={historyDirectionLabel(req.direction)}
                  statusText={historyStatusLabel(req.status)}
                  subtitle={historyCardSubtitle(req)}
                  onPress={() =>
                    req.direction === 'sent'
                      ? openSentDetail(req.id)
                      : openReceivedDetail(req.id)
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
    </View>
  );
};

export default RequestsScreen;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    headerCount: {
      backgroundColor: c.chip,
      borderRadius: tokens.radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    headerCountText: {
      color: c.textSecondary,
      fontSize: 11,
      fontWeight: '700',
    },
    segmentWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: spacing.screenH,
      backgroundColor: c.cardMuted,
      borderRadius: tokens.radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 5,
      marginBottom: spacing.md,
    },
    segmentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: tokens.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 8,
    },
    segmentBtnActive: {
      backgroundColor: c.bgElevated,
      ...tokens.shadows.soft(c.shadow),
    },
    segmentText: {
      ...tokens.typography.caption,
      color: c.textMuted,
      fontWeight: '600',
    },
    segmentTextActive: {
      color: c.brand,
      fontWeight: '800',
    },
    segmentCount: {
      minWidth: 24,
      paddingHorizontal: 7,
      height: 22,
      borderRadius: tokens.radius.pill,
      backgroundColor: c.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentCountText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    pager: {
      flex: 1,
    },
    page: {
      flex: 1,
    },
    historyBody: {
      flex: 1,
    },
    historyHint: {
      ...tokens.typography.caption,
      color: c.textMuted,
      paddingHorizontal: spacing.screenH,
      marginBottom: spacing.md,
    },
    historyFilterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.screenH,
      marginBottom: spacing.md,
    },
    historyFilterBtn: {
      borderRadius: tokens.radius.pill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    historyFilterBtnActive: {
      borderColor: c.chipActive,
      backgroundColor: c.chipActive,
    },
    historyFilterText: {
      ...tokens.typography.caption,
      fontWeight: '600',
      color: c.textMuted,
    },
    historyFilterTextActive: {
      color: c.bgElevated,
      fontWeight: '700',
    },
    pageScroll: {
      paddingHorizontal: spacing.screenH,
      flexGrow: 1,
    },
    emptyText: {
      ...tokens.typography.body,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 40,
    },
  });
