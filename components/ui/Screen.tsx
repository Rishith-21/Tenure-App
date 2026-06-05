import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Edge-to-edge content (no horizontal padding) */
  edgeToEdge?: boolean;
};

const Screen = ({
  children,
  scroll = false,
  keyboard = false,
  contentStyle,
  style,
  padded = true,
  edgeToEdge = false,
}: Props) => {
  const {colors, tokens} = useTheme();
  const horizontalPad = edgeToEdge ? 0 : tokens.spacing.screenH;

  const inner = scroll ? (
    <ScrollView
      style={[styles.flex, {backgroundColor: colors.bg}]}
      contentContainerStyle={[
        padded && {paddingHorizontal: horizontalPad, paddingBottom: tokens.spacing.xxxl},
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        padded && {paddingHorizontal: horizontalPad, paddingBottom: tokens.spacing.xxxl},
        contentStyle,
      ]}>
      {children}
    </View>
  );

  const body = (
    <View style={[styles.flex, {backgroundColor: colors.bg}, style]}>
      {inner}
    </View>
  );

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
      </KeyboardAvoidingView>
    );
  }

  return body;
};

export default Screen;

const styles = StyleSheet.create({
  flex: {flex: 1},
});
