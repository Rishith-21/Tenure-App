import React from 'react';
import {Platform, StyleSheet, View, ViewStyle, StyleProp} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  /** Edge-to-edge card with no horizontal inset */
  flush?: boolean;
};

const AppCard = ({children, style, elevated = true, flush = false}: Props) => {
  const {colors, tokens} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: tokens.radius.lg,
          padding: flush ? 0 : tokens.spacing.lg,
        },
        elevated && tokens.shadows.card(colors.shadow),
        style,
      ]}>
      {children}
    </View>
  );
};

export default AppCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: Platform.OS === 'android' ? 0 : StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
