import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';
import {HomeMeetItem} from '../../utils/homeMeetItems';

const {height: SCREEN_H} = Dimensions.get('window');
const OFF_Y = Math.min(SCREEN_H * 0.85, 720);
const DISMISS_DRAG_RATIO = 0.28;

type Props = {
  visible: boolean;
  items: HomeMeetItem[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
};

const HomeMeetAllSheet = ({
  visible,
  items,
  selectedId,
  onClose,
  onSelect,
}: Props) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const translateY = useRef(new Animated.Value(OFF_Y)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const dragStartY = useRef(0);
  const closingRef = useRef(false);

  const backdropOpacity = useMemo(
    () =>
      backdrop.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.2],
      }),
    [backdrop],
  );

  const snapOpen = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
      }),
    ]).start();
  }, [backdrop, translateY]);

  const runClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: OFF_Y,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      closingRef.current = false;
      if (finished) {
        onClose();
      }
    });
  }, [backdrop, onClose, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2,
      onPanResponderGrant: () => {
        translateY.stopAnimation(value => {
          dragStartY.current = value;
        });
      },
      onPanResponderMove: (_, g) => {
        const next = Math.min(
          OFF_Y,
          Math.max(0, dragStartY.current + g.dy),
        );
        translateY.setValue(next);
        backdrop.setValue(1 - next / OFF_Y);
      },
      onPanResponderRelease: (_, g) => {
        translateY.stopAnimation(value => {
          if (value > OFF_Y * DISMISS_DRAG_RATIO || g.vy > 0.65) {
            runClose();
          } else {
            snapOpen();
          }
        });
      },
      onPanResponderTerminate: () => {
        snapOpen();
      },
    }),
  ).current;

  useEffect(() => {
    if (visible && items.length > 0) {
      closingRef.current = false;
      translateY.setValue(OFF_Y);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, items.length, backdrop, translateY]);

  const onRowPress = (id: string) => {
    onSelect(id);
    runClose();
  };

  if (!visible || items.length === 0) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={runClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={runClose}>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.backdropTint,
              {opacity: backdropOpacity},
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 16,
              transform: [{translateY}],
            },
          ]}>
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handle} />
            <Text style={styles.title}>All meet dates</Text>
            <Text style={styles.sub}>{items.length} upcoming & active</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}>
            {items.map(item => {
              const selected = item.id === selectedId;
              const requestDirection = item.request?.direction;
              const isLive = item.kind === 'active' || item.pillLabel === 'LIVE';
              const isConfirmed = item.pillLabel === 'CONFIRMED';
              const needsMyConfirm =
                item.pillLabel === 'CONFIRM?' && requestDirection === 'received';
              return (
                <Pressable
                  key={item.id}
                  style={({pressed}) => [
                    styles.row,
                    isLive && styles.rowLiveBlue,
                    isConfirmed && styles.rowConfirmedPink,
                    needsMyConfirm && styles.rowPendingCream,
                    selected && styles.rowSelected,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => onRowPress(item.id)}>
                  <Image source={{uri: item.mateAvatar}} style={styles.avatar} />
                  <View style={styles.rowBody}>
                    <Text style={styles.rowName}>{item.mateName}</Text>
                    <Text style={styles.rowMeta}>{item.categoryLabel}</Text>
                    <Text style={styles.rowWhen}>{item.dateLabel}</Text>
                  </View>
                  <View
                    style={[
                      styles.rowPill,
                      item.kind === 'active' && styles.rowPillActive,
                    ]}>
                    <Text
                      style={[
                        styles.rowPillText,
                        item.kind === 'active' && styles.rowPillTextActive,
                      ]}>
                      {item.pillLabel}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default HomeMeetAllSheet;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdropTint: {
      backgroundColor: '#000000',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '78%',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    dragZone: {
      paddingTop: 10,
      paddingHorizontal: 20,
      paddingBottom: 10,
      alignItems: 'center',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.borderPill,
      marginBottom: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.brandDark,
      alignSelf: 'flex-start',
    },
    sub: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      marginBottom: 10,
      backgroundColor: c.bgElevated,
    },
    rowPressed: {opacity: 0.92},
    rowLiveBlue: {
      backgroundColor: c.meetLiveCardBg,
      borderColor: c.meetLiveCardBorder,
    },
    rowConfirmedPink: {
      backgroundColor: c.meetConfirmedCardBg,
      borderColor: c.meetConfirmedCardBorder,
    },
    rowPendingCream: {
      backgroundColor: c.meetPendingConfirmCardBg,
      borderColor: c.meetPendingConfirmCardBorder,
    },
    rowSelected: {
      borderColor: c.brand,
      borderLeftWidth: 3,
      borderLeftColor: c.brand,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.chip,
    },
    rowBody: {flex: 1},
    rowName: {
      fontSize: 15,
      fontWeight: '800',
      color: c.text,
    },
    rowMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.brand,
      marginTop: 3,
    },
    rowWhen: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 3,
    },
    rowPill: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: c.chip,
    },
    rowPillActive: {backgroundColor: c.brandDark},
    rowPillText: {
      fontSize: 9,
      fontWeight: '800',
      color: c.textSecondary,
      letterSpacing: 0.3,
    },
    rowPillTextActive: {color: '#FFFFFF'},
  });
