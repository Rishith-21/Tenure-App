import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const {width: SCREEN_W} = Dimensions.get('window');

const C = {
  card: '#FFFFFF',
  text: '#111827',
  border: '#E5E7EB',
  scrim: 'rgba(17,24,39,0.32)',
} as const;

/** Snappy overflow menu — Material / WhatsApp style */
const OPEN_MS = 130;
const CLOSE_MS = 120;
const OPEN_EASING = Easing.out(Easing.quad);
const CLOSE_EASING = Easing.in(Easing.quad);

const PANEL_W = Math.min(280, Math.round(SCREEN_W * 0.52));
const PANEL_PAD_V = 6;

export type AccountMenuAction = 'viewProfile' | 'settings' | 'help';

type MenuItem = {
  id: AccountMenuAction;
  label: string;
};

const MENU_ITEMS: MenuItem[] = [
  {id: 'viewProfile', label: 'View Profile'},
  {id: 'settings', label: 'Settings'},
  {id: 'help', label: 'Help & Support'},
];

const ROW_H = 48;

export type AccountMenuAnchor = {
  top: number;
  right: number;
};

export type AccountMenuSheetRef = {
  dismiss: () => void;
};

type Props = {
  visible: boolean;
  anchor: AccountMenuAnchor | null;
  /** Keep overlay in tree (no Modal) — instant reopen on Home */
  keepAlive?: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  onSelect: (action: AccountMenuAction) => void;
};

/**
 * In-tree overflow popup under ⋮ — no RN Modal (faster open on Android).
 */
const AccountMenuSheet = React.forwardRef<AccountMenuSheetRef, Props>(
  (
    {visible, anchor, keepAlive = false, onClose, onDismissed, onSelect},
    ref,
  ) => {
    const [layerActive, setLayerActive] = useState(keepAlive);
    const closingRef = useRef(false);
    const wasVisibleRef = useRef(false);
    const progress = useSharedValue(0);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const finishDismiss = useCallback(() => {
      closingRef.current = false;
      wasVisibleRef.current = false;
      progress.value = 0;
      if (!keepAlive) {
        setLayerActive(false);
      }
      onCloseRef.current();
      onDismissed?.();
    }, [keepAlive, onDismissed, progress]);

    const runClose = useCallback(() => {
      if (closingRef.current) {
        return;
      }
      closingRef.current = true;
      cancelAnimation(progress);
      progress.value = withTiming(
        0,
        {duration: CLOSE_MS, easing: CLOSE_EASING},
        finished => {
          if (finished) {
            runOnJS(finishDismiss)();
          }
        },
      );
    }, [finishDismiss, progress]);

    const runOpen = useCallback(() => {
      closingRef.current = false;
      setLayerActive(true);
      cancelAnimation(progress);
      progress.value = withTiming(1, {
        duration: OPEN_MS,
        easing: OPEN_EASING,
      });
    }, [progress]);

    useImperativeHandle(ref, () => ({dismiss: runClose}), [runClose]);

    useLayoutEffect(() => {
      if (visible && anchor) {
        if (!wasVisibleRef.current) {
          runOpen();
        }
      } else if (wasVisibleRef.current && layerActive && !closingRef.current) {
        runClose();
      }
      wasVisibleRef.current = Boolean(visible && anchor);
    }, [visible, anchor, layerActive, runOpen, runClose]);

    const requestClose = useCallback(() => {
      if (!layerActive || closingRef.current) {
        return;
      }
      runClose();
    }, [layerActive, runClose]);

    const scrimStyle = useAnimatedStyle(() => ({
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
    }));

    const popupStyle = useAnimatedStyle(() => {
      const p = progress.value;
      return {
        opacity: interpolate(p, [0, 1], [0, 1]),
        transform: [{translateY: interpolate(p, [0, 1], [6, 0])}],
        ...(Platform.OS === 'ios'
          ? {shadowOpacity: interpolate(p, [0, 1], [0, 0.12])}
          : {}),
      };
    });

    const handleSelect = useCallback(
      (action: AccountMenuAction) => {
        if (closingRef.current) {
          return;
        }
        onSelect(action);
        runClose();
      },
      [onSelect, runClose],
    );

    const interactive =
      (visible || closingRef.current) && layerActive && anchor != null;

    if (!keepAlive && !layerActive) {
      return null;
    }

    if (!anchor) {
      return null;
    }

    return (
      <View
        style={styles.host}
        pointerEvents={interactive ? 'box-none' : 'none'}
        accessibilityViewIsModal={visible}>
        <Animated.View style={[styles.scrim, scrimStyle]} pointerEvents="auto">
          <Pressable
            style={styles.scrimPress}
            onPress={requestClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.popupShell,
            {top: anchor.top, right: anchor.right, width: PANEL_W},
            popupStyle,
          ]}>
          <View style={styles.panelSurface}>
            {MENU_ITEMS.map(item => (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item.id)}
                style={({pressed}) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  },
);

AccountMenuSheet.displayName = 'AccountMenuSheet';

export default AccountMenuSheet;

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1200,
    elevation: 1200,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.scrim,
  },
  scrimPress: {
    flex: 1,
  },
  popupShell: {
    position: 'absolute',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 12,
      },
      default: {},
    }),
  },
  panelSurface: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth,
    borderColor: C.border,
    paddingVertical: PANEL_PAD_V,
    overflow: 'hidden',
  },
  row: {
    height: ROW_H,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  rowPressed: {
    backgroundColor: 'rgba(6,75,99,0.07)',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: C.text,
  },
});
