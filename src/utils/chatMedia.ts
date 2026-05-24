import {Platform} from 'react-native';
import {appDialog} from '../context/dialogRef';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {
  requestCameraPermission,
  requestGalleryPermission,
  showPermissionDenied,
} from './chatPermissions';

const pickerOptions = {
  mediaType: 'photo' as const,
  quality: 0.85 as const,
  selectionLimit: 1,
};

const pickFromResponse = (
  result: ImagePickerResponse,
): string | null => {
  if (result.didCancel || result.errorCode) {
    return null;
  }
  const uri = result.assets?.[0]?.uri;
  return uri || null;
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  const allowed = await requestGalleryPermission();
  if (!allowed) {
    showPermissionDenied('photo library');
    return null;
  }

  const result = await launchImageLibrary(pickerOptions);
  return pickFromResponse(result);
};

export const takePhotoWithCamera = async (): Promise<string | null> => {
  const allowed = await requestCameraPermission();
  if (!allowed) {
    showPermissionDenied('camera');
    return null;
  }

  const result = await launchCamera({
    ...pickerOptions,
    saveToPhotos: Platform.OS === 'ios',
  });
  return pickFromResponse(result);
};

export const showPhotoPickerActions = (
  onPicked: (uri: string) => void,
): void => {
  appDialog.showChoice({
    title: 'Send photo',
    message: 'Choose a source',
    options: [
      {
        text: 'Photo library',
        onPress: async () => {
          const uri = await pickImageFromGallery();
          if (uri) {
            onPicked(uri);
          }
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await takePhotoWithCamera();
          if (uri) {
            onPicked(uri);
          }
        },
      },
    ],
  });
};
