import React, {useMemo, useRef, useState} from 'react';
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
import HomeUpdateModal from '../components/home/HomeUpdateModal';
import HomeMapPlaceholder from '../components/home/HomeMapPlaceholder';
import {useAppDialog} from '../context/DialogContext';
import {useMateRequestsStore} from '../store/mateRequestsStore';
import {useActiveSessionStore} from '../store/activeSessionStore';
import {useElapsedTimer} from '../hooks/useElapsedTimer';
import {
  extractMeetDateLabel,
  formatElapsedHMS,
  formatMeetRange,
} from '../utils/meetTime';
import {MateRequest} from '../types/mateRequest';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.16;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.62;

const CURRENT_USER_AVATAR = 'https://i.pravatar.cc/150?img=5';

const HomeScreen = ({navigation}: any) => {
  const {showAlert} = useAppDialog();
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  const sent = useMateRequestsStore(s => s.sent);
  const received = useMateRequestsStore(s => s.received);
  const activeSession = useActiveSessionStore(s => s.session);
  const elapsedSec = useElapsedTimer(
    activeSession?.startedAt ?? null,
    Boolean(activeSession),
  );

  const pendingSent = sent.filter(r => r.status === 'pending');
  const confirmedSent = sent.filter(r => r.status === 'confirmed');
  const pendingReceived = received.filter(r => r.status === 'pending');

  const meetCount = useMemo(() => {
    let n = pendingSent.length + pendingReceived.length + confirmedSent.length;
    if (activeSession) {
      n += 1;
    }
    return n;
  }, [
    activeSession,
    pendingSent.length,
    pendingReceived.length,
    confirmedSent.length,
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

  const renderSentCard = (req: MateRequest, confirmed: boolean) => (
    <Pressable
      key={req.id}
      onPress={() => openSentDetail(req.id)}
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
        <Text style={confirmed ? styles.confirmedText : styles.pendingText}>
          {confirmed ? 'confirmed' : 'waiting'}
        </Text>
      </View>
    </Pressable>
  );

  const renderIncomingCard = (req: MateRequest) => (
    <Pressable
      key={req.id}
      onPress={() => openReceivedDetail(req.id)}
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
        <Text style={styles.requestActionText}>requested you :</Text>
        <Text style={styles.blueText}>{req.categoryLabel}</Text>
        <Text style={styles.meetDate}>
          meet date {extractMeetDateLabel(req.fromDateTime)}
        </Text>
        <Text style={styles.pendingText}>yet to confirm</Text>
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

            <View style={styles.updateRow}>
              <Image
                source={{uri: CURRENT_USER_AVATAR}}
                style={styles.headerAvatar}
              />
              <Pressable
                style={styles.updateButton}
                onPress={() => setUpdateModalVisible(true)}>
                <Text style={styles.updateButtonText}>Update</Text>
              </Pressable>
            </View>

          </View>

          {/* Search */}
          <Pressable
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate('Search')}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>Search</Text>
            <Text style={styles.heartIcon}>♡</Text>
          </Pressable>

        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <HomeMapPlaceholder />
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

            <Text style={styles.sectionLabel}>Today</Text>

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

            {pendingSent.map(req => (
              <React.Fragment key={req.id}>
                <Text style={styles.cardDateLabel}>
                  {extractMeetDateLabel(req.fromDateTime)}
                </Text>
                {renderSentCard(req, false)}
              </React.Fragment>
            ))}

            {confirmedSent.map(req => (
              <React.Fragment key={req.id}>
                <Text style={styles.cardDateLabel}>
                  {extractMeetDateLabel(req.fromDateTime)}
                </Text>
                {renderSentCard(req, true)}
              </React.Fragment>
            ))}

            {pendingReceived.map(req => (
              <React.Fragment key={req.id}>
                <Text style={styles.cardDateLabel}>
                  {extractMeetDateLabel(req.fromDateTime)}
                </Text>
                {renderIncomingCard(req)}
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

      <HomeUpdateModal
        visible={updateModalVisible}
        profileAvatar={CURRENT_USER_AVATAR}
        onClose={() => setUpdateModalVisible(false)}
        onOpenProfile={() => {
          setUpdateModalVisible(false);
          navigation.getParent()?.navigate('UserProfile');
        }}
        onPrivacyPolicy={() => {
          setUpdateModalVisible(false);
          showAlert({
            title: 'Privacy Policy',
            message: 'Privacy policy content will be available here.',
          });
        }}
        onTrustyAlert={() => {
          setUpdateModalVisible(false);
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

  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  updateButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 32,
  },

  updateButtonText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },

  searchBar: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: '#DADADA',
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