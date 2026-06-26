import React, {useMemo, useRef} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import DraggableBottomDrawer, {
  DraggableBottomDrawerRef,
} from '../ui/DraggableBottomDrawer';
import {HomeMeetItem} from '../../utils/homeMeetItems';

type Props = {
  visible: boolean;
  items: HomeMeetItem[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
};

const HomeMeetAllSheet = ({
  visible,
  items,
  selectedId,
  onClose,
  onSelect,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const drawerRef = useRef<DraggableBottomDrawerRef>(null);

  const onRowPress = (id: string) => {
    drawerRef.current?.dismiss(() => onSelect(id));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <DraggableBottomDrawer
      ref={drawerRef}
      visible={visible}
      onClose={onClose}
      maxHeightRatio={0.78}
      title="All meet dates"
      subtitle={`${items.length} upcoming & active`}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}>
        {items.map(item => {
          const selected = item.id === selectedId;
          const requestDirection = item.request?.direction;
          const isLive = item.kind === 'active' || item.pillLabel === 'LIVE';
          const isConfirmed = item.pillLabel === 'CONFIRMED';
          const avatarUri = item.mateAvatar?.trim();
          const avatarInitial = item.mateName.charAt(0).toUpperCase();
          const needsMyConfirm =
            item.pillLabel === 'CONFIRM?' && requestDirection === 'received';
          return (
            <Pressable
              key={item.id}
              style={({pressed}) => [
                styles.row,
                isLive && styles.rowLiveBlue,
                isConfirmed && styles.rowConfirmedPink,
                needsMyConfirm && styles.rowPendingCream,
                selected && styles.rowSelected,
                pressed && styles.rowPressed,
              ]}
              onPress={() => onRowPress(item.id)}>
              {avatarUri ? (
                <Image source={{uri: avatarUri}} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                </View>
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowName}>{item.mateName}</Text>
                <Text style={styles.rowMeta}>{item.categoryLabel}</Text>
                <Text style={styles.rowWhen}>{item.dateLabel}</Text>
              </View>
              <View
                style={[
                  styles.rowPill,
                  item.kind === 'active' && styles.rowPillActive,
                ]}>
                <Text
                  style={[
                    styles.rowPillText,
                    item.kind === 'active' && styles.rowPillTextActive,
                  ]}>
                  {item.pillLabel}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </DraggableBottomDrawer>
  );
};

export default HomeMeetAllSheet;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 22,
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      marginBottom: 10,
      backgroundColor: c.bgElevated,
    },
    rowPressed: {opacity: 0.92},
    rowLiveBlue: {
      backgroundColor: c.meetLiveCardBg,
      borderColor: c.meetLiveCardBorder,
    },
    rowConfirmedPink: {
      backgroundColor: c.meetConfirmedCardBg,
      borderColor: c.meetConfirmedCardBorder,
    },
    rowPendingCream: {
      backgroundColor: c.meetPendingConfirmCardBg,
      borderColor: c.meetPendingConfirmCardBorder,
    },
    rowSelected: {
      borderColor: c.brand,
      borderLeftWidth: 3,
      borderLeftColor: c.brand,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.chip,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.chip,
    },
    avatarInitial: {
      fontSize: 16,
      fontWeight: '900',
      color: c.brand,
    },
    rowBody: {flex: 1},
    rowName: {
      fontSize: 15,
      fontWeight: '800',
      color: c.text,
    },
    rowMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.brand,
      marginTop: 3,
    },
    rowWhen: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 3,
    },
    rowPill: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 5,
      backgroundColor: c.chip,
    },
    rowPillActive: {backgroundColor: c.brandDark},
    rowPillText: {
      fontSize: 9,
      fontWeight: '800',
      color: c.textSecondary,
      letterSpacing: 0.3,
    },
    rowPillTextActive: {color: '#FFFFFF'},
  });
