import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Token público de Mapbox para pruebas (funciona para mapas básicos)
const PUBLIC_MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

// Múltiples fuentes de configuración para mayor robustez
export const getMapboxToken = (): string => {
  let token = '';
  
  // 1. Intentar desde Expo Constants (app.json extra)
  if (Constants?.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN) {
    token = Constants.expoConfig.extra.MAPBOX_ACCESS_TOKEN;
    console.log('🔑 Token cargado desde Expo Constants');
  }
  
  // 2. Fallback a process.env (para desarrollo local)
  if (!token && process.env.MAPBOX_ACCESS_TOKEN) {
    token = process.env.MAPBOX_ACCESS_TOKEN;
    console.log('🔑 Token cargado desde process.env');
  }
  
  // 3. Fallback a Constants.default (por compatibilidad)
  if (!token && (Constants as any)?.default?.MAPBOX_ACCESS_TOKEN) {
    token = (Constants as any).default.MAPBOX_ACCESS_TOKEN;
    console.log('🔑 Token cargado desde Constants.default');
  }
  
  // 4. Si no hay token, usar token público de Mapbox
  if (!token) {
    console.log('⚠️ No se encontró token personalizado, usando token público de Mapbox');
    console.log('⚠️ Para mejores funciones, configura tu propio token en:');
    console.log('   1. app.json: expo.extra.MAPBOX_ACCESS_TOKEN');
    console.log('   2. .env: MAPBOX_ACCESS_TOKEN');
    token = PUBLIC_MAPBOX_TOKEN;
  }
  
  return token;
};

// Token por defecto - Solo para desarrollo (token público de Mapbox)
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

// Configuración de entorno mejorada
export const ENV = {
  MAPBOX_ACCESS_TOKEN: getMapboxToken(),
  APP_NAME: 'UrbanTracker',
  APP_VERSION: '1.0.0',
};

// Verificación mejorada de configuración
export const isMapboxConfigured = (): boolean => {
  const token = ENV.MAPBOX_ACCESS_TOKEN;
  
  // Verificaciones múltiples
  const hasValidLength = token && token.length > 20;
  const hasValidPrefix = token && token.startsWith('pk.');
  const isNotDefault = token && token !== DEFAULT_MAPBOX_TOKEN;
  const hasValidFormat = hasValidLength && token.includes('.');
  
  const isConfigured = Boolean(hasValidLength && hasValidPrefix && isNotDefault && hasValidFormat);
  
  console.log('🔍 Verificación de Mapbox:', {
    tokenLength: token?.length || 0,
    startsWithPK: hasValidPrefix,
    notDefault: isNotDefault,
    hasValidFormat: hasValidFormat,
    isConfigured: isConfigured,
    tokenPreview: token ? `${token.substring(0, 12)}...` : 'No token'
  });
  
  return isConfigured;
};

// Development check
export const isDevelopment = __DEV__;

// Debug info mejorado
if (isDevelopment) {
  const token = ENV.MAPBOX_ACCESS_TOKEN;
  const isValidToken = isMapboxConfigured();
  
  console.log('🔧 UrbanTracker Environment:', {
    mapboxToken: isValidToken ? 
      `✅ Configured (${token.substring(0, 12)}...)` : 
      '❌ NOT_SET - Using default placeholder',
    appName: ENV.APP_NAME,
    version: ENV.APP_VERSION,
    platform: Platform.OS,
    sourcesChecked: {
      expoConstants: !!Constants?.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN,
      processEnv: !!process.env.MAPBOX_ACCESS_TOKEN,
      constantsDefault: !!(Constants as any)?.default?.MAPBOX_ACCESS_TOKEN
    }
  });
}