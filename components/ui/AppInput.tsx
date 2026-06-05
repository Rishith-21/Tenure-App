import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  StyleProp,
  TextInputProps,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

const AppInput = ({
  label,
  error,
  containerStyle,
  icon,
  style,
  ...props
}: AppInputProps) => {
  const {colors, tokens} = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[tokens.typography.label, styles.label, {color: colors.textSecondary}]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.bgElevated,
            borderRadius: tokens.radius.md,
            borderColor: error
              ? colors.danger
              : isFocused
                ? colors.primary
                : colors.border,
            borderWidth: isFocused || error ? 1.5 : StyleSheet.hairlineWidth,
            ...tokens.shadows.soft(colors.shadow),
          },
        ]}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <TextInput
          style={[tokens.typography.body, styles.input, {color: colors.text}, style]}
          placeholderTextColor={colors.textHint}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error ? (
        <Text style={[styles.errorText, {color: colors.danger}]}>{error}</Text>
      ) : null}
    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
  },
  iconContainer: {
    marginRight: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
  },
});
