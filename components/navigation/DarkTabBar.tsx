import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import TabBarIcon, {TabIconName} from './TabBarIcon';

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Explore: 'Explore',
  Requests: 'Requests',
  Alerts: 'Alerts',
  Profile: 'Profile',
};

const N = {
  bg:          '#FFFFFF',
  border:      '#EEEEEE',
  active:      '#014569',
  activeBg:    'rgba(1,69,105,0.08)',
  activeLine:  '#014569',
  inactive:    '#999999',
  inactiveText:'#999999',
} as const;

const DarkTabBar = ({state, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 6);

  return (
    <View style={[styles.bar, {paddingBottom: bottomPad}]}>
      <View style={styles.topLine} />
      {state.routes.map((route, index) => {
        const focused   = state.index === index;
        const label     = TAB_LABELS[route.name] ?? route.name;
        const iconName  = route.name as TabIconName;
        const iconColor = focused ? N.active : N.inactive;

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            android_ripple={null}
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
            <View style={styles.tabWrap}>
              {/* Accent indicator line */}
              <View
                style={[
                  styles.indicator,
                  {backgroundColor: focused ? N.activeLine : 'transparent'},
                ]}
              />
              {/* Icon + label */}
              <View style={[styles.tabInner, focused && styles.tabInnerActive]}>
                <TabBarIcon
                  name={iconName}
                  focused={focused}
                  color={iconColor}
                  size={21}
                />
                <Text style={[styles.label, focused && styles.labelActive]}>
                  {label}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default DarkTabBar;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    backgroundColor: N.bg,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {elevation: 12},
    }),
  },
  topLine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: N.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tabWrap: {
    alignItems: 'center',
    gap: 4,
  },
  indicator: {
    width: 24,
    height: 3,
    borderRadius: 3,
    marginBottom: 2,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 3,
  },
  tabInnerActive: {
    backgroundColor: N.activeBg,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: N.inactive,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: N.active,
    fontWeight: '800',
  },
});
