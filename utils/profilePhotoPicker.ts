import {launchImageLibrary} from 'react-native-image-picker';
import {
  requestGalleryPermission,
  showPermissionDenied,
} from './chatPermissions';

export type PickedPhoto = {
  uri: string;
  width: number;
  height: number;
};

/**
 * Pick a photo from the gallery (no native crop module). Caller shows crop UI.
 */
export async function pickProfilePhotoFromLibrary(): Promise<PickedPhoto | null> {
  const allowed = await requestGalleryPermission();
  if (!allowed) {
    showPermissionDenied('profile photos');
    return null;
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 1,
  });

  if (result.didCancel || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const uri = asset.uri;
  const width = asset.width ?? 0;
  const height = asset.height ?? 0;

  if (!uri || width <= 0 || height <= 0) {
    return null;
  }

  return {uri, width, height};
}
