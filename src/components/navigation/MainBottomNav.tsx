import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Requests: 'Requests',
  Alerts: 'Alerts',
};

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Requests: '👥',
  Alerts: '🔔',
};

const MainBottomNav = ({state, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 10)}]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = TAB_LABELS[route.name] ?? route.name;

        return (
          <Pressable
            key={route.key}
            style={styles.tab}
            onPress={() => {
              if (!focused) {
                navigation.navigate(route.name);
              }
            }}
            accessibilityRole="button"
            accessibilityState={{selected: focused}}>
            <Text style={[styles.icon, focused && styles.iconActive]}>
              {TAB_ICONS[route.name] ?? '•'}
            </Text>
            <Text style={[styles.label, focused && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default MainBottomNav;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  icon: {
    fontSize: 22,
    color: '#999999',
    marginBottom: 4,
  },
  iconActive: {
    color: '#003B57',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  labelActive: {
    color: '#003B57',
    fontWeight: '800',
  },
});
