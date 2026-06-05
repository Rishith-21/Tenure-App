import React, {useMemo} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';
import TabBarIcon, {TabIconName} from './TabBarIcon';

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Requests: 'Requests',
  Alerts: 'Alerts',
  Profile: 'Profile',
};

const FloatingTabBar = ({state, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  return (
    <View
      style={[
        styles.outer,
        {paddingBottom: Math.max(insets.bottom, tokens.spacing.sm)},
      ]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = TAB_LABELS[route.name] ?? route.name;
          const iconName = route.name as TabIconName;
          const iconColor = focused ? colors.text : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() =>
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                })
              }
              accessibilityRole="button"
              accessibilityState={{selected: focused}}
              accessibilityLabel={label}>
              <View style={[styles.tabInner, focused && styles.tabInnerActive]}>
                <TabBarIcon name={iconName} focused={focused} color={iconColor} size={20} />
                <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default FloatingTabBar;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    outer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
      backgroundColor: 'transparent',
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 58,
      borderRadius: t.radius.pill,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      paddingVertical: 6,
      paddingHorizontal: 6,
      ...Platform.select({
        ios: t.shadows.float(c.shadow),
        android: {elevation: 10},
        default: {},
      }),
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabInner: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: t.radius.pill,
      minWidth: 62,
    },
    tabInnerActive: {
      backgroundColor: c.chip,
    },
    label: {
      ...t.typography.tab,
      color: c.textMuted,
      marginTop: 3,
    },
    labelActive: {
      color: c.text,
      fontWeight: '700',
    },
  });
