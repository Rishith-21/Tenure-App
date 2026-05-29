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
};

const Screen = ({
  children,
  scroll = false,
  keyboard = false,
  contentStyle,
  style,
  padded = true,
}: Props) => {
  const {colors} = useTheme();

  const inner = scroll ? (
    <ScrollView
      style={[styles.flex, {backgroundColor: colors.bg}]}
      contentContainerStyle={[
        padded && styles.padded,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>
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
  padded: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
