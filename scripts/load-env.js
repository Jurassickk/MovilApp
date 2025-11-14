/**
 * Script para cargar variables de entorno en Expo
 * Ejecuta este script antes de iniciar la app para cargar .env
 */

const fs = require('fs');
const path = require('path');

// Ruta del archivo .env
const envPath = path.join(__dirname, '..', '.env');
const constantsPath = path.join(__dirname, 'config.ts');

// Verificar si existe el archivo .env
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Archivo .env no encontrado.');
  console.log('📝 Copia .env.example a .env y configura tu token de Mapbox');
  process.exit(1);
}

// Leer variables de entorno
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, value] = trimmedLine.split('=');
    if (key && value) {
      envVars[key] = value.replace(/['"]/g, ''); // Remover comillas
    }
  }
});

// Actualizar config.ts con variables de entorno
const configContent = `
import { Platform } from 'react-native';

// Environment variables loaded from .env file
export const ENV = {
  MAPBOX_ACCESS_TOKEN: '${envVars.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE'}',
  APP_NAME: '${envVars.APP_NAME || 'UrbanTracker'}',
  APP_VERSION: '${envVars.APP_VERSION || '1.0.0'}',
};

// Development check
export const isDevelopment = __DEV__;

// Debug info (only in development)
if (isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    mapboxToken: ENV.MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' ? 
      'NOT_SET - Please add token to .env file' : 
      \`***\${ENV.MAPBOX_ACCESS_TOKEN.slice(-4)}\`,
    appName: ENV.APP_NAME,
    version: ENV.APP_VERSION,
    platform: Platform.OS,
  });
}
`;

fs.writeFileSync(constantsPath, configContent.trim());
console.log('✅ Variables de entorno cargadas en config.ts');