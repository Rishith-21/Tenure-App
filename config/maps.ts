/**
 * Map configuration
 *
 * Android: create a Google Maps API key (Maps SDK for Android) and set it below
 * or in android/app/src/main/res/values/strings.xml as `google_maps_api_key`.
 *
 * iOS: Apple Maps works without a Google key. Optional: add Google Maps iOS SDK key in AppDelegate.
 */
export const GOOGLE_MAPS_API_KEY = '';

/** Belman, Karnataka — default until GPS / backend profile location is available */
export const DEFAULT_MAP_REGION = {
  latitude: 13.0689,
  longitude: 74.75,
  latitudeDelta: 0.045,
  longitudeDelta: 0.045,
};

export const mapsEnabledOnAndroid = (): boolean => true;
