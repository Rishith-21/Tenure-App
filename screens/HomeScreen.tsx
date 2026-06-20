import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import HomeMapView, {
  HomeMapMarker,
  MapEdgePadding,
} from '../components/home/HomeMapView';
import HeaderIconButton, {BellIcon, MenuIcon} from '../components/home/HeaderIconButton';
import HomeMeetAllSheet from '../components/home/HomeMeetAllSheet';
import AccountMenuSheet, {
  AccountMenuAction,
  AccountMenuAnchor,
  AccountMenuSheetRef,
} from '../components/home/AccountMenuSheet';
import SearchPanel from '../components/search/SearchPanel';
import SearchFilterModal from '../components/search/SearchFilterModal';
import {
  createDefaultSearchFilters,
  DEFAULT_SEARCH_FILTERS,
  getActiveFilterCount,
  normalizeSearchFilters,
  SEARCH_CATEGORY_OPTIONS,
  SEARCH_DISTRICTS,
} from '../components/search/searchFilterConfig';
import type {SearchFilters} from '../components/search/searchFilterConfig';
import {useFocusEffect} from '@react-navigation/native';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {fetchProfile} from '../utils/api';
import {MAX_TENURE_SECONDS, useActiveSessionStore} from '../store/activeSessionStore';
import {useElapsedTimer} from '../hooks/useElapsedTimer';
import {formatMeetRange} from '../utils/meetTime';
import {buildHomeMeetItems, HomeMeetItem} from '../utils/homeMeetItems';
import {MateRequest} from '../types/mateRequest';
import {MAIN_TAB_BAR_RESERVE} from '../navigation/tabBarLayout';
import {usePreventAuthBackOnHome} from '../hooks/usePreventAuthBackOnHome';
import {useUserLocation} from '../hooks/useUserLocation';

const {width: SW, height: SH} = Dimensions.get('window');
const SEARCH_OPEN_MS = 260;
const SEARCH_CLOSE_MS = 180;
const SEARCH_SLIDE = Math.min(SH * 0.06, 28);
const OPEN_EASING = Easing.out(Easing.cubic);
const CLOSE_EASING = Easing.in(Easing.cubic);
const H_PAD = 16;
const CARD_GAP = 12;
const CARD_W = SW - H_PAD * 2;
const CARD_INTERVAL = CARD_W + CARD_GAP;
const DECK_CARD_HEIGHT = 132;

/** ─── Design palette (light · blue primary) ────────────── */
const K = {
  bg:           '#FFFFFF',
  surface:      '#F7F8FA',
  card:         '#FFFFFF',
  accent:       '#014569',
  accentSoft:   'rgba(1,69,105,0.08)',
  accentBorder: 'rgba(1,69,105,0.20)',
  live:         '#1B8A4A',
  liveSoft:     'rgba(27,138,74,0.10)',
  liveBorder:   'rgba(27,138,74,0.26)',
  success:      '#1B8A4A',
  text:         '#111111',
  textSec:      '#444444',
  textMuted:    '#999999',
  border:       '#EEEEEE',
  borderHigh:   '#E5E5E5',
  glassBg:      'rgba(255,255,255,0.96)',
  liveCardBg:   '#EAF4FF',
  liveCardBorder: '#C6DFFF',
} as const;

const SEARCH_PHRASES = [
  'Find a coffee mate…',
  'Find a travel buddy…',
  'Find a local guide…',
  'Find a city-walk mate…',
  'Find an event companion…',
  'Find a study partner…',
];

const AnimatedDeck = Animated.createAnimatedComponent(FlatList<HomeMeetItem>);

/** Shadow only on the card nearest scroll center — prevents elevation ghosts on adjacent cards/map. */
const MeetDeckCard = ({
  item,
  index,
  deckScrollX,
  collapse,
  onPress,
}: {
  item: HomeMeetItem;
  index: number;
  deckScrollX: SharedValue<number>;
  collapse: SharedValue<number>;
  onPress: (item: HomeMeetItem) => void;
}) => {
  const isLive = Boolean(item.isLive);
  const statusColor =
    item.pillLabel === 'CONFIRMED' ? K.success
    : item.pillLabel === 'WAITING' || item.pillLabel === 'CONFIRM?' ? K.accent
    : isLive ? K.live
    : K.textMuted;

  const metaLine = [item.categoryLabel, item.dateLabel].filter(Boolean).join(' · ');

  const shadowStyle = useAnimatedStyle(() => {
    const progress = deckScrollX.value / CARD_INTERVAL;
    const distance = Math.abs(progress - index);
    const focus = interpolate(
      distance,
      [0, 0.32, 0.62],
      [1, 0, 0],
      Extrapolation.CLAMP,
    );
    const expanded = interpolate(
      collapse.value,
      [0, 0.32, 0.52],
      [1, 0, 0],
      Extrapolation.CLAMP,
    );
    const strength = focus * expanded;

    return {
      shadowOpacity: strength * 0.14,
      elevation: Math.round(strength * 10),
    };
  });

  return (
    <View style={styles.cardPage} collapsable={false}>
      <Animated.View style={[styles.deckCardShell, shadowStyle]} collapsable={false}>
        <Pressable
          style={({pressed}) => [
            styles.deckCard,
            isLive && styles.deckCardLive,
            pressed && {opacity: 0.9},
          ]}
          onPress={() => onPress(item)}>
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
      </Animated.View>
    </View>
  );
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen = ({navigation}: any) => {
  usePreventAuthBackOnHome();
  const insets = useSafeAreaInsets();
  const userLocation = useUserLocation(true);

  /* ── Search state ─────────────────────────────────────── */
  const [searchOpen, setSearchOpen]             = useState(false);
  const [searchClosing, setSearchClosing]       = useState(false);
  const [searchElevated, setSearchElevated]     = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchFilters, setSearchFilters]       = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [filterModalOpen, setFilterModalOpen]   = useState(false);
  const [accountMenuOpen, setAccountMenuOpen]   = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<AccountMenuAnchor | null>(null);
  const menuButtonRef = useRef<View>(null);
  const accountMenuRef = useRef<AccountMenuSheetRef>(null);
  const accountMenuAnchorRef = useRef<AccountMenuAnchor | null>(null);
  const [accountMenuReady, setAccountMenuReady] = useState(false);
  const searchActiveCount = getActiveFilterCount(searchFilters);
  const searchInputRef   = useRef<TextInput>(null);
  const searchClosingRef = useRef(false);
  const searchProgress   = useSharedValue(0);

  /* ── Floating top (header + search) measured height ─────── */
  const [topFloatHeight, setTopFloatHeight] = useState(insets.top + 150);

  /* ── Rotating placeholder (slide + fade, committed text) ─ */
  const [phraseIdx, setPhraseIdx] = useState(0);
  const phO = useSharedValue(1); // opacity
  const phY = useSharedValue(0); // translateY

  const bumpPhrase = useCallback(() => {
    setPhraseIdx(i => (i + 1) % SEARCH_PHRASES.length);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0 || searchOpen) {
      phO.value = withTiming(1, {duration: 160});
      phY.value = withTiming(0, {duration: 160});
      return;
    }
    const id = setInterval(() => {
      phO.value = withTiming(0, {duration: 240, easing: Easing.in(Easing.cubic)});
      phY.value = withTiming(-7, {duration: 240, easing: Easing.in(Easing.cubic)}, finished => {
        if (finished) {
          runOnJS(bumpPhrase)();
        }
      });
    }, 3000);
    return () => clearInterval(id);
  }, [searchQuery.length, searchOpen, phO, phY, bumpPhrase]);

  useEffect(() => {
    phY.value = 7;
    phO.value = withTiming(1, {duration: 300, easing: Easing.out(Easing.cubic)});
    phY.value = withTiming(0, {duration: 300, easing: Easing.out(Easing.cubic)});
  }, [phraseIdx, phO, phY]);

  const placeholderAnimStyle = useAnimatedStyle(() => ({
    opacity: phO.value,
    transform: [{translateY: phY.value}],
  }));

  /* ── Meet deck ────────────────────────────────────────── */
  const [selectedIdx, setSelectedIdx] = useState(0);
  const deckRef       = useRef<FlatList<HomeMeetItem>>(null);
  const deckScrollX    = useSharedValue(0);
  const [deckCollapsed, setDeckCollapsed] = useState(false);
  const [deckExpandedVisible, setDeckExpandedVisible] = useState(true);
  const collapse       = useSharedValue(0); // 0 = expanded, 1 = capsule
  const [allDatesOpen, setAllDatesOpen] = useState(false);
  const [headerName, setHeaderName] = useState('');
  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null);
  const [headerTenureId, setHeaderTenureId] = useState('');

  const fetchRequests = useMateRequestsStore(s => s.fetchRequests);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchProfile().then(profile => {
        if (!active || !profile) return;
        if (profile.fullName) setHeaderName(profile.fullName);
        if (profile.profilePhoto) setHeaderAvatar(profile.profilePhoto);
        if (profile.tenureId) setHeaderTenureId(profile.tenureId);
      });
      fetchRequests();
      return () => {
        active = false;
      };
    }, [fetchRequests]),
  );

  /* ── Stores ───────────────────────────────────────────── */
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
      if (deckCollapsed) {
        setDeckCollapsed(false);
        setDeckExpandedVisible(true);
        collapse.value = withTiming(0, {duration: 200});
      }
    } else if (selectedIdx >= meetItems.length) {
      setSelectedIdx(0);
    }
  }, [meetItems.length, selectedIdx, deckScrollX, deckCollapsed, collapse]);

  const selectedItem = meetItems[selectedIdx] ?? null;
  const selectedId = selectedItem?.id ?? null;

  /* ── Deck collapse: map tap collapses (only), capsule expands ─ */
  const collapseDeck = useCallback(() => {
    if (meetItems.length === 0 || deckCollapsed) {
      return;
    }
    setDeckCollapsed(true);
    cancelAnimation(collapse);
    collapse.value = withTiming(1, {duration: 220, easing: CLOSE_EASING}, finished => {
      if (finished) {
        runOnJS(setDeckExpandedVisible)(false);
      }
    });
  }, [meetItems.length, deckCollapsed, collapse]);

  const expandDeck = useCallback(() => {
    setDeckExpandedVisible(true);
    setDeckCollapsed(false);
    cancelAnimation(collapse);
    collapse.value = withTiming(0, {duration: 260, easing: OPEN_EASING});
  }, [collapse]);

  const scrollToIdx = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, meetItems.length - 1));
      setSelectedIdx(clamped);
      deckScrollX.value = clamped * CARD_INTERVAL;
      deckRef.current?.scrollToOffset({offset: clamped * CARD_INTERVAL, animated: true});
    },
    [deckScrollX, meetItems.length],
  );

  const onSelectById = useCallback(
    (id: string) => {
      const idx = meetItems.findIndex(item => item.id === id);
      if (idx < 0) {
        return;
      }
      expandDeck();
      scrollToIdx(idx);
    },
    [meetItems, expandDeck, scrollToIdx],
  );

  /* ── Map ↔ deck sync ──────────────────────────────────── */
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
      top: topFloatHeight + 16,
      right: 24,
      bottom: DECK_CARD_HEIGHT + MAIN_TAB_BAR_RESERVE + Math.max(insets.bottom, 8) + 44,
      left: 24,
    }),
    [topFloatHeight, insets.bottom],
  );

  /* ── Navigation ───────────────────────────────────────── */
  const stackNav = () => navigation.getParent();

  const openProfile = useCallback(() => {
    navigation.navigate('UserProfile');
  }, [navigation]);

  const openAlertsTab = useCallback(() => {
    navigation.navigate('Alerts');
  }, [navigation]);

  const cacheMenuAnchor = useCallback(() => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      const btnW = width > 0 ? width : 44;
      const btnH = height > 0 ? height : 44;
      const anchor: AccountMenuAnchor = {
        top: y + btnH + 8,
        right: Math.max(8, SW - x - btnW),
      };
      accountMenuAnchorRef.current = anchor;
      setAccountMenuAnchor(anchor);
    });
  }, []);

  const openAccountMenu = useCallback(() => {
    const cached = accountMenuAnchorRef.current;
    if (cached) {
      setAccountMenuAnchor(cached);
      setAccountMenuOpen(true);
    }
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      const btnW = width > 0 ? width : 44;
      const btnH = height > 0 ? height : 44;
      const anchor: AccountMenuAnchor = {
        top: y + btnH + 8,
        right: Math.max(8, SW - x - btnW),
      };
      accountMenuAnchorRef.current = anchor;
      setAccountMenuAnchor(anchor);
      setAccountMenuOpen(true);
    });
  }, []);

  useEffect(() => {
    setAccountMenuReady(true);
    const id = requestAnimationFrame(() => cacheMenuAnchor());
    return () => cancelAnimationFrame(id);
  }, [cacheMenuAnchor]);

  const closeAccountMenu = useCallback(() => {
    setAccountMenuOpen(false);
  }, []);

  const handleAccountAction = useCallback(
    (action: AccountMenuAction) => {
      switch (action) {
        case 'viewProfile':
          navigation.navigate('UserProfile');
          break;
        case 'settings':
          navigation.navigate('Settings');
          break;
        case 'help':
          navigation.navigate('SettingsDetail', {itemId: 'help-support'});
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  const openActiveChat = () => {
    if (!activeSession) { return; }
    stackNav()?.navigate('Conversation', {
      chatFlow: 'active',
      mateName: activeSession.mateName,
      mateTenureId: activeSession.mateTenureId,
      mateAvatar: activeSession.mateAvatar,
      sessionLabel: formatMeetRange(activeSession.fromDateTime, activeSession.toDateTime),
      initialElapsedSec: elapsedSec,
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

  /* ── Search overlay ───────────────────────────────────── */
  const focusInput = useCallback(() => { searchInputRef.current?.focus(); }, []);

  const openSearch = () => {
    searchClosingRef.current = false;
    setSearchClosing(false);
    setSearchElevated(false);
    setSearchOpen(true);
    cancelAnimation(searchProgress);
    searchProgress.value = 0;
    searchProgress.value = withTiming(1, {duration: SEARCH_OPEN_MS, easing: OPEN_EASING}, done => {
      if (done) {
        runOnJS(setSearchElevated)(true);
        runOnJS(focusInput)();
      }
    });
  };

  const finishClose = useCallback(() => {
    searchClosingRef.current = false;
    setSearchClosing(false);
    setSearchOpen(false);
    Keyboard.dismiss();
  }, []);

  const closeSearch = useCallback(() => {
    if (!searchOpen || searchClosingRef.current) { return; }
    searchClosingRef.current = true;
    setSearchClosing(true);
    setSearchElevated(false);
    setFilterModalOpen(false);
    cancelAnimation(searchProgress);
    searchProgress.value = withTiming(0, {duration: SEARCH_CLOSE_MS, easing: CLOSE_EASING}, done => {
      if (done) { runOnJS(finishClose)(); }
    });
  }, [searchOpen, searchProgress, finishClose]);

  const applyFilters = useCallback((applied: SearchFilters) => {
    const n = normalizeSearchFilters(applied);
    setSearchFilters(n);
    if (n.category && searchQuery.trim().length === 0) { setSearchQuery(n.category); }
    setFilterModalOpen(false);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchFilters(createDefaultSearchFilters());
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (accountMenuOpen) {
        accountMenuRef.current?.dismiss();
        return true;
      }
      if (!searchOpen) {
        return false;
      }
      if (filterModalOpen) {
        setFilterModalOpen(false);
        return true;
      }
      closeSearch();
      return true;
    });
    return () => sub.remove();
  }, [accountMenuOpen, searchOpen, filterModalOpen, closeSearch]);

  /* ── Search overlay: slide + fade on same progress ─────── */
  const searchOverlayStyle = useAnimatedStyle(() => ({
    opacity: searchProgress.value,
    transform: [
      {
        translateY: interpolate(
          searchProgress.value,
          [0, 1],
          [SEARCH_SLIDE, 0],
        ),
      },
    ],
    elevation: Math.round(
      interpolate(
        searchProgress.value,
        [0, 0.92, 1],
        [0, 0, 1000],
        Extrapolation.CLAMP,
      ),
    ),
  }));

  /* ── Deck page indicator ──────────────────────────────── */
  const indicatorStyle = useAnimatedStyle(() => {
    const slot = 22;
    const progress = deckScrollX.value / CARD_INTERVAL;
    return {transform: [{translateX: progress * slot}]};
  });

  /* ── Collapse animations ──────────────────────────────── */
  const expandedDeckStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapse.value, [0, 0.55, 1], [1, 0, 0]),
    transform: [
      {translateY: interpolate(collapse.value, [0, 1], [0, 56])},
      {scale: interpolate(collapse.value, [0, 1], [1, 0.96])},
    ],
  }));

  const capsuleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapse.value, [0, 0.5, 1], [0, 0, 1]),
    transform: [
      {translateY: interpolate(collapse.value, [0, 1], [28, 0])},
      {scale: interpolate(collapse.value, [0, 1], [0.9, 1])},
    ],
  }));

  const allDatesChipStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(collapse.value, [0, 0.32, 0.52], [0.1, 0, 0]),
    elevation: interpolate(collapse.value, [0, 0.32, 0.52], [4, 0, 0]),
  }));

  const capsuleShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(collapse.value, [0.45, 0.68, 1], [0, 0.1, 0.14]),
    elevation: interpolate(collapse.value, [0.45, 0.68, 1], [0, 4, 10]),
  }));

  /* ── Deck card ────────────────────────────────────────── */
  const renderDeckCard = useCallback(
    ({item, index}: {item: HomeMeetItem; index: number}) => (
      <MeetDeckCard
        item={item}
        index={index}
        deckScrollX={deckScrollX}
        collapse={collapse}
        onPress={handleMeetPress}
      />
    ),
    [deckScrollX, collapse, handleMeetPress],
  );

  return (
    <View style={styles.root}>
      {/* Search overlay — unmounted when closed so elevation cannot ghost on the map */}
      {searchOpen || searchClosing ? (
        <Animated.View
          style={[styles.searchOverlay, searchOverlayStyle]}
          pointerEvents={searchOpen && !searchClosing ? 'auto' : 'none'}
          accessibilityViewIsModal={searchOpen}>
          <SearchPanel
            elevated={searchElevated}
            onClose={closeSearch}
            stackNavigation={stackNav() ?? undefined}
            inputRef={searchInputRef}
            autoFocus={false}
            query={searchQuery}
            onChangeQuery={setSearchQuery}
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            onOpenFilters={() => setFilterModalOpen(true)}
            onClearFilters={clearSearch}
          />
        </Animated.View>
      ) : null}

      {/* Filter modal — above search overlay */}
      {searchOpen && filterModalOpen ? (
        <SearchFilterModal
          visible
          filters={searchFilters}
          districts={SEARCH_DISTRICTS}
          categories={SEARCH_CATEGORY_OPTIONS}
          onClose={() => setFilterModalOpen(false)}
          onApply={applyFilters}
        />
      ) : null}

      {/* ── Full-screen map ─────────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        <HomeMapView
          focusCoordinate={selectedItem?.coordinate ?? null}
          markers={mapMarkers}
          mapPadding={mapPadding}
          onMapPress={collapseDeck}
          locationLabel={userLocation.locationLine}
          userLocation={{
            region: userLocation.region,
            loading: userLocation.loading,
            permissionDenied: userLocation.permissionDenied,
            refresh: userLocation.refresh,
          }}
        />
      </View>

      {/* ── Floating controls over the map ──────────────── */}
      <View
        style={[styles.topFloat, {paddingTop: insets.top + 8}]}
        pointerEvents="box-none"
        onLayout={e => setTopFloatHeight(e.nativeEvent.layout.height)}>
        <View style={styles.topRow} pointerEvents="box-none">
          {/* Identity pill */}
          <Pressable
            style={({pressed}) => [styles.identityPill, pressed && {opacity: 0.88}]}
            onPress={openProfile}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            {headerAvatar ? (
              <Image source={{uri: headerAvatar}} style={styles.identityAvatar} />
            ) : (
              <View style={[styles.identityAvatar, styles.identityAvatarPlaceholder]}>
                <Text style={styles.identityAvatarInitial}>
                  {(headerName || 'Y').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.identityText}>
              <Text style={styles.identityGreeting} numberOfLines={1}>
                {getTimeGreeting()}
              </Text>
              <Text style={styles.identityName} numberOfLines={1}>
                {headerName || 'Your profile'}
              </Text>
              <Pressable
                onPress={
                  userLocation.permissionDenied ? userLocation.refresh : undefined
                }
                disabled={!userLocation.permissionDenied}
                hitSlop={4}
                accessibilityLabel={`Current location: ${userLocation.locationLine}`}>
                <Text style={styles.identityLocation} numberOfLines={1}>
                  {userLocation.locationLine}
                  {headerTenureId ? ` · ${headerTenureId}` : ''}
                </Text>
              </Pressable>
            </View>
          </Pressable>

          {/* Floating action buttons */}
          <View style={styles.iconRow} pointerEvents="box-none">
            <View style={styles.iconShadow}>
              <HeaderIconButton
                onPress={openAlertsTab}
                accessibilityLabel="Notifications">
                <BellIcon />
              </HeaderIconButton>
            </View>
            <View
              ref={menuButtonRef}
              collapsable={false}
              style={styles.iconShadow}
              onLayout={cacheMenuAnchor}>
              <HeaderIconButton
                onPress={openAccountMenu}
                accessibilityLabel="Account menu">
                <MenuIcon />
              </HeaderIconButton>
            </View>
          </View>
        </View>

        {/* Floating search pill */}
        <Pressable
          style={styles.searchBar}
          onPress={openSearch}
          accessibilityRole="search">
          <Text style={styles.searchIcon}>⌕</Text>
          {searchQuery.length > 0 ? (
            <Text style={styles.searchValue} numberOfLines={1}>{searchQuery}</Text>
          ) : (
            <Animated.Text
              style={[styles.searchPlaceholder, placeholderAnimStyle]}
              numberOfLines={1}>
              {SEARCH_PHRASES[phraseIdx]}
            </Animated.Text>
          )}
          <Pressable
            style={[
              styles.filterBtn,
              searchActiveCount > 0 && styles.filterBtnActive,
            ]}
            onPress={() => (searchOpen ? setFilterModalOpen(true) : openSearch())}>
            <View style={styles.filterLines}>
              <View style={styles.filterLine} />
              <View style={[styles.filterLine, {width: 10}]} />
              <View style={styles.filterLine} />
            </View>
            {searchActiveCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{searchActiveCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </View>

      {/* ── Bottom synced meet deck ─────────────────────── */}
      <View
        style={[
          styles.deckWrap,
          {paddingBottom: insets.bottom + MAIN_TAB_BAR_RESERVE},
        ]}
        pointerEvents="box-none">
        {meetItems.length > 0 ? (
          <>
            {/* Expanded deck — unmounted after collapse so native elevation cannot ghost on map */}
            {deckExpandedVisible ? (
            <Animated.View
              style={expandedDeckStyle}
              pointerEvents={deckCollapsed ? 'none' : 'box-none'}>
              {meetItems.length > 1 ? (
                <View style={styles.deckTopRow} pointerEvents="box-none">
                  <Animated.View style={allDatesChipStyle}>
                    <Pressable
                      style={({pressed}) => [
                        styles.allDatesBtn,
                        pressed && {opacity: 0.85},
                      ]}
                      onPress={() => setAllDatesOpen(true)}
                      accessibilityRole="button"
                      accessibilityLabel="Show all meet dates">
                      <Text style={styles.allDatesText}>
                        All dates · {meetItems.length}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              ) : null}
              <AnimatedDeck
                ref={deckRef}
                data={meetItems}
                keyExtractor={item => item.id}
                renderItem={renderDeckCard}
                horizontal
                scrollEnabled={!deckCollapsed}
                removeClippedSubviews={Platform.OS === 'ios'}
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
            </Animated.View>
            ) : null}

            {/* Collapsed capsule — tap to expand */}
            <Animated.View
              style={[
                styles.capsuleWrap,
                {bottom: insets.bottom + MAIN_TAB_BAR_RESERVE + 10},
                capsuleStyle,
              ]}
              pointerEvents={deckCollapsed ? 'box-none' : 'none'}>
              <Animated.View style={capsuleShadowStyle}>
                <Pressable
                  style={({pressed}) => [styles.capsule, pressed && {opacity: 0.92}]}
                  onPress={expandDeck}
                  accessibilityRole="button"
                  accessibilityLabel="Expand meet dates">
                  <Text style={styles.capsuleLabel}>
                    Meet dates
                    <Text style={styles.capsuleCount}> · {meetItems.length}</Text>
                  </Text>
                  <Text style={styles.capsuleChevron} allowFontScaling={false}>
                    ⌃
                  </Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </>
        ) : (
          <View style={styles.emptyDeck}>
            <Text style={styles.emptyTitle}>Your map is clear</Text>
            <Text style={styles.emptyBody}>
              You're among the first here. When you send or receive a request and it
              gets confirmed, your meet dates will pin to this map.
            </Text>
            <Pressable
              style={({pressed}) => [styles.emptyAction, pressed && {opacity: 0.85}]}
              onPress={openSearch}>
              <Text style={styles.emptyActionText}>Find a mate</Text>
            </Pressable>
          </View>
        )}
      </View>

      {accountMenuReady ? (
        <AccountMenuSheet
          ref={accountMenuRef}
          keepAlive
          visible={accountMenuOpen}
          anchor={accountMenuAnchor ?? accountMenuAnchorRef.current}
          onClose={closeAccountMenu}
          onSelect={handleAccountAction}
        />
      ) : null}

      <HomeMeetAllSheet
        visible={allDatesOpen}
        items={meetItems}
        selectedId={selectedId}
        onClose={() => setAllDatesOpen(false)}
        onSelect={onSelectById}
      />
    </View>
  );
};

export default HomeScreen;

/* ─────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: K.bg},

  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F6F8FA',
    zIndex: 1000,
  },

  /* ── Floating controls ───────────────────────────────── */
  topFloat: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: H_PAD,
    zIndex: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  identityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 6,
    paddingRight: 16,
    paddingVertical: 6,
    backgroundColor: K.glassBg,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    maxWidth: SW * 0.62,
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 12},
      android: {elevation: 5},
    }),
  },
  identityAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: K.surface,
  },
  identityAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: K.accentSoft,
  },
  identityAvatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: K.accent,
  },
  identityText: {minWidth: 0, flexShrink: 1},
  identityGreeting: {fontSize: 11, fontWeight: '600', color: K.textMuted},
  identityName: {fontSize: 16, fontWeight: '800', color: K.text, letterSpacing: -0.3},
  identityLocation: {
    fontSize: 12,
    fontWeight: '600',
    color: K.textSec,
    marginTop: 1,
  },
  iconRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  iconShadow: {
    borderRadius: 22,
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 10},
      android: {elevation: 5},
    }),
  },

  /* ── Search pill ─────────────────────────────────────── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    height: 52,
    backgroundColor: K.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.08, shadowRadius: 14},
      android: {elevation: 4},
    }),
  },
  searchIcon: {fontSize: 20, color: K.textMuted},
  searchPlaceholder: {flex: 1, fontSize: 15, fontWeight: '600', color: K.textMuted},
  searchValue: {flex: 1, fontSize: 15, fontWeight: '600', color: K.text},
  filterBtn: {
    width: 40, height: 40,
    borderRadius: 13,
    backgroundColor: K.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {borderColor: K.accent, backgroundColor: K.accentSoft},
  filterLines: {gap: 3.5, alignItems: 'center'},
  filterLine: {height: 2, width: 16, borderRadius: 1, backgroundColor: K.textSec},
  filterBadge: {
    position: 'absolute', top: -5, right: -5,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: K.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: K.bg,
  },
  filterBadgeText: {color: K.bg, fontSize: 9, fontWeight: '900'},

  /* ── Deck ────────────────────────────────────────────── */
  deckWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    zIndex: 20,
  },
  deckTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: H_PAD,
    marginBottom: 8,
  },
  allDatesBtn: {
    backgroundColor: K.glassBg,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowRadius: 8,
      },
      android: {},
    }),
  },
  allDatesText: {fontSize: 13, fontWeight: '800', color: K.accent, letterSpacing: -0.1},

  deckContent: {paddingHorizontal: H_PAD, paddingTop: 14, paddingBottom: 22},
  cardPage: {width: CARD_W, marginRight: CARD_GAP},
  deckCardShell: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowRadius: 22,
      },
      android: {},
    }),
  },
  deckCard: {
    minHeight: DECK_CARD_HEIGHT,
    backgroundColor: K.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: K.borderHigh,
    padding: 16,
    justifyContent: 'space-between',
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

  /* ── Collapsed capsule (wide "Meet dates · N" bar) ───── */
  capsuleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: H_PAD,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 22,
    backgroundColor: K.card,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowRadius: 20},
      android: {},
    }),
  },
  capsuleLabel: {fontSize: 17, fontWeight: '800', color: K.text, letterSpacing: -0.3},
  capsuleCount: {fontSize: 15, fontWeight: '600', color: K.textMuted},
  capsuleChevron: {fontSize: 18, fontWeight: '900', color: K.textMuted},

  /* ── Dots ────────────────────────────────────────────── */
  dots: {alignItems: 'center', marginTop: 10},
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

  /* ── Empty ───────────────────────────────────────────── */
  emptyDeck: {
    marginHorizontal: H_PAD,
    backgroundColor: K.glassBg,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: K.borderHigh,
    padding: 22,
    ...Platform.select({
      ios: {shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.1, shadowRadius: 20},
      android: {elevation: 8},
    }),
  },
  emptyTitle: {fontSize: 16, fontWeight: '800', color: K.text, marginBottom: 6, letterSpacing: -0.3},
  emptyBody: {fontSize: 13, fontWeight: '500', color: K.textSec, lineHeight: 19, marginBottom: 16},
  emptyAction: {
    alignSelf: 'flex-start',
    backgroundColor: K.accentSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: K.accentBorder,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  emptyActionText: {fontSize: 14, fontWeight: '800', color: K.accent},
});
