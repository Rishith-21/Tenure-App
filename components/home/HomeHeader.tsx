import React, {RefObject} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import HeaderIconButton, {BellIcon, MenuIcon} from './HeaderIconButton';

const H = {
  primary: '#064B63',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
} as const;

export type HomeHeaderUser = {
  greeting?: string;
  name?: string;
  locationLine?: string;
  avatarUri?: string;
};

type Props = {
  user?: HomeHeaderUser;
  topInset?: number;
  hasUnreadAlerts?: boolean;
  onPressAvatar: () => void;
  onPressAlerts: () => void;
  onPressMenu: () => void;
  menuButtonRef?: RefObject<View | null>;
  onMenuButtonLayout?: () => void;
};

const HomeHeader = ({
  user,
  topInset = 0,
  hasUnreadAlerts = false,
  onPressAvatar,
  onPressAlerts,
  onPressMenu,
  menuButtonRef,
  onMenuButtonLayout,
}: Props) => {
  const greeting = user?.greeting ?? 'Welcome';
  const name = user?.name ?? 'Your profile';
  const locationLine = user?.locationLine ?? 'Complete your profile';
  const avatarUri = user?.avatarUri;
  const avatarInitial = name.charAt(0).toUpperCase();

  return (
    <View style={[styles.wrap, {paddingTop: topInset + 8}]}>
      <Pressable
        onPress={onPressAvatar}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        style={({pressed}) => [styles.identity, pressed && styles.pressed]}>
        {avatarUri ? (
          <Image source={{uri: avatarUri}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.textCol}>
          <Text style={styles.greeting} numberOfLines={1}>
            {greeting}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {locationLine}
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <HeaderIconButton
          onPress={onPressAlerts}
          accessibilityLabel="Notifications"
          showBadge={hasUnreadAlerts}>
          <BellIcon />
        </HeaderIconButton>
        <View
          ref={menuButtonRef}
          collapsable={false}
          style={styles.menuAnchor}
          onLayout={onMenuButtonLayout}>
          <HeaderIconButton
            onPress={onPressMenu}
            accessibilityLabel="Account menu">
            <MenuIcon />
          </HeaderIconButton>
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    gap: 12,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  pressed: {opacity: 0.88},
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EAF5F8',
    borderWidth: 2,
    borderColor: H.primary,
    flexShrink: 0,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: H.primary,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    color: H.textSecondary,
    letterSpacing: 0.2,
    marginBottom: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: H.text,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    fontWeight: '500',
    color: H.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  /** Fixed size so measureInWindow returns a reliable anchor below ⋮ */
  menuAnchor: {
    width: 44,
    height: 44,
  },
});
