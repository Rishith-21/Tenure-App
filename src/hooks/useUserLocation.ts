import {useCallback, useEffect, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {DEFAULT_MAP_REGION} from '../config/maps';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type State = {
  coordinate: MapCoordinate | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
};

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location access',
      message: 'Tenure uses your location to show you on the map and find nearby mates.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export function useUserLocation(enabled = true) {
  const [state, setState] = useState<State>({
    coordinate: null,
    loading: enabled,
    error: null,
    permissionDenied: false,
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setState(s => ({...s, loading: true, error: null}));

    const allowed = await requestLocationPermission();
    if (!allowed) {
      setState({
        coordinate: null,
        loading: false,
        error: null,
        permissionDenied: true,
      });
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setState({
          coordinate: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      err => {
        setState({
          coordinate: null,
          loading: false,
          error: err.message || 'Could not get location',
          permissionDenied: false,
        });
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 60000},
    );
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const region = state.coordinate
    ? {
        ...state.coordinate,
        latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
        longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
      }
    : DEFAULT_MAP_REGION;

  return {
    ...state,
    region,
    refresh,
    fallbackCoordinate: {
      latitude: DEFAULT_MAP_REGION.latitude,
      longitude: DEFAULT_MAP_REGION.longitude,
    },
  };
}
