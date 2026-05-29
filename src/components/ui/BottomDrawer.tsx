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
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
            blurAmount={12}
            reducedTransparencyFallbackColor={colors.sheetScrim}
          />
          <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
        </View>
        <Pressable onPress={e => e.stopPropagation()}>
          <View style={[styles.sheet, {height: maxHeight}]}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>
            <View
              style={[
                styles.content,
                {paddingBottom: 0},
              ]}>
              {children}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
      margin: 0,
      padding: 0,
    },
    backdrop: {
      backgroundColor: c.sheetScrim,
    },
    sheet: {
      alignSelf: 'stretch',
      backgroundColor: c.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 18,
      paddingTop: 12,
      margin: 0,
      borderTopWidth: 1,
      borderColor: c.border,
      shadowColor: c.shadow,
      shadowOffset: {width: 0, height: -6},
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 16,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
    },
    handle: {
      width: 34,
      height: 4,
      borderRadius: 999,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: 10,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: c.text,
    },
    close: {
      fontSize: 16,
      color: c.textMuted,
      fontWeight: '700',
    },
  });

export default BottomDrawer;
