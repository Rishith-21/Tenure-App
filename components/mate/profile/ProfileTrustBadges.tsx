import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';

type Props = {
  verified?: boolean;
  trusted?: boolean;
};

const ProfileTrustBadges = ({verified, trusted}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!verified && !trusted) {
    return null;
  }

  return (
    <View style={styles.row}>
      {verified ? (
        <View style={[styles.chip, styles.chipVerified]}>
          <View style={styles.dotVerified} />
          <Text style={styles.chipTextVerified}>Verified</Text>
        </View>
      ) : null}
      {trusted ? (
        <View style={[styles.chip, styles.chipTrusted]}>
          <View style={styles.dotTrusted} />
          <Text style={styles.chipTextTrusted}>Trusted member</Text>
        </View>
      ) : null}
    </View>
  );
};

export default ProfileTrustBadges;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginTop: 10,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
    },
    chipVerified: {
      backgroundColor: c.meetLiveCardBg,
      borderColor: c.meetLiveCardBorder,
    },
    chipTrusted: {
      backgroundColor: c.meetConfirmedCardBg,
      borderColor: c.meetConfirmedCardBorder,
    },
    dotVerified: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.brand,
    },
    dotTrusted: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.success,
    },
    chipTextVerified: {
      fontSize: 12,
      fontWeight: '600',
      color: c.brand,
    },
    chipTextTrusted: {
      fontSize: 12,
      fontWeight: '600',
      color: c.success,
    },
  });
