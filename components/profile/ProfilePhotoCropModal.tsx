import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../context/ThemeContext';
import type {AppColors} from '../../theme/palettes';
import type {DesignTokens} from '../../theme/tokens';

const {width: SW} = Dimensions.get('window');
const VIEWPORT = Math.min(SW - 48, 320);
const EXPORT_SIZE = 512;

export type CropSource = {
  uri: string;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  source: CropSource | null;
  onClose: () => void;
  onComplete: (uri: string) => void;
};

const ProfilePhotoCropModal = ({visible, source, onClose, onComplete}: Props) => {
  const {colors, tokens} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  const baseScaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [saving, setSaving] = useState(false);
  const panOrigin = useRef({x: 0, y: 0});

  const resetTransform = useCallback((w: number, h: number) => {
    const cover = Math.max(VIEWPORT / w, VIEWPORT / h);
    baseScaleRef.current = cover;
    setScale(cover);
    setOffset({
      x: (VIEWPORT - w * cover) / 2,
      y: (VIEWPORT - h * cover) / 2,
    });
  }, []);

  React.useEffect(() => {
    if (source) {
      resetTransform(source.width, source.height);
    }
  }, [source, resetTransform]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          panOrigin.current = {...offset};
        },
        onPanResponderMove: (_, g) => {
          setOffset({
            x: panOrigin.current.x + g.dx,
            y: panOrigin.current.y + g.dy,
          });
        },
      }),
    [offset],
  );

  const zoom = (factor: number) => {
    if (!source) {
      return;
    }
    const min = baseScaleRef.current;
    const max = baseScaleRef.current * 3;
    setScale(prev => {
      const next = Math.min(max, Math.max(min, prev * factor));
      const cx = VIEWPORT / 2;
      const cy = VIEWPORT / 2;
      const ratio = next / prev;
      setOffset(o => ({
        x: cx - (cx - o.x) * ratio,
        y: cy - (cy - o.y) * ratio,
      }));
      return next;
    });
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const handleUsePhoto = async () => {
    if (!source || saving) {
      return;
    }
    setSaving(true);
    try {
      const cropX = clamp(-offset.x / scale, 0, source.width);
      const cropY = clamp(-offset.y / scale, 0, source.height);
      const cropW = clamp(VIEWPORT / scale, 1, source.width - cropX);
      const cropH = clamp(VIEWPORT / scale, 1, source.height - cropY);

      const cropped = await ImageEditor.cropImage(source.uri, {
        offset: {x: Math.round(cropX), y: Math.round(cropY)},
        size: {width: Math.round(cropW), height: Math.round(cropH)},
        displaySize: {width: EXPORT_SIZE, height: EXPORT_SIZE},
      });
      const uri =
        typeof cropped === 'string'
          ? cropped
          : cropped.uri ?? cropped.path;
      if (uri) {
        onComplete(uri);
      }
      onClose();
    } catch {
      // keep modal open on failure
    } finally {
      setSaving(false);
    }
  };

  if (!source) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, {paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16}]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={({pressed}) => pressed && styles.pressed}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>Adjust profile photo</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.hint}>Drag to position · zoom to frame your face</Text>

        <View style={styles.previewWrap}>
          <View style={styles.viewport} {...panResponder.panHandlers}>
            <Image
              source={{uri: source.uri}}
              style={{
                position: 'absolute',
                width: source.width * scale,
                height: source.height * scale,
                left: offset.x,
                top: offset.y,
              }}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.iconHint}>Icon preview shape</Text>
          <View style={styles.avatarPreview} pointerEvents="none" />
        </View>

        <View style={styles.zoomRow}>
          <Pressable
            style={({pressed}) => [styles.zoomBtn, pressed && styles.pressed]}
            onPress={() => zoom(0.88)}>
            <Text style={styles.zoomBtnText}>−</Text>
          </Pressable>
          <Text style={styles.zoomLabel}>Zoom</Text>
          <Pressable
            style={({pressed}) => [styles.zoomBtn, pressed && styles.pressed]}
            onPress={() => zoom(1.12)}>
            <Text style={styles.zoomBtnText}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={({pressed}) => [
            styles.primaryBtn,
            (saving || pressed) && styles.pressed,
            saving && styles.primaryBtnDisabled,
          ]}
          onPress={handleUsePhoto}
          disabled={saving}>
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Use photo'}</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default ProfilePhotoCropModal;

const createStyles = (c: AppColors, t: DesignTokens) =>
  StyleSheet.create({
    screen: {flex: 1, backgroundColor: c.bg, paddingHorizontal: t.spacing.lg},
    pressed: {opacity: 0.78},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.md,
    },
    cancel: {fontSize: 15, fontWeight: '600', color: c.textSecondary, minWidth: 64},
    title: {fontSize: 17, fontWeight: '800', color: c.text},
    headerSpacer: {minWidth: 64},
    hint: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      textAlign: 'center',
      marginBottom: t.spacing.lg,
    },
    previewWrap: {alignItems: 'center', marginBottom: t.spacing.xl},
    viewport: {
      width: VIEWPORT,
      height: VIEWPORT,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
    },
    iconHint: {
      marginTop: t.spacing.md,
      fontSize: 11,
      fontWeight: '600',
      color: c.textHint,
    },
    avatarPreview: {
      width: 56,
      height: 56,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: c.brand,
      marginTop: 6,
    },
    zoomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.spacing.lg,
      marginBottom: t.spacing.xl,
    },
    zoomBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    zoomBtnText: {fontSize: 22, fontWeight: '600', color: c.brand},
    zoomLabel: {fontSize: 14, fontWeight: '600', color: c.textMuted},
    primaryBtn: {
      height: 50,
      borderRadius: t.radius.sm,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnDisabled: {opacity: 0.6},
    primaryBtnText: {fontSize: 16, fontWeight: '800', color: '#FFFFFF'},
  });
