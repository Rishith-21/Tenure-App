import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';
import ProfileTrustBadges from './ProfileTrustBadges';

type Props = {
  trustPercent: number;
  reviewCount: number;
  trusted?: boolean;
  verified?: boolean;
};

const ReviewSummaryCard = ({
  trustPercent,
  reviewCount,
  trusted,
  verified,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const reviewLabel =
    reviewCount === 1 ? '1 review' : `${reviewCount} reviews`;

  return (
    <View style={styles.card}>
      <ProfileTrustBadges verified={verified} trusted={trusted} />
      <View style={[styles.main, (verified || trusted) && styles.mainSpaced]}>
        <Text style={styles.score}>{trustPercent}%</Text>
        <View style={styles.meta}>
          <Text style={styles.metaTitle}>Trust score</Text>
          <Text style={styles.metaSub}>{reviewLabel}</Text>
        </View>
      </View>
      {trusted ? (
        <Text style={styles.trustedNote}>
          Trusted member — consistently positive reviews on Tenure.
        </Text>
      ) : verified ? (
        <Text style={styles.trustedNote}>
          Identity verified on Tenure.
        </Text>
      ) : (
        <Text style={styles.trustedNote}>
          Based on completed mate experiences on Tenure.
        </Text>
      )}
    </View>
  );
};

export default ReviewSummaryCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      borderRadius: 14,
      backgroundColor: c.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 14,
    },
    main: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    mainSpaced: {
      marginTop: 12,
    },
    score: {
      fontSize: 28,
      fontWeight: '600',
      color: c.brand,
      letterSpacing: -0.5,
    },
    meta: {
      flex: 1,
    },
    metaTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    metaSub: {
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
    trustedNote: {
      fontSize: 12,
      color: c.textHint,
      lineHeight: 17,
      marginTop: 10,
    },
  });
