import { Platform } from 'react-native';

// Environment variables loaded from .env file
export const ENV = {
  MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoiYWZzYjExNCIsImEiOiJjbWI1bmN2OGYxanloMmlvbjd0dndtb3g5In0.2ON4hP04tvToiU_p_IsHbg',
  APP_NAME: 'UrbanTracker',
  APP_VERSION: '1.0.0',
};

// Development check
export const isDevelopment = __DEV__;

// Debug info (only in development)
if (isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    mapboxToken: ENV.MAPBOX_ACCESS_TOKEN === 'pk.eyJ1IjoiYWZzYjExNCIsImEiOiJjbWI1bmN2OGYxanloMmlvbjd0dndtb3g5In0.2ON4hP04tvToiU_p_IsHbg' ? 
      'NOT_SET - Please add token to .env file' : 
      `***${ENV.MAPBOX_ACCESS_TOKEN.slice(-4)}`,
    appName: ENV.APP_NAME,
    version: ENV.APP_VERSION,
    platform: Platform.OS,
  });
}