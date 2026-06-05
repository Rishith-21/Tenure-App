import React, {useMemo} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {useTheme} from '../../../context/ThemeContext';
import {
  PROFILE_CARD_RADIUS,
  cardShadow,
  createProfileSharedStyles,
} from './styles';

type Props = {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
};

const SectionCard = ({title, children, style, noPadding}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shared = useMemo(() => createProfileSharedStyles(colors), [colors]);

  return (
    <View style={[styles.card, style]}>
      {title ? (
        <Text style={shared.sectionTitle}>{title}</Text>
      ) : null}
      <View style={noPadding ? undefined : styles.body}>{children}</View>
    </View>
  );
};

export default SectionCard;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      borderRadius: PROFILE_CARD_RADIUS,
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 16,
      ...cardShadow(c),
    },
    body: {},
  });
