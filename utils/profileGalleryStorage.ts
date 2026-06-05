import AsyncStorage from '@react-native-async-storage/async-storage';

const GALLERY_KEY = '@tenure/profile_gallery';

export async function loadProfileGallery(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(GALLERY_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((u): u is string => typeof u === 'string' && u.length > 0);
  } catch {
    return [];
  }
}

export async function saveProfileGallery(uris: string[]): Promise<void> {
  await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(uris));
}
