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
import {useTheme} from '../../context/ThemeContext';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const COLLAPSED_HEIGHT = 168;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.52;

type Props = {
  contacts: MateRequest[];
  title?: string;
};

const PreviousContactsDrawer = ({contacts, title = 'Past contacts'}: Props) => {
  const {colors} = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{contacts.length} previous connections</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled>
        {contacts.map(contact => (
          <RequestListCard
            key={contact.id}
            request={contact}
            statusText="Past"
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

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    drawer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.bg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: -4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    dragZone: {
      paddingTop: 10,
      paddingBottom: 10,
      paddingHorizontal: 20,
    },
    handle: {
      width: 46,
      height: 4,
      backgroundColor: c.borderPill,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 14,
      color: c.text,
      fontWeight: '700',
      marginBottom: 2,
    },
    subTitle: {
      fontSize: 11,
      color: c.textHint,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
  });
