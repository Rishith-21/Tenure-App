import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import BackButton from '../components/navigation/BackButton';
import {useTheme} from '../context/ThemeContext';
import {goBackSafe} from '../navigation/navigationActions';
import type {AppColors} from '../theme/palettes';
import type {DesignTokens} from '../theme/tokens';
import {
  loadProfileGallery,
  saveProfileGallery,
} from '../utils/profileGalleryStorage';
import {fetchProfile, upsertProfile, uploadImage} from '../utils/api';

const COLS = 3;
const GAP = 10;
const H_PAD = 16;
const MAX_PHOTOS = 12;
const {width: SCREEN_W} = Dimensions.get('window');
const TILE = (SCREEN_W - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

type Props = {
  navigation: any;
  route: {
    params?: {
      title?: string;
      images?: string[];
      /** When true, loads/saves companion gallery on device. */
      persistProfile?: boolean;
      canEdit?: boolean;
    };
  };
};

const GalleryScreen = ({navigation, route}: Props) => {
  const {colors, tokens} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, tokens), [colors, tokens]);

  const title = route.params?.title ?? 'Gallery';
  const persistProfile = route.params?.persistProfile === true;
  /** Only the signed-in user's gallery manager enables add/remove. */
  const canEdit = route.params?.canEdit === true;

  const [images, setImages] = useState<string[]>(route.params?.images ?? []);
  const [loaded, setLoaded] = useState(!persistProfile);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  useEffect(() => {
    if (!persistProfile) {
      return;
    }
    let active = true;
    loadProfileGallery().then(stored => {
      if (active) {
        setImages(stored);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [persistProfile]);

  const persist = useCallback(
    async (next: string[]) => {
      if (persistProfile) {
        await saveProfileGallery(next);
        try {
          const res = await fetchProfile();
          if (res) {
            await upsertProfile({
              profilePhoto: res.profilePhoto,
              fullName: res.fullName,
              dob: res.dob,
              gender: res.gender,
              country: res.country,
              state: res.state,
              district: res.district,
              pinCode: res.pinCode,
              languages: res.languages,
              categories: res.categories,
              hourlyRate: res.hourlyRate,
              about: res.about,
              vibes: res.vibes,
              professions: res.professions,
              vehicles: res.vehicles,
              interests: res.interests,
              availableDays: res.availableDays,
              availableTimeRange: res.availableTimeRange,
              bestTime: res.bestTime,
              comfortPreferredPlaces: res.comfortPreferredPlaces,
              comfortTravelRange: res.comfortTravelRange,
              comfortWith: res.comfortWith,
              comfortNotWith: res.comfortNotWith,
              aadhaarVerified: res.aadhaarVerified,
              aadhaarMasked: res.aadhaarMasked,
              instagram: res.instagram,
              facebook: res.facebook,
              youtube: res.youtube,
              website: res.website,
              instantAvailable: res.instantAvailable,
              instantAvailableUntil: res.instantAvailableUntil,
              instantCategories: res.instantCategories,
              instantNote: res.instantNote,
              gallery: next,
            });
          }
        } catch (err) {
          console.log('Failed to sync gallery with backend database:', err);
        }
      }
    },
    [persistProfile],
  );

  const addPhoto = async () => {
    if (!canEdit) {
      return;
    }
    const remaining = MAX_PHOTOS - images.length;
    if (remaining <= 0) {
      return;
    }
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: remaining,
    });
    if (result.didCancel || !result.assets?.length) {
      return;
    }
    const uris = result.assets
      .map(a => a.uri)
      .filter((u): u is string => Boolean(u));

    const uploadedUrls: string[] = [];
    for (const uri of uris) {
      try {
        const url = await uploadImage(uri);
        uploadedUrls.push(url);
      } catch (err) {
        console.log('Failed to upload gallery image:', err);
        uploadedUrls.push(uri);
      }
    }

    const next = [...images, ...uploadedUrls].slice(0, MAX_PHOTOS);
    setImages(next);
    await persist(next);
  };

  const removePhoto = async (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    await persist(next);
    if (viewerUri && images[index] === viewerUri) {
      setViewerUri(null);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <BackButton onPress={() => goBackSafe(navigation)} />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>
            {canEdit
              ? `${images.length}/${MAX_PHOTOS} photos${persistProfile ? ' · saved on device' : ''}`
              : images.length === 1
                ? '1 photo'
                : `${images.length} photos`}
          </Text>
        </View>
        {canEdit ? (
          <Pressable
            style={({pressed}) => [
              styles.addBtn,
              images.length >= MAX_PHOTOS && styles.addBtnDisabled,
              pressed && images.length < MAX_PHOTOS && styles.pressed,
            ]}
            onPress={addPhoto}
            disabled={images.length >= MAX_PHOTOS}
            hitSlop={8}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        ) : null}
      </View>

      {!loaded ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.empty}>Loading gallery…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            {paddingBottom: insets.bottom + 24},
          ]}>
          {images.length === 0 ? (
            <Pressable
              style={({pressed}) => [styles.emptyCard, pressed && canEdit && styles.pressed]}
              onPress={canEdit ? addPhoto : undefined}
              disabled={!canEdit}>
              <Text style={styles.emptyTitle}>No photos yet</Text>
              <Text style={styles.empty}>
                {canEdit
                  ? 'Tap here or + Add to upload from your device gallery.'
                  : 'This companion has not added photos yet.'}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.grid}>
              {images.map((uri, i) => (
                <View key={`${uri}-${i}`} style={styles.tileWrap}>
                  <Pressable
                    onPress={() => setViewerUri(uri)}
                    style={({pressed}) => pressed && styles.pressed}>
                    <Image source={{uri}} style={styles.tile} />
                  </Pressable>
                  {canEdit ? (
                    <Pressable
                      style={({pressed}) => [
                        styles.removeBtn,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => removePhoto(i)}
                      hitSlop={6}
                      accessibilityLabel="Remove photo">
                      <Text style={styles.removeBtnText}>×</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
              {canEdit && images.length < MAX_PHOTOS ? (
                <Pressable
                  style={({pressed}) => [styles.addTile, pressed && styles.pressed]}
                  onPress={addPhoto}>
                  <Text style={styles.addTilePlus}>+</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={viewerUri != null} transparent animationType="fade">
        <Pressable
          style={[styles.viewerScrim, {paddingTop: insets.top, paddingBottom: insets.bottom}]}
          onPress={() => setViewerUri(null)}>
          {viewerUri ? (
            <Image source={{uri: viewerUri}} style={styles.viewerImage} resizeMode="contain" />
          ) : null}
          <Pressable style={styles.viewerClose} onPress={() => setViewerUri(null)}>
            <Text style={styles.viewerCloseText}>Close</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default GalleryScreen;

const createStyles = (c: AppColors, t: DesignTokens) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: c.bgElevated},
    pressed: {opacity: 0.78},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: H_PAD,
      paddingBottom: t.spacing.md,
      gap: t.spacing.md,
      backgroundColor: c.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerCopy: {flex: 1, minWidth: 0},
    headerTitle: {fontSize: 18, fontWeight: '800', color: c.text, letterSpacing: -0.3},
    headerSub: {fontSize: 12.5, fontWeight: '500', color: c.textMuted, marginTop: 2},
    addBtn: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: t.radius.pill,
      backgroundColor: c.brand,
    },
    addBtnDisabled: {opacity: 0.45},
    addBtnText: {fontSize: 13.5, fontWeight: '800', color: '#FFFFFF'},
    scroll: {paddingHorizontal: H_PAD, paddingTop: t.spacing.lg},
    loadingWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    emptyCard: {
      padding: t.spacing.xxl,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
      marginBottom: 8,
    },
    empty: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    grid: {flexDirection: 'row', flexWrap: 'wrap', gap: GAP},
    tileWrap: {position: 'relative'},
    tile: {
      width: TILE,
      height: TILE,
      borderRadius: 14,
      backgroundColor: c.chip,
      borderWidth: 1,
      borderColor: c.border,
    },
    removeBtn: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'rgba(17,17,17,0.72)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeBtnText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 20,
    },
    addTile: {
      width: TILE,
      height: TILE,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.borderInput,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addTilePlus: {fontSize: 28, fontWeight: '300', color: c.brand},
    viewerScrim: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    viewerImage: {width: '100%', height: '78%'},
    viewerClose: {
      position: 'absolute',
      bottom: 32,
      alignSelf: 'center',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: t.radius.pill,
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    viewerCloseText: {color: '#FFFFFF', fontSize: 15, fontWeight: '700'},
  });
