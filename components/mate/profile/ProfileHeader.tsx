import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BackButton from '../../navigation/BackButton';
import {useTheme} from '../../../context/ThemeContext';
import {cardShadow} from './styles';

type Props = {
  onBack: () => void;
  onShare: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

const HeaderAction = ({
  label,
  onPress,
  active,
  styles,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  styles: ReturnType<typeof createStyles>;
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({pressed}) => [
      styles.actionBtn,
      active && styles.actionBtnActive,
      pressed && styles.actionBtnPressed,
    ]}>
    <Text style={[styles.actionLabel, active && styles.actionLabelActive]}>
      {label}
    </Text>
  </Pressable>
);

const ProfileHeader = ({
  onBack,
  onShare,
  isFavorite = false,
  onToggleFavorite,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, {paddingTop: insets.top + 6}]}>
      <BackButton onPress={onBack} variant="ghost" />
      <View style={styles.actions}>
        {onToggleFavorite ? (
          <HeaderAction
            label={isFavorite ? 'Saved' : 'Save'}
            onPress={onToggleFavorite}
            active={isFavorite}
            styles={styles}
          />
        ) : null}
        <HeaderAction label="Share" onPress={onShare} styles={styles} />
      </View>
    </View>
  );
};

export default ProfileHeader;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 8,
      zIndex: 20,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionBtn: {
      minWidth: 44,
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      ...cardShadow(c),
    },
    actionBtnActive: {
      borderColor: c.brandMuted,
      backgroundColor: c.chip,
    },
    actionBtnPressed: {
      opacity: 0.88,
    },
    actionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: c.brandDark,
    },
    actionLabelActive: {
      color: c.brand,
    },
  });
