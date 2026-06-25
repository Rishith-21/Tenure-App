import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeMapView, {HomeMapMarker, MapEdgePadding} from '../components/home/HomeMapView';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {MAX_TENURE_SECONDS, useActiveSessionStore} from '../store/activeSessionStore';
import {useElapsedTimer} from '../hooks/useElapsedTimer';
import {formatMeetRange} from '../utils/meetTime';
import {buildHomeMeetItems, HomeMeetItem} from '../utils/homeMeetItems';
import {MateRequest} from '../types/mateRequest';
import {MAIN_TAB_BAR_RESERVE} from '../navigation/tabBarLayout';

const {width: SW} = Dimensions.get('window');
const H_MARGIN = 16;
const CARD_W = SW - H_MARGIN * 2;
const CARD_GAP = 12;
const CARD_INTERVAL = CARD_W + CARD_GAP;
const DECK_CARD_HEIGHT = 132;

/** Shared light · blue-primary palette (matches Home) */
const K = {
  bg:           '#FFFFFF',
  surface:      '#F7F8FA',
  card:         '#FFFFFF',
  accent:       '#014569',
  accentSoft:   'rgba(1,69,105,0.08)',
  accentBorder: 'rgba(1,69,105,0.22)',
  live:         '#1B8A4A',
  liveSoft:     'rgba(27,138,74,0.10)',
  liveBorder:   'rgba(27,138,74,0.26)',
  success:      '#1B8A4A',
  text:         '#111111',
  textSec:      '#444444',
  textMuted:    '#999999',
  border:       '#EEEEEE',
  borderHigh:   '#E5E5E5',
  glassBg:      'rgba(255,255,255,0.94)',
  liveCardBg:   '#EAF4FF',
  liveCardBorder: '#C6DFFF',
} as const;

const AnimatedDeck = Animated.createAnimatedComponent(FlatList<HomeMeetItem>);

const ExploreScreen = ({navigation}: any) => {
  const insets = useSafeAreaInsets();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const deckRef = useRef<FlatList<HomeMeetItem>>(null);
  const deckScrollX = useSharedValue(0);

  const sent          = useMateRequestsStore(s => s.sent);
  const received      = useMateRequestsStore(s => s.received);
  const activeSession = useActiveSessionStore(s => s.session);
  const clearSession  = useActiveSessionStore(s => s.clearSession);
  const elapsedSec    = useElapsedTimer(activeSession?.startedAt ?? null, Boolean(activeSession));

  useEffect(() => {
    if (activeSession && elapsedSec >= MAX_TENURE_SECONDS) {
      clearSession();
    }
  }, [activeSession, elapsedSec, clearSession]);

  const meetItems = useMemo(
    () => buildHomeMeetItems(activeSession, received, sent, elapsedSec),
    [activeSession, received, sent, elapsedSec],
  );

  useEffect(() => {
    if (meetItems.length === 0) {
      setSelectedIdx(0);
      deckScrollX.value = 0;
    } else if (selectedIdx >= meetItems.length) {
      setSelectedIdx(0);
    }
  }, [meetItems.length, selectedIdx, deckScrollX]);

  const selectedItem = meetItems[selectedIdx] ?? null;
  const selectedId = selectedItem?.id ?? null;

  /* ── Map ↔ carousel sync ──────────────────────────────── */
  const onDeckScroll = useAnimatedScrollHandler({
    onScroll: e => { deckScrollX.value = e.contentOffset.x; },
  });

  const snapToCard = useCallback(
    (offsetX: number, vx = 0, animated = true) => {
      let idx = Math.round(offsetX / CARD_INTERVAL);
      if (Math.abs(vx) > 0.28) {
        idx = vx > 0
          ? Math.ceil(offsetX / CARD_INTERVAL)
          : Math.floor(offsetX / CARD_INTERVAL);
      }
      const clamped = Math.max(0, Math.min(idx, meetItems.length - 1));
      deckScrollX.value = clamped * CARD_INTERVAL;
      if (clamped !== selectedIdx) { setSelectedIdx(clamped); }
      if (Math.abs(offsetX - clamped * CARD_INTERVAL) > 4) {
        deckRef.current?.scrollToOffset({offset: clamped * CARD_INTERVAL, animated});
      }
    },
    [deckScrollX, meetItems.length, selectedIdx],
  );

  const mapMarkers: HomeMapMarker[] = useMemo(
    () =>
      meetItems.map(item => ({
        id: item.id,
        coordinate: item.coordinate,
        title: item.mateName,
        selected: item.id === selectedId,
      })),
    [meetItems, selectedId],
  );

  const mapPadding = useMemo<MapEdgePadding>(
    () => ({
      top: insets.top + 76,
      right: 24,
      bottom: DECK_CARD_HEIGHT + MAIN_TAB_BAR_RESERVE + Math.max(insets.bottom, 8) + 48,
      left: 24,
    }),
    [insets.top, insets.bottom],
  );

  /* ── Navigation ───────────────────────────────────────── */
  const stackNav = () => navigation.getParent();

  const openActiveChat = () => {
    if (!activeSession) { return; }
    stackNav()?.navigate('Conversation', {
      chatFlow: 'active',
      mateName: activeSession.mateName,
      mateTenureId: activeSession.mateTenureId,
      mateAvatar: activeSession.mateAvatar,
      sessionLabel: formatMeetRange(activeSession.fromDateTime, activeSession.toDateTime),
      initialElapsedSec: elapsedSec,
      mateUserId: activeSession.mateUserId,
      requestId: activeSession.requestId,
    });
  };

  const openConfirmedChat = (req: MateRequest) => {
    stackNav()?.navigate('Conversation', {
      chatFlow: req.direction === 'received' ? 'incoming_request' : 'outgoing_request',
      mateName: req.mateName,
      mateTenureId: req.mateTenureId,
      mateAvatar: req.mateAvatar,
      sessionLabel: formatMeetRange(req.fromDateTime, req.toDateTime),
      meetDetails: req.categoryLabel,
      requestSentAt: req.sentAt,
      mateUserId: req.mateUserId,
      requestId: req.id,
    });
  };

  const handleMeetPress = (item: HomeMeetItem) => {
    if (item.isLive) { openActiveChat(); return; }
    const req = item.request;
    if (!req) { return; }
    if (req.status === 'confirmed') { openConfirmedChat(req); }
    else if (req.direction === 'sent') { stackNav()?.navigate('SentRequestDetail', {requestId: req.id}); }
    else { stackNav()?.navigate('ReceivedRequestDetail', {requestId: req.id}); }
  };

  /* ── Page indicator ───────────────────────────────────── */
  const indicatorStyle = useAnimatedStyle(() => {
    const slot = 22;
    const progress = deckScrollX.value / CARD_INTERVAL;
    return {transform: [{translateX: progress * slot}]};
  });

  /* ── Deck card ────────────────────────────────────────── */
  const renderDeckCard = ({item}: {item: HomeMeetItem}) => {
    const isLive = Boolean(item.isLive);
    const statusColor =
      item.pillLabel === 'CONFIRMED' ? K.success
      : item.pillLabel === 'WAITING' || item.pillLabel === 'CONFIRM?' ? K.accent
      : isLive ? K.live
      : K.textMuted;

    const metaLine = [item.categoryLabel, item.dateLabel].filter(Boolean).join(' · ');

    return (
      <View style={styles.cardPage}>
        <Pressable
          style={({pressed}) => [
            styles.deckCard,
            isLive && styles.deckCardLive,
            pressed && {opacity: 0.9},
          ]}
          onPress={() => handleMeetPress(item)}>
          <View style={styles.deckTop}>
            <Image source={{uri: item.mateAvatar}} style={styles.deckAvatar} />
            <View style={styles.deckInfo}>
              <Text style={styles.deckName} numberOfLines={1}>{item.mateName}</Text>
              <Text style={styles.deckMeta} numberOfLines={1}>{metaLine}</Text>
              {item.caption ? (
                <Text style={styles.deckCaption} numberOfLines={1}>{item.caption}</Text>
              ) : null}
            </View>
            <View style={styles.deckAside}>
              <View
                style={[
                  styles.statusPill,
                  {borderColor: `${statusColor}55`, backgroundColor: `${statusColor}18`},
                ]}>
                <Text style={[styles.statusText, {color: statusColor}]}>{item.pillLabel}</Text>
              </View>
              {isLive ? <Text style={styles.deckTimer}>{item.timerText}</Text> : null}
            </View>
          </View>
          <View style={styles.deckActionRow}>
            <Text style={styles.deckPinHint}>◉ Swipe to move the map</Text>
            <Text style={styles.deckAction}>{isLive ? 'Open chat →' : 'View details →'}</Text>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Full-screen map */}
      <View style={StyleSheet.absoluteFill}>
        <HomeMapView
          focusCoordinate={selectedItem?.coordinate ?? null}
          markers={mapMarkers}
          mapPadding={mapPadding}
        />
      </View>

      {/* Top header (floating) */}
      <View style={[styles.header, {paddingTop: insets.top + 10}]} pointerEvents="box-none">
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSub}>
              {meetItems.length > 0
                ? `${meetItems.length} ${meetItems.length === 1 ? 'mate' : 'mates'} on your map`
                : 'Mates near you'}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <View style={styles.headerBadgeDot} />
            <Text style={styles.headerBadgeText}>Live</Text>
          </View>
        </View>
      </View>

      {/* Bottom synced deck */}
      <View
        style={[
          styles.deckWrap,
          {paddingBottom: insets.bottom + MAIN_TAB_BAR_RESERVE},
        ]}
        pointerEvents="box-none">
        {meetItems.length > 0 ? (
          <>
            <AnimatedDeck
              ref={deckRef}
              data={meetItems}
              keyExtractor={item => item.id}
              renderItem={renderDeckCard}
              horizontal
              decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
              snapToAlignment="start"
              snapToInterval={CARD_INTERVAL}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              bounces
              overScrollMode="never"
              onScroll={onDeckScroll}
              onMomentumScrollEnd={e => snapToCard(e.nativeEvent.contentOffset.x)}
              onScrollEndDrag={e => {
                const vx = e.nativeEvent.velocity?.x ?? 0;
                if (Math.abs(vx) < 0.35) {
                  snapToCard(e.nativeEvent.contentOffset.x, vx);
                }
              }}
              contentContainerStyle={styles.deckContent}
              getItemLayout={(_, index) => ({
                length: CARD_INTERVAL,
                offset: CARD_INTERVAL * index,
                index,
              })}
              onScrollToIndexFailed={info => {
                setTimeout(() => {
                  deckRef.current?.scrollToIndex({index: info.index, animated: true});
                }, 100);
              }}
            />
            {meetItems.length > 1 ? (
              <View style={styles.dots}>
                <View style={[styles.dotsTrack, {width: meetItems.length * 22}]}>
                  <Animated.View style={[styles.dotActive, indicatorStyle]} />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyDeck}>
            <Text style={styles.emptyTitle}>No mates on your map yet</Text>
            <Text style={styles.emptyBody}>
              Confirmed and pending meet dates appear here, pinned to where you'll meet.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: K.bg},

  /* Header */
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: H_MARGIN,
    zIndex: 10,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: K.glassBg,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 16},
      android: {elevation: 6},
    }),
  },
  headerTextWrap: {flex: 1},
  headerTitle: {fontSize: 22, fontWeight: '900', color: K.text, letterSpacing: -0.6},
  headerSub: {fontSize: 13, fontWeight: '600', color: K.textSec, marginTop: 2},
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: K.liveSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: K.liveBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: K.live},
  headerBadgeText: {fontSize: 11, fontWeight: '800', color: K.live, letterSpacing: 0.4},

  /* Deck */
  deckWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    zIndex: 10,
  },
  deckContent: {paddingHorizontal: H_MARGIN, paddingVertical: 14},
  cardPage: {width: CARD_W, marginRight: CARD_GAP},
  deckCard: {
    minHeight: DECK_CARD_HEIGHT,
    backgroundColor: K.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: K.borderHigh,
    padding: 16,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.14, shadowRadius: 22},
      android: {elevation: 10},
    }),
  },
  deckCardLive: {
    backgroundColor: K.liveCardBg,
    borderColor: K.liveCardBorder,
  },
  deckTop: {flexDirection: 'row', alignItems: 'center', gap: 13},
  deckAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: K.surface,
    borderWidth: 1.5, borderColor: K.borderHigh,
  },
  deckInfo: {flex: 1, minWidth: 0},
  deckName: {fontSize: 17, fontWeight: '800', color: K.text, letterSpacing: -0.3},
  deckMeta: {fontSize: 13, fontWeight: '600', color: K.accent, marginTop: 3},
  deckCaption: {fontSize: 12, color: K.textMuted, marginTop: 2},
  deckAside: {alignItems: 'flex-end', gap: 6, flexShrink: 0},
  statusPill: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, borderWidth: 1,
  },
  statusText: {fontSize: 10, fontWeight: '900', letterSpacing: 0.5},
  deckTimer: {
    fontSize: 13, fontWeight: '900', color: K.accent,
    fontVariant: ['tabular-nums'],
  },
  deckActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: K.border,
  },
  deckPinHint: {fontSize: 11, fontWeight: '600', color: K.textMuted},
  deckAction: {fontSize: 13, fontWeight: '800', color: K.accent},

  /* Dots */
  dots: {alignItems: 'center', marginTop: 12},
  dotsTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },
  dotActive: {
    width: 22,
    height: 5,
    borderRadius: 3,
    backgroundColor: K.accent,
  },

  /* Empty */
  emptyDeck: {
    marginHorizontal: H_MARGIN,
    backgroundColor: K.glassBg,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    padding: 22,
  },
  emptyTitle: {fontSize: 16, fontWeight: '800', color: K.text, marginBottom: 6, letterSpacing: -0.3},
  emptyBody: {fontSize: 13, fontWeight: '500', color: K.textSec, lineHeight: 19},
});
