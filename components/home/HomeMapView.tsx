import React, {useEffect, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {mapsEnabledOnAndroid} from '../../config/maps';
import {useUserLocation} from '../../hooks/useUserLocation';
import {useTheme} from '../../context/ThemeContext';
import {focusRegionFor, MapCoordinate} from '../../utils/meetMapCoords';
import HomeMapPlaceholder from './HomeMapPlaceholder';

export type HomeMapMarker = {
  id: string;
  coordinate: MapCoordinate;
  title: string;
  selected: boolean;
};

export type MapEdgePadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type HomeMapLocationProps = {
  region: Region;
  loading: boolean;
  permissionDenied: boolean;
  refresh: () => void;
};

type Props = {
  focusCoordinate?: MapCoordinate | null;
  markers?: HomeMapMarker[];
  locationLabel?: string;
  /** When provided, skips an internal GPS fetch (use parent `useUserLocation`). */
  userLocation?: HomeMapLocationProps;
  /** Tapping the map (not a pin) — e.g. collapse meet deck on Home */
  onMapPress?: () => void;
  /** Keeps the focused point in the visible “sweet spot” above bottom UI */
  mapPadding?: MapEdgePadding;
};

const defaultPadding: MapEdgePadding = {
  top: 120,
  right: 12,
  bottom: 200,
  left: 12,
};

const HomeMapView = ({
  focusCoordinate,
  markers = [],
  locationLabel = 'Your area',
  userLocation: userLocationProp,
  onMapPress,
  mapPadding = defaultPadding,
}: Props) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mapRef = useRef<MapView>(null);
  const internalLocation = useUserLocation(userLocationProp == null);
  const {region, loading, permissionDenied, refresh} =
    userLocationProp ?? internalLocation;

  const canShowNativeMap =
    Platform.OS === 'ios' || (Platform.OS === 'android' && mapsEnabledOnAndroid());

  const userRegion: Region = useMemo(
    () => ({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }),
    [region],
  );

  const paddingKey = `${mapPadding.top}-${mapPadding.bottom}`;

  useEffect(() => {
    if (!focusCoordinate || !mapRef.current) {
      return;
    }
    const r = focusRegionFor(focusCoordinate);
    mapRef.current.animateToRegion(r, 420);
  }, [focusCoordinate?.latitude, focusCoordinate?.longitude, paddingKey]);

  if (!canShowNativeMap) {
    return (
      <View style={styles.wrap}>
        <HomeMapPlaceholder onBackdropPress={onMapPress} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={userRegion}
        mapPadding={mapPadding}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        accessibilityLabel={locationLabel}
        onPress={() => onMapPress?.()}>
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            anchor={{x: 0.5, y: 1}}
            tracksViewChanges={false}
            title={marker.title}
            description={marker.selected ? 'Selected meet' : undefined}
            pinColor={marker.selected ? colors.brandDark : colors.brandMuted}
          />
        ))}
      </MapView>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : null}

      {permissionDenied ? (
        <Pressable style={styles.permissionChip} onPress={refresh}>
          <Text style={styles.permissionText}>Enable location</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default HomeMapView;

const createStyles = (c: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      overflow: 'hidden',
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    loading: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: c.bg,
      borderRadius: 20,
      padding: 8,
      elevation: 3,
    },
    permissionChip: {
      position: 'absolute',
      top: '42%',
      alignSelf: 'center',
      backgroundColor: c.brand,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    permissionText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });
