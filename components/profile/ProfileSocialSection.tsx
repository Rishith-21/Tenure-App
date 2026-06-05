import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import type {AppColors} from '../../theme/palettes';
import type {DesignTokens} from '../../theme/tokens';
import {useTheme} from '../../context/ThemeContext';

export type ProfileSocialItem = {
  platformId: string;
  label: string;
  icon: string;
  url: string;
  displayUrl: string;
};

type Props = {
  items: ProfileSocialItem[];
  canAddMore: boolean;
  onAddLink: () => void;
  onEditLink: (platformId: string) => void;
  onRemoveLink: (platformId: string) => void;
};

const LinkIcon = ({color, size = 18}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
    />
    <Path
      d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
    />
  </Svg>
);

const ProfileSocialSection = ({
  items,
  canAddMore,
  onAddLink,
  onEditLink,
  onRemoveLink,
}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <View style={styles.headCopy}>
          <View style={styles.titleRow}>
            <LinkIcon color={colors.brand} />
            <Text style={styles.title}>Social links</Text>
          </View>
          <Text style={styles.caption}>
            Add public profiles or your website so requesters can verify you.
          </Text>
        </View>
        {canAddMore ? (
          <Pressable
            onPress={onAddLink}
            hitSlop={8}
            style={({pressed}) => pressed && styles.pressed}>
            <Text style={styles.link}>Add link</Text>
          </Pressable>
        ) : null}
      </View>

      {items.length === 0 ? (
        <Pressable
          onPress={onAddLink}
          style={({pressed}) => [styles.emptyCard, pressed && styles.pressed]}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyPlus}>+</Text>
          </View>
          <Text style={styles.emptyTitle}>Add your first link</Text>
          <Text style={styles.emptyHint}>
            Instagram, Facebook, YouTube, or your website — shown on your mate
            profile.
          </Text>
        </Pressable>
      ) : (
        <>
          <View style={styles.list}>
            {items.map(item => (
              <View key={item.platformId} style={styles.linkCard}>
                <Pressable
                  onPress={() => onEditLink(item.platformId)}
                  style={({pressed}) => [
                    styles.linkMain,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.label} link`}>
                  <View style={styles.iconWrap}>
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>
                  <View style={styles.linkText}>
                    <Text style={styles.platform}>{item.label}</Text>
                    <Text style={styles.handle} numberOfLines={1}>
                      {item.displayUrl}
                    </Text>
                  </View>
                  <Text style={styles.editHint}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => onRemoveLink(item.platformId)}
                  hitSlop={10}
                  style={({pressed}) => [
                    styles.removeBtn,
                    pressed && styles.pressed,
                  ]}
                  accessibilityLabel={`Remove ${item.label}`}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
          {canAddMore ? (
            <Pressable
              onPress={onAddLink}
              style={({pressed}) => [styles.addAnother, pressed && styles.pressed]}>
              <Text style={styles.addAnotherText}>+ Add another link</Text>
            </Pressable>
          ) : null}
          <Text style={styles.countLine}>
            {items.length} link{items.length === 1 ? '' : 's'} · tap Edit to
            update
          </Text>
        </>
      )}
    </View>
  );
};

export default ProfileSocialSection;

const createStyles = (c: AppColors, t: DesignTokens) =>
  StyleSheet.create({
    section: {
      backgroundColor: c.card,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.xl,
      marginTop: t.spacing.lg,
      ...t.shadows.soft(c.shadow),
    },
    pressed: {opacity: 0.78},
    headRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: t.spacing.md,
      marginBottom: t.spacing.lg,
    },
    headCopy: {flex: 1, minWidth: 0},
    titleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.3,
    },
    caption: {
      fontSize: 12.5,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 4,
      lineHeight: 18,
    },
    link: {fontSize: 13.5, fontWeight: '700', color: c.brand},

    emptyCard: {
      alignItems: 'center',
      paddingVertical: t.spacing.xxl,
      paddingHorizontal: t.spacing.lg,
      borderRadius: t.radius.sm,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.borderInput,
      backgroundColor: c.bgElevated,
    },
    emptyIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.md,
    },
    emptyPlus: {fontSize: 28, fontWeight: '300', color: c.brand},
    emptyTitle: {fontSize: 15, fontWeight: '700', color: c.text},
    emptyHint: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 19,
      maxWidth: 280,
    },

    list: {gap: 10},
    linkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgElevated,
      overflow: 'hidden',
    },
    linkMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingLeft: 12,
      paddingRight: 8,
      minWidth: 0,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {fontSize: 18},
    linkText: {flex: 1, minWidth: 0},
    platform: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    handle: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    editHint: {
      fontSize: 12,
      fontWeight: '700',
      color: c.brand,
    },
    removeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: c.border,
    },
    removeText: {
      fontSize: 22,
      fontWeight: '400',
      color: c.textHint,
      lineHeight: 24,
    },
    addAnother: {
      marginTop: 12,
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: c.borderInput,
      backgroundColor: c.card,
    },
    addAnotherText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.brand,
    },
    countLine: {
      fontSize: 12,
      fontWeight: '500',
      color: c.textHint,
      marginTop: t.spacing.md,
    },
  });
