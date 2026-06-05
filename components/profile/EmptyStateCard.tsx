import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  title: string;
  subtitle: string;
  symbol: string;
  onPress: () => void;
};

const EmptyStateCard = ({title, subtitle, symbol, onPress}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{symbol}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
};

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  t: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      padding: t.spacing.lg,
      borderRadius: t.radius.sm,
      backgroundColor: c.cardMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderStyle: 'dashed',
    },
    cardPressed: {opacity: 0.78},
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    icon: {
      fontSize: 16,
      fontWeight: '800',
      color: c.primary,
    },
    copy: {flex: 1},
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 2,
    },
    chevron: {
      fontSize: 22,
      color: c.textMuted,
      fontWeight: '300',
    },
  });

export default EmptyStateCard;
