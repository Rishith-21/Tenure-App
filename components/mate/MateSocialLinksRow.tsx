import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {
  MateSocialLink,
  openMateSocialLink,
} from '../../utils/mateSocialLinks';

type Props = {
  links: MateSocialLink[];
  /** Compact icon-only row for tight headers */
  variant?: 'cards' | 'compact';
};

const MateSocialLinksRow = ({links, variant = 'cards'}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors, variant), [colors, variant]);

  if (links.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <View style={styles.compactRow}>
        {links.map(link => (
          <Pressable
            key={link.platformId}
            accessibilityRole="link"
            accessibilityLabel={`Open ${link.label}`}
            onPress={() => openMateSocialLink(link.url)}
            style={({pressed}) => [
              styles.compactBtn,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.compactIcon}>{link.icon}</Text>
            <Text style={styles.compactLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Social</Text>
      {links.map(link => (
        <Pressable
          key={link.platformId}
          accessibilityRole="link"
          accessibilityLabel={`Open ${link.label}, ${link.displayUrl}`}
          onPress={() => openMateSocialLink(link.url)}
          style={({pressed}) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{link.icon}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.label}>{link.label}</Text>
            <Text style={styles.url} numberOfLines={1}>
              {link.displayUrl}
            </Text>
          </View>
          <Text style={styles.external}>↗</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default MateSocialLinksRow;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  variant: 'cards' | 'compact',
) =>
  StyleSheet.create({
    wrap: {
      marginTop: 14,
      gap: 8,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textHint,
      textTransform: 'uppercase',
      letterSpacing: 0.35,
      marginBottom: 2,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    pressed: {
      opacity: 0.9,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.bg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    icon: {
      fontSize: 18,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    url: {
      fontSize: 12,
      color: c.brand,
      marginTop: 2,
    },
    external: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textHint,
    },
    compactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginTop: 12,
    },
    compactBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    compactIcon: {
      fontSize: 14,
    },
    compactLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.brandDark,
    },
  });
