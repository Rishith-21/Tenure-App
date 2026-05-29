import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Requests: 'Requests',
  Alerts: 'Alerts',
  Profile: 'Profile',
};

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Requests: '◎',
  Alerts: '◉',
  Profile: '◌',
};

const MainBottomNav = ({state, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
            accessibilityState={{selected: focused}}>
            <View style={[styles.iconDot, focused && styles.iconDotActive]}>
              <Text style={[styles.icon, focused && styles.iconActive]}>
                {TAB_ICONS[route.name] ?? '•'}
              </Text>
            </View>
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

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: c.card,
      borderTopWidth: 1,
      borderTopColor: c.border,
      paddingTop: 8,
      paddingHorizontal: 14,
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: -4},
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    iconDot: {
      minWidth: 44,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      marginBottom: 3,
    },
    iconDotActive: {
      backgroundColor: c.bgElevated,
      borderWidth: 1,
      borderColor: c.border,
    },
    icon: {
      fontSize: 18,
      color: c.textHint,
    },
    iconActive: {
      color: c.brand,
      fontWeight: '700',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textHint,
    },
    labelActive: {
      color: c.brand,
      fontWeight: '800',
    },
  });
