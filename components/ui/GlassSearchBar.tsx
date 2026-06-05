import React from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
  rightSlot?: React.ReactNode;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  inputRef?: React.RefObject<TextInput | null>;
  onFocus?: () => void;
  onBlur?: () => void;
};

const GlassSearchBar = ({
  value,
  placeholder = 'Search…',
  onChangeText,
  onPress,
  editable = true,
  rightSlot,
  leftIcon,
  style,
  inputRef,
  onFocus,
  onBlur,
}: Props) => {
  const {colors, tokens, isDark} = useTheme();

  const inner = (
    <>
      {leftIcon ?? (
        <Text style={[styles.searchIcon, {color: colors.textMuted}]}>⌕</Text>
      )}
      {editable && onChangeText ? (
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={[tokens.typography.body, styles.input, {color: colors.text}]}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      ) : (
        <Text
          style={[
            tokens.typography.body,
            styles.placeholder,
            {color: value ? colors.text : colors.textMuted},
          ]}
          numberOfLines={1}>
          {value || placeholder}
        </Text>
      )}
      {rightSlot}
    </>
  );

  const shellStyle = [
    styles.shell,
    {
      borderRadius: tokens.radius.pill,
      minHeight: tokens.layout.searchBarHeight,
      borderColor: isDark ? colors.glassDarkBorder : colors.glassBorder,
      ...tokens.shadows.float(colors.shadow),
    },
    style,
  ];

  if (Platform.OS === 'ios') {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({pressed}) => [shellStyle, pressed && styles.pressed]}>
        <BlurView
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={24}
          reducedTransparencyFallbackColor={colors.glass}
          style={[StyleSheet.absoluteFill, {borderRadius: tokens.radius.pill}]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark ? colors.glassDark : colors.glass,
              borderRadius: tokens.radius.pill,
            },
          ]}
        />
        <View style={styles.row}>{inner}</View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({pressed}) => [
        shellStyle,
        {
          backgroundColor: isDark ? colors.glassDark : colors.glass,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.row}>{inner}</View>
    </Pressable>
  );
};

export default GlassSearchBar;

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    flex: 1,
    minHeight: 56,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
    fontWeight: '300',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
  },
  placeholder: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.995}],
  },
});
