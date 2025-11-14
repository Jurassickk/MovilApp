/**
 * UrbanTracker Dark Theme Configuration
 * Dark color palette with black as predominant color for Google Maps-style interface
 */

import { Platform } from 'react-native';

const tintColorLight = '#1a73e8';
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    surface: '#f5f5f5',
    card: '#ffffff',
    border: '#e0e0e0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    // Google Maps-style colors
    mapContainer: '#ffffff',
    searchBar: '#f5f5f5',
    searchBarText: '#11181C',
    searchBarBorder: '#e0e0e0',
    controlButton: '#f5f5f5',
    controlButtonBorder: '#e0e0e0',
    controlButtonActive: '#1a73e8',
    marker: '#ff4444',
    markerInfo: '#ffffff',
    // UrbanTracker specific colors
    primary: '#1a73e8', // Blue accent
    secondary: '#34a853', // Green secondary
    accent: '#ff9800', // Orange accent
    warning: '#ff4444',
    success: '#34a853',
    info: '#1a73e8',
  },
  dark: {
    text: '#ffffff',
    background: '#000000', // Primary black background
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    surface: '#121212', // Dark gray surface
    card: '#1e1e1e', // Slightly lighter than background for cards
    border: '#333333', // Dark gray borders
    overlay: 'rgba(255, 255, 255, 0.1)',
    // Google Maps-style colors
    mapContainer: '#000000', // Black map background
    searchBar: '#1a1a1a', // Dark gray search bar
    searchBarText: '#ffffff',
    searchBarBorder: '#333333',
    controlButton: '#2d2d2d', // Control buttons
    controlButtonBorder: '#444444',
    controlButtonActive: '#1a73e8', // Blue for active states
    marker: '#ff4444', // Red for markers
    markerInfo: '#000000',
    // UrbanTracker specific colors
    primary: '#1a73e8', // Blue accent
    secondary: '#34a853', // Green secondary
    accent: '#ff9800', // Orange accent
    warning: '#ff4444',
    success: '#34a853',
    info: '#1a73e8',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

import { ENV } from './config';

// Mapbox configuration
export const MapboxConfig = {
  // Load token from environment variables
  accessToken: ENV.MAPBOX_ACCESS_TOKEN,
  // Default map style - using dark style for UrbanTracker
  style: 'mapbox://styles/mapbox/dark-v11',
  // Alternative dark styles
  darkStyles: [
    'mapbox://styles/mapbox/dark-v11',
    'mapbox://styles/mapbox/streets-v12',
    'mapbox://styles/mapbox/outdoors-v12',
  ],
  // Camera settings
  camera: {
    centerCoordinate: [-74.006, 40.7128], // NYC coordinates
    zoomLevel: 12,
    minZoomLevel: 8,
    maxZoomLevel: 20,
  },
  // Location settings
  location: {
    enabled: true,
    onPress: true,
    animationDuration: 1000,
  },
};

// UrbanTracker app configuration
export const UrbanTrackerConfig = {
  appName: 'UrbanTracker',
  version: '1.0.0',
  // Supported map features
  features: {
    search: true,
    currentLocation: true,
    directions: true,
    markers: true,
    layers: true,
  },
  // Default markers configuration
  markers: {
    urbanFeatures: '#ff4444',
    publicTransport: '#1a73e8',
    pointsOfInterest: '#34a853',
    events: '#ff9800',
  },
  // UI Configuration
  ui: {
    headerHeight: 60,
    searchBarHeight: 50,
    controlButtonSize: 44,
    markerSize: 32,
  },
};
