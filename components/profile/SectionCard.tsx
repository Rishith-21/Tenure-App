import React, {useMemo} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  elevated?: boolean;
  compact?: boolean;
};

const SectionCard = ({
  title,
  subtitle,
  action,
  children,
  elevated = true,
  compact = false,
}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(
    () => createStyles(colors, tokens, elevated, compact),
    [colors, tokens, elevated, compact],
  );

  return (
    <View style={styles.card}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
};

export const SectionAction = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => {
  const {colors} = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({pressed}) => [{opacity: pressed ? 0.65 : 1}]}>
      <Text style={{fontSize: 14, fontWeight: '700', color: colors.primary}}>{label}</Text>
    </Pressable>
  );
};

export const IconButton = ({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) => {
  const {colors, tokens} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({pressed}) => [
        {
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.chip,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <Text style={{fontSize: 20, fontWeight: '600', color: colors.primary, marginTop: -1}}>
        {label}
      </Text>
    </Pressable>
  );
};

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
  elevated: boolean,
  compact: boolean,
) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: t.radius.md,
      padding: compact ? t.spacing.lg : t.spacing.xl,
      marginBottom: t.spacing.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      ...(elevated
        ? Platform.select({
            ios: t.shadows.card(c.shadow),
            android: {elevation: 3},
            default: {},
          })
        : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: t.spacing.lg,
      gap: t.spacing.md,
    },
    headerText: {flex: 1},
    title: {
      ...t.typography.h3,
      color: c.text,
    },
    subtitle: {
      ...t.typography.caption,
      color: c.textMuted,
      marginTop: 4,
    },
  });

export default SectionCard;
