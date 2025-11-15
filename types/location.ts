export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface LocationConfig {
  UPDATE_INTERVAL: number;
  DISTANCE_INTERVAL: number;
  ACCURACY_THRESHOLD: number;
  TIMEOUT: number;
}

export interface LocationServiceConfig {
  updateInterval: number;
  distanceInterval: number;
  accuracyThreshold: number;
  timeout: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: string;
  vehicleId: string;
  routeId?: string;
  source: string;
  hasAssignedRoute: boolean;
  trackingType: 'assigned_route' | 'free_tracking';
}