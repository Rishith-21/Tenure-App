import React, {useMemo} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import type {AppColors} from '../../theme/palettes';
import type {DesignTokens} from '../../theme/tokens';
import {useTheme} from '../../context/ThemeContext';

const {width: SW} = Dimensions.get('window');
const PREVIEW_SIZE = Math.floor((SW - 32 - 48 - 12 * 3) / 4);
const MAX_VISIBLE = 5;

type Props = {
  images: string[];
  onAddPhotos: () => void;
  onManage: () => void;
  onOpenPhoto?: (uri: string) => void;
};

const GridIcon = ({color, size = 18}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 13h6v6H4v-6Zm10 0h6v6h-6v-6Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileGallerySection = ({
  images,
  onAddPhotos,
  onManage,
  onOpenPhoto,
}: Props) => {
  const {colors, tokens} = useTheme();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);
  const preview = images.slice(0, MAX_VISIBLE);
  const overflow = images.length - MAX_VISIBLE;

  return (
    <View style={styles.section}>
      <View style={styles.headRow}>
        <View style={styles.headCopy}>
          <View style={styles.titleRow}>
            <GridIcon color={colors.brand} />
            <Text style={styles.title}>Photo Gallery</Text>
          </View>
          <Text style={styles.caption}>
            Add photos requesters see on your companion passport.
          </Text>
        </View>
        <Pressable onPress={onManage} hitSlop={8} style={({pressed}) => pressed && styles.pressed}>
          <Text style={styles.link}>
            {images.length > 0 ? 'Manage' : 'Add'}
          </Text>
        </Pressable>
      </View>

      {images.length === 0 ? (
        <Pressable
          onPress={onAddPhotos}
          style={({pressed}) => [styles.emptyCard, pressed && styles.pressed]}>
          <View style={styles.emptyIconWrap}>
            <Text style={styles.emptyPlus}>+</Text>
          </View>
          <Text style={styles.emptyTitle}>Add your first photos</Text>
          <Text style={styles.emptyHint}>
            Upload from your gallery — up to 12 photos stored on this device.
          </Text>
        </Pressable>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}>
            {preview.map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => onOpenPhoto?.(uri)}
                style={({pressed}) => [styles.thumbWrap, pressed && styles.pressed]}>
                <Image source={{uri}} style={styles.thumb} />
                {index === MAX_VISIBLE - 1 && overflow > 0 ? (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreText}>+{overflow}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
            <Pressable
              onPress={onAddPhotos}
              style={({pressed}) => [styles.addTile, pressed && styles.pressed]}
              accessibilityLabel="Add photos">
              <Text style={styles.addTilePlus}>+</Text>
              <Text style={styles.addTileLabel}>Add</Text>
            </Pressable>
          </ScrollView>
          <Text style={styles.countLine}>
            {images.length} photo{images.length === 1 ? '' : 's'} saved · tap Manage to
            reorder or remove
          </Text>
        </>
      )}
    </View>
  );
};

export default ProfileGallerySection;

const createStyles = (c: AppColors, t: DesignTokens) =>
  StyleSheet.create({
    section: {
      backgroundColor: c.card,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: t.spacing.xl,
      marginTop: t.spacing.lg,
      ...t.shadows.soft(c.shadow),
    },
    pressed: {opacity: 0.78},
    headRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: t.spacing.md,
      marginBottom: t.spacing.lg,
    },
    headCopy: {flex: 1, minWidth: 0},
    titleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      letterSpacing: -0.3,
    },
    caption: {
      fontSize: 12.5,
      fontWeight: '500',
      color: c.textMuted,
      marginTop: 4,
      lineHeight: 18,
    },
    link: {fontSize: 13.5, fontWeight: '700', color: c.brand},

    emptyCard: {
      alignItems: 'center',
      paddingVertical: t.spacing.xxl,
      paddingHorizontal: t.spacing.lg,
      borderRadius: t.radius.sm,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.borderInput,
      backgroundColor: c.bgElevated,
    },
    emptyIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.md,
    },
    emptyPlus: {fontSize: 28, fontWeight: '300', color: c.brand},
    emptyTitle: {fontSize: 15, fontWeight: '700', color: c.text},
    emptyHint: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 19,
      maxWidth: 280,
    },

    strip: {gap: 12, paddingRight: 4},
    thumbWrap: {position: 'relative'},
    thumb: {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      borderRadius: 14,
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
    },
    moreOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 14,
      backgroundColor: 'rgba(1,69,105,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreText: {fontSize: 15, fontWeight: '800', color: '#FFFFFF'},
    addTile: {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.borderInput,
      backgroundColor: c.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addTilePlus: {fontSize: 22, fontWeight: '400', color: c.brand},
    addTileLabel: {fontSize: 11, fontWeight: '700', color: c.brand, marginTop: 2},
    countLine: {
      fontSize: 12,
      fontWeight: '500',
      color: c.textHint,
      marginTop: t.spacing.md,
    },
  });
