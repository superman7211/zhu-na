export interface Coordinate {
  lat: number;
  lng: number;
}

export interface LocationPoint {
  id: string;
  name: string;
  coords: Coordinate;
  type: 'station' | 'attraction' | 'hotel';
  color?: string;
}

export interface RouteCost {
  destination: string;
  distanceKm: number;
  durationMin: number;
}

export interface HotelResult {
  id: string;
  name: string;
  address: string;
  coords: Coordinate;
  totalDurationMin: number;
  totalDistanceKm: number;
  costs: {
    station: RouteCost; // 1 round trip (Arrival/Departure)
    fuzimiao: RouteCost; // 1 round trip
    zhongshanling: RouteCost; // 1 round trip
    niushoushan: RouteCost; // 1 round trip
  };
  score?: number; // Optional visual score
}

export const ANCHORS: LocationPoint[] = [
  {
    id: 'nanjing_south',
    name: '南京南站 (Station)',
    coords: { lat: 31.968789, lng: 118.798537 },
    type: 'station',
    color: '#3b82f6' // Blue
  },
  {
    id: 'fuzimiao',
    name: '夫子庙 (Fuzimiao)',
    coords: { lat: 32.022579, lng: 118.783786 },
    type: 'attraction',
    color: '#ef4444' // Red
  },
  {
    id: 'zhongshanling',
    name: '中山陵 (Mausoleum)',
    coords: { lat: 32.0643, lng: 118.8483 },
    type: 'attraction',
    color: '#22c55e' // Green
  },
  {
    id: 'niushoushan',
    name: '牛首山 (Niushoushan)',
    coords: { lat: 31.91322, lng: 118.74507 },
    type: 'attraction',
    color: '#eab308' // Yellow
  }
];