import React, {useMemo} from 'react';
import {Platform, StyleSheet, Pressable, Text, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
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

const MainBottomNav = ({state, navigation}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  return (
    <View
      style={[
        styles.outer,
        {paddingBottom: Math.max(insets.bottom, tokens.spacing.sm)},
      ]}>
      <View style={styles.barShell}>
        {Platform.OS === 'ios' ? (
          <>
            <BlurView
              blurType="dark"
              blurAmount={28}
              reducedTransparencyFallbackColor={colors.navBg}
              style={[StyleSheet.absoluteFill, styles.barBlur]}
            />
            <View style={[StyleSheet.absoluteFill, styles.barTint, styles.barBlur]} />
          </>
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.barTint, styles.barBlur]} />
        )}

        <View style={styles.bar}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const label = TAB_LABELS[route.name] ?? route.name;
            const iconName = route.name as TabIconName;
            const iconColor = focused ? colors.navActive : colors.navInactive;

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
                  <TabBarIcon name={iconName} focused={focused} color={iconColor} />
                  <Text style={[styles.label, focused && styles.labelActive]}>
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default MainBottomNav;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    outer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.sm,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      elevation: 0,
    },
    barShell: {
      borderRadius: tokens.radius.xl,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.glassDarkBorder,
      ...tokens.shadows.nav(c.shadow),
    },
    barBlur: {
      borderRadius: tokens.radius.xl,
    },
    barTint: {
      backgroundColor: c.navBg,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
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
      borderRadius: tokens.radius.md,
      minWidth: 64,
    },
    tabInnerActive: {
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    label: {
      ...tokens.typography.tab,
      color: c.navInactive,
      marginTop: 4,
    },
    labelActive: {
      color: c.navActive,
      fontWeight: '700',
    },
  });
