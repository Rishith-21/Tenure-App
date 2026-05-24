import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MateRequest} from '../../types/mateRequest';
import RequestListCard from './RequestListCard';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const COLLAPSED_HEIGHT = 168;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.52;

type Props = {
  contacts: MateRequest[];
};

const PreviousContactsDrawer = ({contacts}: Props) => {
  const insets = useSafeAreaInsets();
  const animatedHeight = useRef(
    new Animated.Value(COLLAPSED_HEIGHT),
  ).current;
  const lastHeight = useRef(COLLAPSED_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        let next = lastHeight.current - g.dy;
        if (next < COLLAPSED_HEIGHT) {
          next = COLLAPSED_HEIGHT;
        }
        if (next > EXPANDED_HEIGHT) {
          next = EXPANDED_HEIGHT;
        }
        animatedHeight.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const mid = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
        let target = lastHeight.current;
        if (g.dy < -60 || (g.vy < -0.5 && lastHeight.current < mid)) {
          target = EXPANDED_HEIGHT;
        } else if (g.dy > 60 || (g.vy > 0.5 && lastHeight.current > mid)) {
          target = COLLAPSED_HEIGHT;
        }
        Animated.spring(animatedHeight, {
          toValue: target,
          useNativeDriver: false,
          friction: 9,
        }).start();
        lastHeight.current = target;
      },
    }),
  ).current;

  if (contacts.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.drawer,
        {
          height: animatedHeight,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
      <View {...panResponder.panHandlers} style={styles.dragZone}>
        <View style={styles.handle} />
        <Text style={styles.title}>previous people's messages</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled>
        {contacts.map(contact => (
          <RequestListCard
            key={contact.id}
            request={contact}
            subtitle={
              contact.expiresInDays
                ? `Expired in ${contact.expiresInDays} days`
                : formatMeetSummary(contact)
            }
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

function formatMeetSummary(contact: MateRequest): string {
  if (contact.fromDateTime) {
    return `meet ${contact.fromDateTime.split(' ').slice(0, 1).join('')}`;
  }
  return contact.categoryLabel;
}

export default PreviousContactsDrawer;

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  dragZone: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: '#D2D2D2',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    color: '#333333',
    textTransform: 'lowercase',
    marginBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
