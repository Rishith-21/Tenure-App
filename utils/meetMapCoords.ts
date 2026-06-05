import {DEFAULT_MAP_REGION} from '../config/maps';
import {MateRequest} from '../types/mateRequest';

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

/** Stable demo coordinates around Belman / Udupi when API coords missing */
const MATE_COORDS: Record<string, MapCoordinate> = {
  'u-eagle': {latitude: 13.0662, longitude: 74.7488},
  'u-spider': {latitude: 12.9141, longitude: 74.856},
  'u-duck': {latitude: 13.0705, longitude: 74.7542},
  u1: {latitude: 13.0648, longitude: 74.7465},
  'recv-raguram': {latitude: 13.0751, longitude: 74.7412},
  'recv-flamingo-pending': {latitude: 13.0698, longitude: 74.7525},
  'sent-eagle-confirmed': {latitude: 13.0662, longitude: 74.7488},
  'recv-spider-confirmed': {latitude: 12.9141, longitude: 74.856},
  'sent-john-active': {latitude: 13.0648, longitude: 74.7465},
  'active-swan': {latitude: 13.0714, longitude: 74.7508},
};

export const getMeetCoordinate = (
  id: string,
  req?: Pick<MateRequest, 'mateLatitude' | 'mateLongitude' | 'mateUserId'>,
): MapCoordinate => {
  if (
    req?.mateLatitude != null &&
    req?.mateLongitude != null &&
    Number.isFinite(req.mateLatitude) &&
    Number.isFinite(req.mateLongitude)
  ) {
    return {latitude: req.mateLatitude, longitude: req.mateLongitude};
  }
  if (MATE_COORDS[id]) {
    return MATE_COORDS[id];
  }
  if (req?.mateUserId && MATE_COORDS[req.mateUserId]) {
    return MATE_COORDS[req.mateUserId];
  }
  return {
    latitude: DEFAULT_MAP_REGION.latitude,
    longitude: DEFAULT_MAP_REGION.longitude,
  };
};

export const focusRegionFor = (coord: MapCoordinate) => ({
  ...coord,
  latitudeDelta: 0.028,
  longitudeDelta: 0.028,
});
