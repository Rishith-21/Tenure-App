import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Reanimated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const OPEN_MS = 360;
const OPEN_EASING = Easing.out(Easing.cubic);
const OPEN_EASING_SNAP = Easing.out(Easing.quad);
const SNAP_SPRING = {damping: 24, stiffness: 320, mass: 0.8};
const CLOSE_MS = 320;
const CLOSE_EASING = Easing.out(Easing.cubic);
const FAST_OPEN_MS = 200;

/**
 * Bottom drawer: light sheet on top, full-screen black scrim (`colors.sheetScrim`)
 * behind it so the rest of the screen looks unfocused.
 */

export type DraggableBottomDrawerRef = {
  dismiss: (onDone?: () => void) => void;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxHeightRatio?: number;
  /** Content height in px (excludes safe-area padding). Use with `compactContent`. */
  fixedHeight?: number;
  /** Sheet height hugs content instead of filling max ratio (removes empty gap). */
  compactContent?: boolean;
  contentContainerStyle?: ViewStyle;
  closeOnBackdropPress?: boolean;
  /** Lift the sheet above the software keyboard (e.g. text inputs). */
  avoidKeyboard?: boolean;
  /** When true, only the handle drags — content keeps native gestures (calendars, scroll). */
  disableContentDrag?: boolean;
  /** Override open animation duration (ms). */
  openDurationMs?: number;
  /** Override close animation duration (ms). */
  closeDurationMs?: number;
};

const keyboardHeightFromEvent = (event: KeyboardEvent) =>
  Math.max(0, SCREEN_HEIGHT - event.endCoordinates.screenY);

const DraggableBottomDrawer = forwardRef<DraggableBottomDrawerRef, Props>(
  (
    {
      visible,
      onClose,
      children,
      title,
      subtitle,
      header,
      footer,
      maxHeightRatio = 0.78,
      fixedHeight,
      compactContent = false,
      contentContainerStyle,
      closeOnBackdropPress = true,
      avoidKeyboard = false,
      disableContentDrag = false,
      openDurationMs = OPEN_MS,
      closeDurationMs = CLOSE_MS,
    },
    ref,
  ) => {
    const {colors} = useTheme();
    const styles = useMemo(
      () => createStyles(colors, compactContent, fixedHeight != null, avoidKeyboard),
      [colors, compactContent, fixedHeight, avoidKeyboard],
    );
    const insets = useSafeAreaInsets();

    const openHeight = useMemo(() => {
      if (fixedHeight != null) {
        return Math.min(
          fixedHeight + Math.max(insets.bottom, 12),
          SCREEN_HEIGHT - insets.top - 24,
        );
      }
      return Math.min(
        SCREEN_HEIGHT * maxHeightRatio,
        SCREEN_HEIGHT - insets.top - 48,
      );
    }, [fixedHeight, insets.top, insets.bottom, maxHeightRatio]);

    const bottomPad = Math.max(insets.bottom, 12);
    const maxHeight = useSharedValue(openHeight);
    const sheetHeight = useSharedValue(0);
    const dragStartHeight = useSharedValue(0);
    const scrollOffsetY = useSharedValue(0);
    const keyboardInset = useSharedValue(0);
    const isDismissing = useSharedValue(false);
    const dismissing = useRef(false);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const openDurationRef = useRef(openDurationMs);
    openDurationRef.current = openDurationMs;
    const closeDurationRef = useRef(closeDurationMs);
    closeDurationRef.current = closeDurationMs;
    const openHeightRef = useRef(openHeight);
    openHeightRef.current = openHeight;
    const hasMountedRef = useRef(false);
    if (visible) {
      hasMountedRef.current = true;
    }

    const finishClose = useCallback(
      (onDone?: () => void) => {
        dismissing.current = false;
        isDismissing.value = false;
        onDone?.();
        onCloseRef.current();
      },
      [isDismissing],
    );

    const animateClose = useCallback(
      (onDone?: () => void) => {
        if (dismissing.current || isDismissing.value) {
          return;
        }
        if (avoidKeyboard) {
          Keyboard.dismiss();
        }
        dismissing.current = true;
        isDismissing.value = true;
        sheetHeight.value = withTiming(
          0,
          {duration: closeDurationRef.current, easing: CLOSE_EASING},
          finished => {
            if (finished) {
              runOnJS(finishClose)(onDone);
            }
          },
        );
      },
      [avoidKeyboard, finishClose, isDismissing, sheetHeight],
    );

    const dismiss = useCallback(
      (onDone?: () => void) => {
        animateClose(onDone);
      },
      [animateClose],
    );

    useImperativeHandle(ref, () => ({dismiss}), [dismiss]);

    useEffect(() => {
      maxHeight.value = openHeight;
    }, [openHeight, maxHeight]);

    useEffect(() => {
      if (!visible || !avoidKeyboard) {
        keyboardInset.value = 0;
        return;
      }

      const showEvent =
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent =
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const onShow = (event: KeyboardEvent) => {
        const height = keyboardHeightFromEvent(event);
        const duration =
          Platform.OS === 'ios' && event.duration != null && event.duration > 0
            ? event.duration
            : 250;
        keyboardInset.value = withTiming(height, {
          duration,
          easing: OPEN_EASING,
        });
      };

      const onHide = (event: KeyboardEvent) => {
        const duration =
          Platform.OS === 'ios' && event.duration != null && event.duration > 0
            ? event.duration
            : 220;
        keyboardInset.value = withTiming(0, {
          duration,
          easing: CLOSE_EASING,
        });
      };

      const showSub = Keyboard.addListener(showEvent, onShow);
      const hideSub = Keyboard.addListener(hideEvent, onHide);

      return () => {
        showSub.remove();
        hideSub.remove();
        keyboardInset.value = 0;
      };
    }, [avoidKeyboard, keyboardInset, visible]);

    useLayoutEffect(() => {
      if (!visible) {
        keyboardInset.value = 0;
        return;
      }
      dismissing.current = false;
      isDismissing.value = false;
      scrollOffsetY.value = 0;
      maxHeight.value = openHeightRef.current;
      const target = openHeightRef.current;
      const duration = openDurationRef.current;
      const easing =
        duration <= FAST_OPEN_MS ? OPEN_EASING_SNAP : OPEN_EASING;
      if (duration <= 0) {
        sheetHeight.value = target;
        return;
      }
      sheetHeight.value = 0;
      sheetHeight.value = withTiming(target, {duration, easing});
    }, [isDismissing, maxHeight, scrollOffsetY, sheetHeight, visible]);

    const settleSheet = useCallback(
      (current: number, velocityY: number) => {
        'worklet';
        const maxH = maxHeight.value;
        const shouldDismiss =
          current < maxH * 0.38 ||
          velocityY > 720 ||
          (velocityY > 380 && current < maxH * 0.62);

        if (shouldDismiss) {
          if (isDismissing.value) {
            return;
          }
          isDismissing.value = true;
          sheetHeight.value = withTiming(
            0,
            {duration: CLOSE_MS, easing: CLOSE_EASING},
            finished => {
              if (finished) {
                runOnJS(finishClose)();
              }
            },
          );
          return;
        }

        sheetHeight.value = withSpring(maxH, SNAP_SPRING);
      },
      [finishClose, isDismissing, maxHeight, sheetHeight],
    );

    const dragPan = useMemo(
      () =>
        Gesture.Pan()
          .activeOffsetY([-4, 4])
          .failOffsetX([-32, 32])
          .onBegin(() => {
            dragStartHeight.value = sheetHeight.value;
          })
          .onUpdate(e => {
            const maxH = maxHeight.value;
            const next = Math.min(
              maxH,
              Math.max(0, dragStartHeight.value - e.translationY),
            );
            sheetHeight.value = next;
          })
          .onEnd(e => {
            settleSheet(sheetHeight.value, e.velocityY);
          }),
      [dragStartHeight, maxHeight, settleSheet, sheetHeight],
    );

    const contentPan = useMemo(
      () =>
        Gesture.Pan()
          .manualActivation(true)
          .failOffsetX([-32, 32])
          .onTouchesMove((e, state) => {
            if (scrollOffsetY.value > 2) {
              state.fail();
              return;
            }
            if (e.changeY > 4) {
              state.activate();
            }
          })
          .onBegin(() => {
            dragStartHeight.value = sheetHeight.value;
          })
          .onUpdate(e => {
            const maxH = maxHeight.value;
            const next = Math.min(
              maxH,
              Math.max(0, dragStartHeight.value - e.translationY),
            );
            sheetHeight.value = next;
          })
          .onEnd(e => {
            settleSheet(sheetHeight.value, e.velocityY);
          }),
      [dragStartHeight, maxHeight, scrollOffsetY, settleSheet, sheetHeight],
    );

    const drawerStyle = useAnimatedStyle(() => {
      const maxH = maxHeight.value;
      return {
        height: maxH,
        transform: [{translateY: maxH - sheetHeight.value}],
      };
    });

    const drawerHostStyle = useAnimatedStyle(() => ({
      marginBottom: keyboardInset.value,
    }));

    const scrimStyle = useAnimatedStyle(() => {
      const maxH = maxHeight.value;
      if (maxH <= 0) {
        return {opacity: 0};
      }
      return {
        opacity: interpolate(
          sheetHeight.value,
          [0, maxH],
          [0, 1],
          Extrapolation.CLAMP,
        ),
      };
    });

    const renderScrollableChild = () => {
      if (!React.isValidElement(children)) {
        return children;
      }
      const child = children as React.ReactElement<{
        onScroll?: (event: {
          nativeEvent: {contentOffset: {y: number}};
        }) => void;
        scrollEventThrottle?: number;
      }>;
      const prevOnScroll = child.props.onScroll;
      return React.cloneElement(child, {
        scrollEventThrottle: 16,
        onScroll: (event: {
          nativeEvent: {contentOffset: {y: number}};
        }) => {
          scrollOffsetY.value = event.nativeEvent.contentOffset.y;
          prevOnScroll?.(event);
        },
      });
    };

    const defaultHeader =
      title || subtitle ? (
        <View style={styles.headerBlock}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null;

    const contentBody = (
      <Reanimated.View style={[styles.content, contentContainerStyle]}>
        {renderScrollableChild()}
      </Reanimated.View>
    );

    if (!hasMountedRef.current && !visible) {
      return null;
    }

    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => dismiss()}>
        <GestureHandlerRootView style={styles.gestureRoot}>
          <Reanimated.View
            style={[
              styles.overlay,
              {backgroundColor: colors.sheetScrim},
              scrimStyle,
            ]}>
            {closeOnBackdropPress ? (
              <Pressable
                style={styles.scrimPress}
                onPress={() => dismiss()}
                accessibilityRole="button"
                accessibilityLabel="Close"
              />
            ) : null}

            <Reanimated.View
              style={[styles.drawerHost, drawerHostStyle]}
              pointerEvents="box-none">
              <Reanimated.View
                pointerEvents="auto"
                style={[
                  styles.drawer,
                  drawerStyle,
                  {paddingBottom: bottomPad},
                ]}>
                <View style={styles.body}>
                  <View style={styles.dragZone} collapsable={false}>
                    <GestureDetector gesture={dragPan}>
                      <View style={styles.handleHit}>
                        <View style={styles.handle} />
                      </View>
                    </GestureDetector>
                    {header ?? defaultHeader}
                  </View>

                  {disableContentDrag ? (
                    contentBody
                  ) : (
                    <GestureDetector gesture={contentPan}>
                      {contentBody}
                    </GestureDetector>
                  )}

                  {footer ? <View style={styles.footer}>{footer}</View> : null}
                </View>
              </Reanimated.View>
            </Reanimated.View>
          </Reanimated.View>
        </GestureHandlerRootView>
      </Modal>
    );
  },
);

DraggableBottomDrawer.displayName = 'DraggableBottomDrawer';

export default DraggableBottomDrawer;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  compact: boolean,
  compactFixed: boolean,
  keyboardAware: boolean,
) =>
  StyleSheet.create({
    gestureRoot: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrimPress: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    drawerHost: {
      width: '100%',
      zIndex: 1,
      elevation: 40,
      overflow: keyboardAware ? 'visible' : 'hidden',
    },
    drawer: {
      width: '100%',
      elevation: 32,
      backgroundColor: c.bg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: -8},
      shadowOpacity: 0.35,
      shadowRadius: 24,
      overflow: 'hidden',
    },
    body: {
      width: '100%',
      flexDirection: 'column',
      flex: compactFixed ? 1 : compact ? 0 : 1,
      minHeight: compactFixed ? 0 : compact ? undefined : 0,
    },
    dragZone: {
      paddingTop: 6,
      paddingBottom: 4,
      paddingHorizontal: 20,
    },
    handleHit: {
      alignSelf: 'stretch',
      minHeight: 44,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: c.borderPill,
      borderRadius: 3,
    },
    headerBlock: {
      paddingBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.brandDark,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 2,
      lineHeight: 18,
    },
    content: {
      flexGrow: compactFixed ? 1 : compact ? 0 : 1,
      flexShrink: compactFixed ? 1 : compact ? 0 : 1,
      minHeight: compactFixed ? 0 : compact ? undefined : 0,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      backgroundColor: c.bg,
    },
  });
