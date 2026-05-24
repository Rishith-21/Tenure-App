import React, {useMemo} from 'react';
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
import {UI} from '../../theme/ui';
import HomeMapPlaceholder from './HomeMapPlaceholder';

type Props = {
  locationLabel?: string;
};

const HomeMapView = ({locationLabel = 'Your area'}: Props) => {
  const {region, coordinate, loading, permissionDenied, refresh} =
    useUserLocation(true);

  const canShowNativeMap =
    Platform.OS === 'ios' || (Platform.OS === 'android' && mapsEnabledOnAndroid());

  const mapRegion: Region = useMemo(
    () => ({
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    }),
    [region],
  );

  if (!canShowNativeMap) {
    return (
      <View style={styles.wrap}>
        <HomeMapPlaceholder />
        <View style={styles.setupBanner}>
          <Text style={styles.setupTitle}>Map SDK</Text>
          <Text style={styles.setupText}>
            Add a Google Maps API key in{' '}
            <Text style={styles.setupCode}>src/config/maps.ts</Text> (Android).
            iOS uses Apple Maps automatically.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}>
        <Marker
          coordinate={{
            latitude: coordinate?.latitude ?? mapRegion.latitude,
            longitude: coordinate?.longitude ?? mapRegion.longitude,
          }}
          title={locationLabel}
          description={
            permissionDenied
              ? 'Location off — showing default area'
              : 'You are here'
          }
        />
      </MapView>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={UI.brand} />
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

const styles = StyleSheet.create({
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
    backgroundColor: UI.card,
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  permissionChip: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: UI.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  setupBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 59, 87, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  setupTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  setupText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    lineHeight: 16,
  },
  setupCode: {
    fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
    fontWeight: '600',
  },
});
