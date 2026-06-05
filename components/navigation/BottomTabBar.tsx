import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TabBarIcon, {TabIconName} from './TabBarIcon';

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Requests: 'Requests',
  Alerts: 'Alerts',
};

const N = {
  bg: '#FFFFFF',
  border: '#E5E7EB',
  active: '#064B63',
  activeBg: '#EAF5F8',
  inactive: '#9CA3AF',
} as const;

/** Main navigation bar (Home · Requests · Alerts). */
const BottomTabBar = ({state, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bar, {paddingBottom: bottomPad}]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = TAB_LABELS[route.name] ?? route.name;
        const iconName = route.name as TabIconName;
        const iconColor = focused ? N.active : N.inactive;

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
              navigation.emit({type: 'tabLongPress', target: route.key})
            }
            accessibilityRole="button"
            accessibilityState={{selected: focused}}
            accessibilityLabel={label}>
            <View style={[styles.tabInner, focused && styles.tabInnerActive]}>
              <TabBarIcon
                name={iconName}
                focused={focused}
                color={iconColor}
                size={22}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: N.bg,
    paddingTop: 6,
    minHeight: 58,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: N.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {elevation: 10},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 3,
  },
  tabInnerActive: {
    backgroundColor: N.activeBg,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: N.inactive,
    letterSpacing: 0.15,
  },
  labelActive: {
    color: N.active,
    fontWeight: '800',
  },
});
