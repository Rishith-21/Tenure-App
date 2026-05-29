import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTheme} from '../context/ThemeContext';
import {usePreventAuthBackOnHome} from '../hooks/usePreventAuthBackOnHome';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  BackHandler,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeMapView, {
  HomeMapMarker,
  MapEdgePadding,
} from '../components/home/HomeMapView';
import HomeMeetAllSheet from '../components/home/HomeMeetAllSheet';
import SearchPanel from '../components/search/SearchPanel';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {MAX_TENURE_SECONDS, useActiveSessionStore} from '../store/activeSessionStore';
import {useElapsedTimer} from '../hooks/useElapsedTimer';
import {formatMeetRange} from '../utils/meetTime';
import {buildHomeMeetItems, HomeMeetItem} from '../utils/homeMeetItems';
import {MateRequest} from '../types/mateRequest';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const TAB_BAR_RESERVE = 62;
const FLOAT_H_MARGIN = 14;
const PANEL_OPEN_MS = 250;
const PANEL_PEEK_MS = 200;
const CAROUSEL_GAP = 10;
const CAROUSEL_PAGE_WIDTH = SCREEN_WIDTH - FLOAT_H_MARGIN * 2 - 22;
/** Drag down (px) — panel rests in peek mode for more map */
const PANEL_PEEK_Y = 72;
/** Bottom tab reserve for Home overlays (slightly smaller = more map space) */
const HOME_TAB_RESERVE = 44;
const PANEL_BODY_MAX_HEIGHT = 156;
/** Reserved space above search bar for the location card (transform-only hide) */
const LOCATION_STACK_HEIGHT = 78;

type PillTone = 'active' | 'confirmed' | 'pending' | 'neutral';

const HomeScreen = ({navigation}: any) => {
  usePreventAuthBackOnHome();
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createHomeStyles(colors), [colors]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allDatesOpen, setAllDatesOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [panelPeek, setPanelPeek] = useState(false);
  const carouselRef = useRef<FlatList<HomeMeetItem>>(null);
  const panelY = useSharedValue(0);
  const panelDragStart = useSharedValue(0);
  const searchBarProgress = useSharedValue(0);

  const snapPanel = useCallback(
    (peek: boolean) => {
      setPanelPeek(peek);
      panelY.value = withTiming(peek ? PANEL_PEEK_Y : 0, {
        duration: peek ? PANEL_PEEK_MS : PANEL_OPEN_MS,
        easing: peek ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic),
      });
    },
    [panelY],
  );

  const sent = useMateRequestsStore(s => s.sent);
  const received = useMateRequestsStore(s => s.received);
  const activeSession = useActiveSessionStore(s => s.session);
  const clearActiveSession = useActiveSessionStore(s => s.clearSession);
  const elapsedSec = useElapsedTimer(
    activeSession?.startedAt ?? null,
    Boolean(activeSession),
  );

  useEffect(() => {
    if (activeSession && elapsedSec >= MAX_TENURE_SECONDS) {
      clearActiveSession();
    }
  }, [activeSession, elapsedSec, clearActiveSession]);

  const meetItems = useMemo(
    () => buildHomeMeetItems(activeSession, received, sent, elapsedSec),
    [activeSession, received, sent, elapsedSec],
  );

  useEffect(() => {
    if (meetItems.length === 0) {
      setSelectedIndex(0);
      panelY.value = 0;
      setPanelPeek(false);
      return;
    }
    if (selectedIndex >= meetItems.length) {
      setSelectedIndex(0);
    }
  }, [meetItems.length, selectedIndex, panelY]);

  const selectedItem = meetItems[selectedIndex] ?? null;
  const selectedId = selectedItem?.id ?? null;

  const mapPadding = useMemo<MapEdgePadding>(() => {
    const deckReserve = panelPeek ? 56 : 128;
    return {
      top: insets.top + 148,
      right: 12,
      bottom: deckReserve + HOME_TAB_RESERVE + Math.max(insets.bottom, 4),
      left: 12,
    };
  }, [insets.top, insets.bottom, panelPeek]);

  /** Drag header only — keeps horizontal carousel swipes separate from vertical panel moves */
  const headerPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .failOffsetX([-28, 28])
        .onBegin(() => {
          panelDragStart.value = panelY.value;
        })
        .onUpdate(e => {
          panelY.value = Math.min(
            PANEL_PEEK_Y,
            Math.max(0, panelDragStart.value + e.translationY),
          );
        })
        .onEnd(e => {
          const peek =
            panelY.value > PANEL_PEEK_Y * 0.32 || e.velocityY > 280;
          runOnJS(snapPanel)(peek);
        }),
    [panelDragStart, panelY, snapPanel],
  );

  const peekMap = useCallback(() => {
    if (meetItems.length === 0 || panelPeek) {
      return;
    }
    snapPanel(true);
  }, [meetItems.length, panelPeek, snapPanel]);

  const panelWrapStyle = useAnimatedStyle(() => ({
    transform: [{translateY: panelY.value}],
  }));

  const panelBodyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(panelY.value, [0, PANEL_PEEK_Y * 0.45], [1, 0]),
    maxHeight: interpolate(panelY.value, [0, PANEL_PEEK_Y], [PANEL_BODY_MAX_HEIGHT, 0]),
    marginTop: interpolate(panelY.value, [0, PANEL_PEEK_Y], [0, -4]),
  }));

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

  const stackNav = () => navigation.getParent();
  const openSearchOverlay = () => {
    searchBarProgress.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
    setSearchOpen(true);
  };

  const closeSearchOverlay = useCallback(() => {
    setSearchOpen(false);
    searchBarProgress.value = withTiming(0, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
    });
  }, [searchBarProgress]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!searchOpen) {
        return false;
      }
      closeSearchOverlay();
      return true;
    });
    return () => sub.remove();
  }, [searchOpen, closeSearchOverlay]);

  const searchBarMotionStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          searchBarProgress.value,
          [0, 1],
          [0, -LOCATION_STACK_HEIGHT],
        ),
      },
      {
        scale: interpolate(searchBarProgress.value, [0, 1], [1, 0.992]),
      },
    ],
  }));

  const locationMotionStyle = useAnimatedStyle(() => {
    const p = searchBarProgress.value;
    return {
      opacity: interpolate(p, [0, 0.35], [1, 0]),
      transform: [
        {translateY: interpolate(p, [0, 1], [0, -10])},
        {scale: interpolate(p, [0, 1], [1, 0.97])},
      ],
    };
  });

  const locationCardShadowStyle = useAnimatedStyle(() => {
    const p = searchBarProgress.value;
    if (Platform.OS === 'android') {
      return {elevation: p > 0.02 ? 0 : 3};
    }
    return {
      shadowOpacity: interpolate(p, [0, 0.12], [0.07, 0]),
      shadowRadius: interpolate(p, [0, 0.12], [10, 0]),
    };
  });

  const searchPanelMotionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(searchBarProgress.value, [0, 0.6, 1], [0, 0.2, 1]),
    transform: [
      {
        translateY: interpolate(searchBarProgress.value, [0, 1], [24, 0]),
      },
    ],
  }));

  const openActiveConversation = () => {
    if (!activeSession) {
      return;
    }
    stackNav()?.navigate('Conversation', {
      chatFlow: 'active',
      mateName: activeSession.mateName,
      mateTenureId: activeSession.mateTenureId,
      mateAvatar: activeSession.mateAvatar,
      sessionLabel: formatMeetRange(
        activeSession.fromDateTime,
        activeSession.toDateTime,
      ),
      initialElapsedSec: elapsedSec,
    });
  };

  const openSentDetail = (requestId: string) => {
    stackNav()?.navigate('SentRequestDetail', {requestId});
  };

  const openReceivedDetail = (requestId: string) => {
    stackNav()?.navigate('ReceivedRequestDetail', {requestId});
  };

  const openConfirmedChat = (req: MateRequest) => {
    stackNav()?.navigate('Conversation', {
      chatFlow:
        req.direction === 'received' ? 'incoming_request' : 'outgoing_request',
      mateName: req.mateName,
      mateTenureId: req.mateTenureId,
      mateAvatar: req.mateAvatar,
      sessionLabel: formatMeetRange(req.fromDateTime, req.toDateTime),
      meetDetails: req.categoryLabel,
      requestSentAt: req.sentAt,
    });
  };

  const handleMeetPress = (item: HomeMeetItem) => {
    if (item.kind === 'active') {
      openActiveConversation();
      return;
    }
    const req = item.request;
    if (!req) {
      return;
    }
    if (req.status === 'confirmed') {
      openConfirmedChat(req);
    } else if (req.direction === 'sent') {
      openSentDetail(req.id);
    } else {
      openReceivedDetail(req.id);
    }
  };

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, meetItems.length - 1));
      setSelectedIndex(clamped);
      carouselRef.current?.scrollToIndex({index: clamped, animated: true});
    },
    [meetItems.length],
  );

  const onSelectById = (id: string) => {
    const idx = meetItems.findIndex(item => item.id === id);
    if (idx >= 0) {
      if (panelPeek) {
        snapPanel(false);
      }
      scrollToIndex(idx);
    }
  };

  const onCarouselScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const interval = CAROUSEL_PAGE_WIDTH + CAROUSEL_GAP;
    const idx = Math.round(e.nativeEvent.contentOffset.x / interval);
    if (idx !== selectedIndex && idx >= 0 && idx < meetItems.length) {
      setSelectedIndex(idx);
    }
  };

  const renderPill = (label: string, tone: PillTone) => {
    const pillStyle =
      tone === 'active'
        ? styles.pillActive
        : tone === 'confirmed'
          ? styles.pillConfirmed
          : tone === 'pending'
            ? styles.pillPending
            : styles.pillNeutral;
    const textStyle =
      tone === 'active'
        ? styles.pillTextActive
        : tone === 'confirmed'
          ? styles.pillTextConfirmed
          : tone === 'pending'
            ? styles.pillTextPending
            : styles.pillTextNeutral;
    return (
      <View style={[styles.pill, pillStyle]}>
        <Text style={[styles.pillText, textStyle]}>{label}</Text>
      </View>
    );
  };

  const pillToneFor = (item: HomeMeetItem): PillTone => {
    if (item.isLive) {
      return 'active';
    }
    if (item.pillLabel === 'CONFIRMED') {
      return 'confirmed';
    }
    if (item.pillLabel === 'WAITING' || item.pillLabel === 'CONFIRM?') {
      return 'pending';
    }
    return 'neutral';
  };

  const renderCarouselCard = ({item}: {item: HomeMeetItem}) => {
    if (item.isLive) {
      return (
        <View style={styles.carouselPage}>
          <View style={styles.activeCardCompact}>
            <View style={styles.meetCardTop}>
              <Image
                source={{uri: item.mateAvatar}}
                style={styles.activeAvatarCompact}
              />
              <View style={styles.activeBodyCompact}>
                <Text style={styles.activeNameCompact} numberOfLines={1}>
                  {item.mateName}
                </Text>
                <Text style={styles.activeMetaCompact} numberOfLines={1}>
                  {item.dateLabel}
                </Text>
              </View>
              <View style={styles.activeRightCompact}>
                {renderPill('LIVE', 'active')}
                <Text style={styles.activeTimerCompact}>{item.timerText}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => handleMeetPress(item)}
              style={({pressed}) => [
                styles.meetAction,
                styles.meetActionLive,
                pressed && styles.meetActionPressed,
              ]}>
              <Text style={[styles.meetActionText, styles.meetActionTextLive]}>
                Open chat
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    const requestDirection = item.request?.direction;
    const accent =
      item.pillLabel === 'CONFIRMED'
        ? 'confirmedPink'
        : item.pillLabel === 'CONFIRM?' && requestDirection === 'received'
          ? 'pendingCream'
          : 'none';

    const metaLine = [item.categoryLabel, item.dateLabel]
      .filter(Boolean)
      .join(' · ');

    return (
      <View style={styles.carouselPage}>
        <View
          style={[
            styles.meetCardCompact,
            accent === 'confirmedPink' && styles.meetCardAccentConfirmedPink,
            accent === 'pendingCream' && styles.meetCardAccentPendingCream,
          ]}>
          <View style={styles.meetCardTop}>
            <Image source={{uri: item.mateAvatar}} style={styles.avatarCompact} />
            <View style={styles.meetBodyCompact}>
              <Text style={styles.meetNameCompact} numberOfLines={1}>
                {item.mateName}
              </Text>
              <Text style={styles.meetMetaCompact} numberOfLines={1}>
                {metaLine}
              </Text>
              {item.caption ? (
                <Text style={styles.meetCaptionCompact} numberOfLines={1}>
                  {item.caption}
                </Text>
              ) : null}
            </View>
            <View style={styles.meetAsideCompact}>
              {renderPill(item.pillLabel, pillToneFor(item))}
            </View>
          </View>
          <Pressable
            onPress={() => handleMeetPress(item)}
            style={({pressed}) => [
              styles.meetAction,
              pressed && styles.meetActionPressed,
            ]}>
            <Text style={styles.meetActionText}>Open chat</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.topContainer, {paddingTop: insets.top + 8}]}>
          <View style={styles.topStack}>
            <Animated.View
              style={[styles.locationSlot, locationMotionStyle]}
              pointerEvents={searchOpen ? 'none' : 'auto'}>
              <Animated.View style={[styles.locationCard, locationCardShadowStyle]}>
                <Text style={styles.locationLabel}>Current area</Text>
                <View style={styles.locationRow}>
                  <View style={styles.pinDot} />
                  <Text style={styles.locationText} numberOfLines={2}>
                    5VH8+MQ Belman, Karnataka 576111
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>

            <Animated.View style={searchBarMotionStyle}>
            {searchOpen ? (
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search mates, categories, ID…"
                  placeholderTextColor={colors.textHint}
                  style={styles.searchInputField}
                  autoFocus
                  returnKeyType="search"
                />
                <Pressable onPress={closeSearchOverlay} style={styles.searchCloseBtn}>
                  <Text style={styles.searchCloseText}>×</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.searchBar} onPress={openSearchOverlay}>
                <Text style={styles.searchIcon}>⌕</Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.searchInputField,
                    !searchQuery && styles.searchInputPlaceholder,
                  ]}>
                  {searchQuery || 'Search activity mates…'}
                </Text>
              </Pressable>
            )}
            </Animated.View>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <HomeMapView
            focusCoordinate={selectedItem?.coordinate ?? null}
            markers={mapMarkers}
            mapPadding={mapPadding}
            onMapPress={meetItems.length > 0 ? peekMap : undefined}
          />
        </View>

        {searchOpen ? (
          <Animated.View
            style={[
              styles.searchPanelLayer,
              {top: insets.top + 64},
              searchPanelMotionStyle,
            ]}>
            <SearchPanel
              onClose={closeSearchOverlay}
              stackNavigation={stackNav() ?? undefined}
              hideSearchRow
              query={searchQuery}
              onChangeQuery={setSearchQuery}
            />
          </Animated.View>
        ) : null}

        <View
          style={[
            styles.carouselWrap,
            {paddingBottom: insets.bottom + HOME_TAB_RESERVE},
          ]}>
          {!searchOpen && meetItems.length > 0 ? (
            <Animated.View style={[styles.meetFloat, panelWrapStyle]}>
              <GestureDetector gesture={headerPanGesture}>
                <Pressable
                  onPress={() => {
                    if (panelPeek) {
                      snapPanel(false);
                    }
                  }}
                  style={styles.meetFloatHeader}>
                  <View style={styles.meetHeaderTextWrap}>
                    <Text style={styles.carouselTitle}>
                      Meet dates
                      <Text style={styles.carouselCount}>
                        {' '}
                        · {meetItems.length}
                      </Text>
                    </Text>
                    {panelPeek && selectedItem ? (
                      <Text style={styles.peekMateName} numberOfLines={1}>
                        {selectedItem.mateName}
                      </Text>
                    ) : null}
                  </View>
                  {meetItems.length > 1 ? (
                    <Pressable
                      onPress={() => setAllDatesOpen(true)}
                      hitSlop={8}
                      style={({pressed}) => [
                        styles.showAllBtn,
                        pressed && styles.showAllBtnPressed,
                      ]}>
                      <Text style={styles.showAllLink}>Show all dates</Text>
                    </Pressable>
                  ) : null}
                </Pressable>
              </GestureDetector>

              <Animated.View
                style={[styles.panelBody, panelBodyStyle]}
                pointerEvents={panelPeek ? 'none' : 'auto'}>
                  <FlatList
                    ref={carouselRef}
                    data={meetItems}
                    keyExtractor={item => item.id}
                    renderItem={renderCarouselCard}
                    horizontal
                    decelerationRate="fast"
                    snapToAlignment="start"
                    snapToInterval={CAROUSEL_PAGE_WIDTH + CAROUSEL_GAP}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onCarouselScrollEnd}
                    style={styles.carouselList}
                    contentContainerStyle={styles.carouselContent}
                    getItemLayout={(_, index) => ({
                      length: CAROUSEL_PAGE_WIDTH + CAROUSEL_GAP,
                      offset: (CAROUSEL_PAGE_WIDTH + CAROUSEL_GAP) * index,
                      index,
                    })}
                    onScrollToIndexFailed={info => {
                      setTimeout(() => {
                        carouselRef.current?.scrollToIndex({
                          index: info.index,
                          animated: true,
                        });
                      }, 100);
                    }}
                  />

                  {meetItems.length > 1 ? (
                    <View style={styles.dotsRow}>
                      {meetItems.map((item, i) => (
                        <View
                          key={item.id}
                          style={[
                            styles.dot,
                            i === selectedIndex && styles.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  ) : null}
              </Animated.View>
            </Animated.View>
          ) : !searchOpen ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No meet dates yet</Text>
              <Text style={styles.emptyBody}>
                Search for an activity mate and send a request to get started.
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <HomeMeetAllSheet
        visible={allDatesOpen}
        items={meetItems}
        selectedId={selectedId}
        onClose={() => setAllDatesOpen(false)}
        onSelect={onSelectById}
      />
    </>
  );
};

export default HomeScreen;

const createHomeStyles = (c: ReturnType<typeof useTheme>['colors']) => {
  const floatShadow = Platform.select({
    ios: {
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.07,
      shadowRadius: 10,
    },
    android: {elevation: 3},
    default: {},
  });

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bgHome,
    },
    topContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingHorizontal: 18,
    },
    topStack: {
      position: 'relative',
    },
    locationSlot: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
    },
    locationCard: {
      backgroundColor: c.bg,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingHorizontal: 16,
      paddingVertical: 11,
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: 2},
    },
    locationLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textHint,
      letterSpacing: 0.2,
      marginBottom: 6,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    pinDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.brand,
      marginTop: 2,
      opacity: 0.85,
    },
    locationText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      lineHeight: 19,
      letterSpacing: -0.2,
    },
    searchBar: {
      backgroundColor: c.bg,
      borderRadius: 999,
      marginTop: LOCATION_STACK_HEIGHT + 6,
      paddingHorizontal: 16,
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      ...floatShadow,
    },
    searchBarPressed: {
      opacity: 0.94,
      transform: [{scale: 0.995}],
    },
    searchIcon: {
      fontSize: 17,
      color: c.textHint,
      marginRight: 10,
      opacity: 0.9,
    },
    searchText: {
      flex: 1,
      color: c.textMuted,
      fontSize: 14,
      letterSpacing: -0.1,
    },
    searchInputField: {
      flex: 1,
      color: c.text,
      fontSize: 14,
      letterSpacing: -0.1,
      paddingVertical: 10,
    },
    searchInputPlaceholder: {
      color: c.textMuted,
    },
    searchCloseBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.chip,
    },
    searchCloseText: {
      fontSize: 18,
      fontWeight: '700',
      color: c.textSecondary,
      lineHeight: 18,
      marginTop: -1,
    },
    searchPanelLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.bgElevated,
      zIndex: 9,
      paddingHorizontal: 16,
      paddingTop: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    mapContainer: {
      flex: 1,
      backgroundColor: c.chip,
    },
    carouselWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      pointerEvents: 'box-none',
    },
    meetFloat: {
      marginHorizontal: FLOAT_H_MARGIN,
      backgroundColor: c.bg,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingTop: 8,
      paddingBottom: 6,
      ...floatShadow,
      ...Platform.select({
        ios: {
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 16,
        },
        android: {elevation: 8},
        default: {},
      }),
    },
    meetFloatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginBottom: 2,
    },
    meetHeaderTextWrap: {
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    peekMateName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textMuted,
      marginTop: 3,
    },
    panelBody: {
      overflow: 'hidden',
    },
    carouselList: {
      flexGrow: 0,
    },
    carouselContent: {
      paddingHorizontal: 10,
    },
    meetCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    meetAction: {
      alignSelf: 'flex-start',
      marginTop: 10,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: c.chip,
    },
    meetActionLive: {
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    meetActionPressed: {
      opacity: 0.88,
    },
    meetActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.brand,
      letterSpacing: 0.15,
    },
    meetActionTextLive: {
      color: '#FFFFFF',
    },
    carouselTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
      letterSpacing: -0.2,
    },
    carouselCount: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
    },
    showAllBtn: {
      paddingVertical: 6,
      paddingHorizontal: 4,
      marginRight: -4,
    },
    showAllBtnPressed: {
      opacity: 0.85,
    },
    showAllLink: {
      fontSize: 11,
      fontWeight: '700',
      color: c.brand,
    },
    carouselPage: {
      width: CAROUSEL_PAGE_WIDTH,
      marginRight: CAROUSEL_GAP,
      paddingHorizontal: 0,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
      paddingBottom: 2,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.borderPill,
      opacity: 0.5,
    },
    dotActive: {
      backgroundColor: c.brand,
      opacity: 1,
      width: 14,
      height: 4,
      borderRadius: 2,
    },
    activeCardCompact: {
      backgroundColor: c.brandDark,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    activeAvatarCompact: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.35)',
    },
    activeBodyCompact: {
      flex: 1,
      minWidth: 0,
    },
    activeNameCompact: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    activeMetaCompact: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 11,
      marginTop: 2,
    },
    activeRightCompact: {
      alignItems: 'flex-end',
      gap: 4,
    },
    activeTimerCompact: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
    },
    meetCardCompact: {
      backgroundColor: c.bgElevated,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    meetCardAccentConfirmedPink: {
      backgroundColor: c.meetConfirmedCardBg,
      borderColor: c.meetConfirmedCardBorder,
    },
    meetCardAccentPendingCream: {
      backgroundColor: c.meetPendingConfirmCardBg,
      borderColor: c.meetPendingConfirmCardBorder,
    },
    avatarCompact: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.chip,
    },
    meetBodyCompact: {
      flex: 1,
      minWidth: 0,
      paddingRight: 4,
    },
    meetNameCompact: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      letterSpacing: -0.2,
    },
    meetMetaCompact: {
      fontSize: 12,
      fontWeight: '600',
      color: c.brand,
      marginTop: 2,
    },
    meetCaptionCompact: {
      fontSize: 11,
      color: c.textHint,
      marginTop: 2,
    },
    meetAsideCompact: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexShrink: 0,
    },
    pill: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    pillActive: {backgroundColor: '#FFFFFF'},
    pillConfirmed: {backgroundColor: c.chip},
    pillPending: {backgroundColor: c.meetPendingBg},
    pillNeutral: {backgroundColor: c.chip},
    pillText: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    pillTextActive: {color: c.brandDark},
    pillTextConfirmed: {color: c.success},
    pillTextPending: {color: c.warning},
    pillTextNeutral: {color: c.textMuted},
    emptyBox: {
      marginHorizontal: FLOAT_H_MARGIN,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 16,
      backgroundColor: c.bg,
      alignItems: 'center',
      ...floatShadow,
    },
    emptyTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
      marginBottom: 6,
    },
    emptyBody: {
      textAlign: 'center',
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
  });
};
