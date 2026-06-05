import React from 'react';
import {StyleSheet, Text, View, StyleProp, ViewStyle} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import AppButton from './AppButton';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  style,
  icon,
}: Props) => {
  const {colors, tokens} = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.cardMuted,
            borderRadius: tokens.radius.xl,
          },
        ]}>
        {icon || (
          <View
            style={[
              styles.placeholderIcon,
              {backgroundColor: colors.border, borderRadius: tokens.radius.md},
            ]}
          />
        )}
      </View>
      <Text style={[tokens.typography.h3, styles.title, {color: colors.text}]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[tokens.typography.caption, styles.description, {color: colors.textMuted}]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
          fullWidth={false}
        />
      ) : null}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 280,
  },
  button: {
    minWidth: 168,
  },
});
