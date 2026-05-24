import {PermissionsAndroid, Platform} from 'react-native';
import {appDialog} from '../context/dialogRef';

export const requestMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone permission',
        message: 'Tenure needs your microphone to send voice messages.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

export const requestGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Photos permission',
      message: 'Tenure needs access to your photos to send images in chat.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    });

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return true;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera permission',
        message: 'Tenure needs your camera to take photos in chat.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

export const showPermissionDenied = (feature: string) => {
  appDialog.showAlert({
    title: 'Permission required',
    message: `Please allow access in Settings to use ${feature}.`,
  });
};
