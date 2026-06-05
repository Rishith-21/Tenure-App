import React, {useMemo} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useTheme} from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string | number;
};

const BottomDrawer = ({
  visible,
  title,
  onClose,
  children,
  maxHeight = '78%',
}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.root} onPress={onClose}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={colors.statusBar === 'light-content' ? 'dark' : 'light'}
            blurAmount={16}
            reducedTransparencyFallbackColor={colors.sheetScrim}
          />
          <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
        </View>
        <Pressable onPress={e => e.stopPropagation()}>
          <View style={[styles.sheet, {maxHeight}]}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={[tokens.typography.h2, styles.title, {color: colors.text}]}>
                {title}
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={[styles.close, {color: colors.textMuted}]}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.content}>{children}</View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (
  c: ReturnType<typeof useTheme>['colors'],
  tokens: ReturnType<typeof useTheme>['tokens'],
) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      backgroundColor: c.sheetScrim,
    },
    sheet: {
      alignSelf: 'stretch',
      backgroundColor: c.card,
      borderTopLeftRadius: tokens.radius.xl,
      borderTopRightRadius: tokens.radius.xl,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: tokens.spacing.md,
      overflow: 'hidden',
      ...tokens.shadows.float(c.shadow),
    },
    content: {
      flex: 1,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: tokens.radius.pill,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: tokens.spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: tokens.spacing.lg,
    },
    title: {
      fontSize: 22,
    },
    close: {
      fontSize: 18,
      fontWeight: '600',
    },
  });

export default BottomDrawer;
