import React, {useMemo, useRef, useState} from 'react';
import {usePreventAuthBackOnHome} from '../hooks/usePreventAuthBackOnHome';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import HomeUpdateModal, {
  MenuAnchor,
} from '../components/home/HomeUpdateModal';
import {UI} from '../theme/ui';
import HomeMapView from '../components/home/HomeMapView';
import HomeSearchOverlay from '../components/home/HomeSearchOverlay';
import {useAppDialog} from '../context/DialogContext';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {useActiveSessionStore} from '../store/activeSessionStore';
import {useElapsedTimer} from '../hooks/useElapsedTimer';
import {
  extractMeetDateLabel,
  formatElapsedHMS,
  formatMeetRange,
  meetSectionLabel,
} from '../utils/meetTime';
import {MateRequest} from '../types/mateRequest';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.16;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.62;

const CURRENT_USER_AVATAR = 'https://i.pravatar.cc/150?img=5';

const HomeScreen = ({navigation}: any) => {
  usePreventAuthBackOnHome();
  const {showAlert} = useAppDialog();
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateMenuAnchor, setUpdateMenuAnchor] = useState<MenuAnchor | null>(
    null,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const profileChipRef = useRef<View>(null);

  const sent = useMateRequestsStore(s => s.sent);
  const received = useMateRequestsStore(s => s.received);
  const activeSession = useActiveSessionStore(s => s.session);
  const elapsedSec = useElapsedTimer(
    activeSession?.startedAt ?? null,
    Boolean(activeSession),
  );

  const openUpdateMenu = () => {
    profileChipRef.current?.measureInWindow((x, y, width, height) => {
      setUpdateMenuAnchor({x, y, width, height});
      setUpdateModalVisible(true);
    });
  };

  const closeUpdateMenu = () => {
    setUpdateModalVisible(false);
    setUpdateMenuAnchor(null);
  };

  const pendingSent = sent.filter(r => r.status === 'pending');
  const confirmedSent = sent.filter(r => r.status === 'confirmed');
  const pendingReceived = received.filter(r => r.status === 'pending');
  const confirmedReceived = received.filter(r => r.status === 'confirmed');

  const incomingRequestLine = (req: MateRequest) =>
    req.requesterPronoun === 'he' ? 'he requested :' : 'she requested :';

  const meetCount = useMemo(() => {
    let n =
      pendingSent.length +
      pendingReceived.length +
      confirmedSent.length +
      confirmedReceived.length;
    if (activeSession) {
      n += 1;
    }
    return n;
  }, [
    activeSession,
    pendingSent.length,
    pendingReceived.length,
    confirmedSent.length,
    confirmedReceived.length,
  ]);

  const stackNav = () => navigation.getParent();

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

  const renderDateHeader = (fromDateTime: string) => (
    <Text style={styles.cardDateLabel}>{meetSectionLabel(fromDateTime)}</Text>
  );

  /** White — pending (yet to confirm / waiting) */
  const renderPendingCard = (
    req: MateRequest,
    actionLine: string,
    onPress: () => void,
  ) => {
    const statusLabel =
      req.direction === 'sent' ? 'waiting' : 'yet to confirm';
    return (
    <Pressable
      key={req.id}
      onPress={onPress}
      style={({pressed}) => [
        styles.pendingCard,
        pressed && styles.cardPressed,
      ]}>
      <Image source={{uri: req.mateAvatar}} style={styles.profileImage} />
      <View style={styles.cardMiddleSection}>
        <Text style={styles.requestName}>{req.mateName}</Text>
        <Text style={styles.requestId}>Tenure id : {req.mateTenureId}</Text>
      </View>
      <View style={styles.cardRightSection}>
        <Text style={styles.requestActionText}>{actionLine}</Text>
        <Text style={styles.blueText}>{req.categoryLabel}</Text>
        <Text style={styles.meetDate}>
          meet date {extractMeetDateLabel(req.fromDateTime)}
        </Text>
        <Text style={styles.pendingText}>{statusLabel}</Text>
      </View>
    </Pressable>
    );
  };

  /** Pink — you requested, confirmed */
  const renderConfirmedSentCard = (req: MateRequest) => (
    <Pressable
      key={req.id}
      onPress={() => openConfirmedChat(req)}
      style={({pressed}) => [
        styles.outgoingCard,
        pressed && styles.cardPressed,
      ]}>
      <Image source={{uri: req.mateAvatar}} style={styles.profileImage} />
      <View style={styles.cardMiddleSection}>
        <Text style={styles.requestName}>{req.mateName}</Text>
        <Text style={styles.requestId}>Tenure id : {req.mateTenureId}</Text>
      </View>
      <View style={styles.cardRightSection}>
        <Text style={styles.requestActionText}>you requested :</Text>
        <Text style={styles.blueText}>{req.categoryLabel}</Text>
        <Text style={styles.meetDate}>
          meet date {extractMeetDateLabel(req.fromDateTime)}
        </Text>
        <Text style={styles.confirmedText}>confirmed</Text>
      </View>
    </Pressable>
  );

  /** Cream — she/he requested, confirmed */
  const renderConfirmedReceivedCard = (req: MateRequest) => (
    <Pressable
      key={req.id}
      onPress={() => openConfirmedChat(req)}
      style={({pressed}) => [
        styles.incomingCard,
        pressed && styles.cardPressed,
      ]}>
      <Image source={{uri: req.mateAvatar}} style={styles.profileImage} />
      <View style={styles.cardMiddleSection}>
        <Text style={styles.requestName}>{req.mateName}</Text>
        <Text style={styles.requestId}>Tenure id : {req.mateTenureId}</Text>
      </View>
      <View style={styles.cardRightSection}>
        <Text style={styles.requestActionText}>
          {incomingRequestLine(req)}
        </Text>
        <Text style={styles.blueText}>{req.categoryLabel}</Text>
        <Text style={styles.meetDate}>
          meet date {extractMeetDateLabel(req.fromDateTime)}
        </Text>
        <Text style={styles.confirmedText}>confirmed</Text>
      </View>
    </Pressable>
  );

  const animatedHeight = useRef(
    new Animated.Value(COLLAPSED_HEIGHT),
  ).current;

  const lastHeight = useRef(COLLAPSED_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({

      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {

        let newHeight = lastHeight.current - gestureState.dy;

        if (newHeight < COLLAPSED_HEIGHT) {
          newHeight = COLLAPSED_HEIGHT;
        }

        if (newHeight > EXPANDED_HEIGHT) {
          newHeight = EXPANDED_HEIGHT;
        }

        animatedHeight.setValue(newHeight);
      },

      onPanResponderRelease: (_, gestureState) => {

        if (gestureState.dy < -80) {

          Animated.spring(animatedHeight, {
            toValue: EXPANDED_HEIGHT,
            useNativeDriver: false,
          }).start();

          lastHeight.current = EXPANDED_HEIGHT;

        } else if (gestureState.dy > 80) {

          Animated.spring(animatedHeight, {
            toValue: COLLAPSED_HEIGHT,
            useNativeDriver: false,
          }).start();

          lastHeight.current = COLLAPSED_HEIGHT;

        } else {

          Animated.spring(animatedHeight, {
            toValue: lastHeight.current,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <>
      <StatusBar
        backgroundColor="#F4F4F4"
        barStyle="dark-content"
      />

      <View style={styles.container}>

        {/* Header */}
        <View style={styles.topContainer}>

          {/* Location */}
          <View style={styles.locationContainer}>

            <View>

              <Text style={styles.locationLabel}>
                your current location
              </Text>

              <Text style={styles.locationText}>
                5VH8+MQ Belman, Karnataka 576111
              </Text>

            </View>

            <View ref={profileChipRef} collapsable={false}>
              <Pressable
                style={({pressed}) => [
                  styles.profileChip,
                  pressed && styles.profileChipPressed,
                  updateModalVisible && styles.profileChipActive,
                ]}
                onPress={openUpdateMenu}
                accessibilityRole="button"
                accessibilityLabel="Profile and settings menu">
                <Image
                  source={{uri: CURRENT_USER_AVATAR}}
                  style={styles.chipAvatar}
                />
                <Text style={styles.chipLabel}>Update</Text>
                <Text style={styles.chipChevron}>▾</Text>
              </Pressable>
            </View>

          </View>

          {/* Search */}
          <Pressable
            style={({pressed}) => [
              styles.searchBar,
              pressed && styles.searchBarPressed,
            ]}
            onPress={() => setSearchOpen(true)}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>Search mates, categories…</Text>
            <Text style={styles.heartIcon}>♡</Text>
          </Pressable>

        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <HomeMapView />
        </View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              height: animatedHeight,
            },
          ]}>

          {/* Drag Area */}
          <View
            {...panResponder.panHandlers}
            style={styles.dragArea}>

            <View style={styles.drawerHandle} />

            <Text style={styles.drawerTitle}>
              {meetCount} Meet Date{meetCount === 1 ? '' : "'s"}
            </Text>

          </View>

          {/* Drawer Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.drawerScroll}>

            {activeSession ? (
              <Pressable
                onPress={openActiveConversation}
                style={({pressed}) => [
                  styles.activeCard,
                  pressed && styles.activeCardPressed,
                ]}>
                <View style={styles.activeLeftSection}>
                  <Image
                    source={{uri: activeSession.mateAvatar}}
                    style={styles.profileImage}
                  />
                  <View style={styles.activeNameContainer}>
                    <Text style={styles.activeName}>
                      {activeSession.mateName}
                    </Text>
                    <Text style={styles.activeId}>
                      Tenure id : {activeSession.mateTenureId}
                    </Text>
                  </View>
                </View>
                <View style={styles.tenureTimeBox}>
                  <Text style={styles.tenureText}>Tenure time ⏱</Text>
                  <Text style={styles.timerText}>
                    {formatElapsedHMS(elapsedSec)}
                  </Text>
                </View>
                <Text style={styles.activeDateText}>
                  {formatMeetRange(
                    activeSession.fromDateTime,
                    activeSession.toDateTime,
                  )}
                </Text>
                <Text style={styles.openChatHint}>
                  Tap to open conversation
                </Text>
              </Pressable>
            ) : null}

            {confirmedSent.map(req => (
              <React.Fragment key={req.id}>
                {renderDateHeader(req.fromDateTime)}
                {renderConfirmedSentCard(req)}
              </React.Fragment>
            ))}

            {confirmedReceived.map(req => (
              <React.Fragment key={req.id}>
                {renderDateHeader(req.fromDateTime)}
                {renderConfirmedReceivedCard(req)}
              </React.Fragment>
            ))}

            {pendingSent.map(req => (
              <React.Fragment key={req.id}>
                {renderDateHeader(req.fromDateTime)}
                {renderPendingCard(req, 'you requested :', () =>
                  openSentDetail(req.id),
                )}
              </React.Fragment>
            ))}

            {pendingReceived.map(req => (
              <React.Fragment key={req.id}>
                {renderDateHeader(req.fromDateTime)}
                {renderPendingCard(req, incomingRequestLine(req), () =>
                  openReceivedDetail(req.id),
                )}
              </React.Fragment>
            ))}

            {meetCount === 0 ? (
              <Text style={styles.emptyDrawer}>
                No meet dates yet. Search for a mate and send a request.
              </Text>
            ) : null}
          </ScrollView>

        </Animated.View>

      </View>

      <HomeSearchOverlay
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        stackNavigation={stackNav() ?? undefined}
      />

      <HomeUpdateModal
        visible={updateModalVisible}
        anchor={updateMenuAnchor}
        profileAvatar={CURRENT_USER_AVATAR}
        onClose={closeUpdateMenu}
        onOpenProfile={() => {
          closeUpdateMenu();
          navigation.getParent()?.navigate('UserProfile');
        }}
        onPrivacyPolicy={() => {
          closeUpdateMenu();
          showAlert({
            title: 'Privacy Policy',
            message: 'Privacy policy content will be available here.',
          });
        }}
        onTrustyAlert={() => {
          closeUpdateMenu();
          showAlert({
            title: 'Trusty alert',
            message: 'Safety alerts and trusted contacts will appear here.',
          });
        }}
      />
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },

  topContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 22,
  },

  locationLabel: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    width: 220,
    lineHeight: 22,
  },

  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 22,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: UI.borderInput,
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  profileChipPressed: {
    opacity: 0.92,
    transform: [{scale: 0.98}],
  },
  profileChipActive: {
    borderColor: UI.brand,
    backgroundColor: '#F0F7FA',
  },
  chipAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: UI.brand,
    marginRight: 2,
  },
  chipChevron: {
    fontSize: 10,
    color: UI.brandMuted,
    marginTop: 2,
  },

  searchBar: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBarPressed: {
    opacity: 0.92,
    transform: [{scale: 0.99}],
  },

  searchIcon: {
    fontSize: 18,
    color: '#9A9A9A',
    marginRight: 10,
  },

  searchText: {
    flex: 1,
    color: '#9A9A9A',
    fontSize: 16,
  },

  heartIcon: {
    fontSize: 20,
    color: '#003B57',
  },

  mapContainer: {
    flex: 1,
    backgroundColor: '#D8D8D8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666666',
  },

  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    elevation: 20,
  },

  dragArea: {
    paddingTop: 14,
    paddingBottom: 10,
  },

  drawerTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginTop: 12,
    marginBottom: 4,
  },

  drawerHandle: {
    width: 72,
    height: 6,
    backgroundColor: '#D2D2D2',
    borderRadius: 20,
    alignSelf: 'center',
  },

  drawerScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  sectionLabel: {
    color: '#4A4A4A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 8,
  },

  /* ACTIVE CARD */

  activeCard: {
    backgroundColor: '#003F5C',
    borderRadius: 30,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 18,
    marginBottom: 28,
  },

  activeCardPressed: {
    opacity: 0.92,
  },

  cardPressed: {
    opacity: 0.94,
  },

  openChatHint: {
    color: '#A8C5D4',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },


  activeLeftSection: {
  flexDirection: 'row',
  alignItems: 'center',
},

  profileImage: {
    width: 58,
    height: 58,
    borderRadius: 100,
  },

  activeNameContainer: {
    marginLeft: 14,
  },

  activeName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },

  activeId: {
    color: '#C7D9E3',
    fontSize: 13,
    marginTop: 6,
  },

  tenureTimeBox: {
  position: 'absolute',
  right: 18,
  top: 18,

  backgroundColor: '#FFFFFF',
  borderRadius: 40,
  paddingHorizontal: 16,
  paddingVertical: 10,

  flexDirection: 'row',
  alignItems: 'center',
},

  tenureText: {
  color: '#003F5C',
  fontSize: 12,
  fontWeight: '700',
  marginRight: 6,
},

timerText: {
  color: '#FF633D',
  fontSize: 14,
  fontWeight: '800',
},

activeDateText: {
  color: '#C5DCE6',
  fontSize: 11,
  textAlign: 'center',
  marginTop: 18,
},

  /* REQUEST DATE LABEL */

  cardDateLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 8,
  },

  /* CARDS */

  outgoingCard: {
    backgroundColor: '#F2E4E1',
    borderRadius: 28,
    padding: 18,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
  },

  incomingCard: {
    backgroundColor: '#F3E6CB',
    borderRadius: 28,
    padding: 18,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D6',
    shadowColor: '#003B57',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  cardMiddleSection: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },

  requestName: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '700',
  },

  requestId: {
    color: '#7C7C7C',
    fontSize: 12,
    marginTop: 7,
  },

  cardRightSection: {
    width: 150,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  requestActionText: {
    color: '#222222',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },

  blueText: {
    color: '#005E95',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'right',
  },

  meetDate: {
    color: '#444444',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
  },

  confirmedText: {
    color: '#35A853',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'right',
  },

  pendingText: {
    color: '#E4A000',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'right',
  },

  emptyDrawer: {
    textAlign: 'center',
    color: '#777777',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 24,
    paddingHorizontal: 12,
  },

});