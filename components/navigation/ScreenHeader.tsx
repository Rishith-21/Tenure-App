import React, {useMemo} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';
import {
  SCREEN_HEADER_BOTTOM_MARGIN,
  SCREEN_HEADER_H_PADDING,
  SCREEN_HEADER_TOP_INSET,
  screenHeaderTitleStyle,
} from '../../theme/screenHeader';

type Props = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  /** Large editorial title — detail screens */
  large?: boolean;
};

const ScreenHeader = ({title, left, right, style, large = false}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens, large), [colors, tokens, large]);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {paddingTop: insets.top + SCREEN_HEADER_TOP_INSET},
        style,
      ]}>
      <View style={styles.row}>
        <View style={styles.colLeft}>{left}</View>
        <View style={styles.colCenter}>
          {!large ? (
            <Text
              style={styles.title}
              numberOfLines={1}
              accessibilityRole="header">
              {title}
            </Text>
          ) : null}
        </View>
        <View style={styles.colRight}>{right}</View>
      </View>
      {large ? (
        <Text style={styles.titleLarge} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
    </View>
  );
};

export default ScreenHeader;

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
  large: boolean,
) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: large ? tokens.spacing.screenH : 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: large ? 0 : SCREEN_HEADER_H_PADDING,
      marginBottom: large ? tokens.spacing.sm : SCREEN_HEADER_BOTTOM_MARGIN,
      minHeight: 44,
    },
    colLeft: {
      flex: 1,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    colCenter: {
      flex: 1.4,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    colRight: {
      flex: 1,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    title: {
      textAlign: 'center',
      color: c.text,
      width: '100%',
      ...screenHeaderTitleStyle,
    },
    titleLarge: {
      ...tokens.typography.h1,
      color: c.text,
      paddingHorizontal: tokens.spacing.screenH,
      marginBottom: tokens.spacing.lg,
      letterSpacing: -0.8,
    },
  });

