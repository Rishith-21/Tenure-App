import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../../context/ThemeContext';
import {cardShadow} from './styles';

type Props = {
  ratePerHour: number;
  onPress: () => void;
  actionLabel?: string;
};

const StickyRequestBar = ({
  ratePerHour,
  onPress,
  actionLabel = 'Send mate request',
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, {paddingBottom: Math.max(insets.bottom, 12)}]}>
      <View style={styles.bar}>
        <View style={styles.rateBlock}>
          <Text style={styles.rate}>₹{ratePerHour}</Text>
          <Text style={styles.rateHint}>/hr</Text>
          <Text style={styles.perHour}>per hour</Text>
        </View>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({pressed}) => [
            styles.cta,
            pressed && styles.ctaPressed,
          ]}>
          <Text style={styles.ctaText}>{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StickyRequestBar;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: 16,
      paddingTop: 8,
      backgroundColor: 'transparent',
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 18,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      ...cardShadow(c),
    },
    rateBlock: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      flex: 1,
      gap: 2,
    },
    rate: {
      fontSize: 20,
      fontWeight: '600',
      color: c.text,
    },
    rateHint: {
      fontSize: 15,
      fontWeight: '500',
      color: c.textSecondary,
    },
    perHour: {
      width: '100%',
      fontSize: 11,
      color: c.textMuted,
      marginTop: 1,
    },
    cta: {
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.brand,
      minWidth: 148,
      alignItems: 'center',
    },
    ctaPressed: {
      backgroundColor: c.primaryPressed,
    },
    ctaText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
