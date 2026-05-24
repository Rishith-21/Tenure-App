import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import {UI, uiLayout, uiStyles} from '../theme/ui';

const COLS = 3;
const GAP = 10;
const {width: SCREEN_W} = Dimensions.get('window');
const TILE = (SCREEN_W - 40 - GAP * (COLS - 1)) / COLS;

type Props = {
  navigation: any;
  route: any;
};

const GalleryScreen = ({navigation, route}: Props) => {
  const insets = useSafeAreaInsets();
  const title = (route.params?.title as string) ?? 'Gallery';
  const initial: string[] = route.params?.images ?? [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
    'https://picsum.photos/400/400?random=3',
  ];
  const [images, setImages] = useState<string[]>(initial);

  const addPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 3,
    });
    if (result.didCancel || !result.assets?.length) {
      return;
    }
    const uris = result.assets
      .map(a => a.uri)
      .filter((u): u is string => Boolean(u));
    setImages(prev => [...prev, ...uris]);
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top + 8}]}>
      <StatusBar backgroundColor={UI.bg} barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={uiStyles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          style={({pressed}) => [styles.addPill, pressed && styles.addPressed]}
          onPress={addPhoto}
          hitSlop={8}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <View style={styles.sectionCard}>
          {images.length === 0 ? (
            <Text style={styles.empty}>
              No photos yet. Tap + Add to upload from your device.
            </Text>
          ) : (
            <View style={styles.grid}>
              {images.map((uri, i) => (
                <Image
                  key={`${uri}-${i}`}
                  source={{uri}}
                  style={styles.tile}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: UI.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  addPill: {
    backgroundColor: UI.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: UI.borderPill,
    minWidth: 72,
    alignItems: 'center',
  },
  addPressed: {
    opacity: 0.9,
  },
  addText: {
    fontSize: 14,
    fontWeight: '800',
    color: UI.brand,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    ...uiLayout.sectionCard,
    marginBottom: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 16,
    backgroundColor: UI.chip,
    borderWidth: 2,
    borderColor: UI.card,
  },
  empty: {
    fontSize: 14,
    color: UI.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: 32,
  },
});
