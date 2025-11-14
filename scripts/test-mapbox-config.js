/* eslint-disable no-console */
/**
 * Test script to verify Mapbox configuration
 * Run this to check if your Mapbox setup is properly configured
 */

const fs = require('fs');
const path = require('path');
const process = require('process');

console.log('🧪 Testing Mapbox Configuration\n');

// Test 1: Config file checks
try {
  const configPath = path.join(process.cwd(), 'constants', 'config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const hasExtrasConfig = configContent.includes('Constants?.expoConfig?.extra');
  const hasProcessEnv = configContent.includes('process.env.MAPBOX_ACCESS_TOKEN');
  const hasValidation = configContent.includes('startsWith(\'pk.\')');
  const hasFallback = configContent.includes('PUBLIC_MAPBOX_TOKEN');
  
  console.log('✅ Config file checks:');
  console.log(`   - Reads from Expo extra config: ${hasExtrasConfig ? '✅' : '❌'}`);
  console.log(`   - Supports process.env fallback: ${hasProcessEnv ? '✅' : '❌'}`);
  console.log(`   - Has proper token validation: ${hasValidation ? '✅' : '❌'}`);
  console.log(`   - Has public token fallback: ${hasFallback ? '✅' : '❌'}`);
  
} catch (error) {
  console.log('❌ Error reading config file:', error.message);
}

// Test 2: App.json configuration
try {
  const appJsonPath = path.join(process.cwd(), 'app.json');
  const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  const appJson = JSON.parse(appJsonContent);
  
  console.log('\n✅ App.json configuration:');
  console.log(`   - Has extra.MAPBOX_ACCESS_TOKEN: ${!!appJson.expo.extra?.MAPBOX_ACCESS_TOKEN ? '✅' : '❌'}`);
  console.log(`   - Token in app.json: ${appJson.expo.extra?.MAPBOX_ACCESS_TOKEN ? 'Set' : 'Missing'}`);
  
  if (appJson.expo.extra?.MAPBOX_ACCESS_TOKEN) {
    const token = appJson.expo.extra.MAPBOX_ACCESS_TOKEN;
    console.log(`   - Token length: ${token.length} chars`);
    console.log(`   - Token starts with pk.: ${token.startsWith('pk.') ? '✅' : '❌'}`);
  }
  
} catch (error) {
  console.log('\n❌ Error reading app.json:', error.message);
}

// Test 3: .env file
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasMapboxToken = envContent.includes('MAPBOX_ACCESS_TOKEN');
    console.log(`\n✅ .env file: ${hasMapboxToken ? 'Contains MAPBOX_ACCESS_TOKEN' : 'Missing token'}`);
  } else {
    console.log('\n⚠️ .env file: Not found');
  }
} catch (error) {
  console.log('\n❌ Error reading .env file:', error.message);
}

// Test 4: Package.json dependencies
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  
  const hasMapboxMaps = !!packageJson.dependencies?.['@rnmapbox/maps'];
  const mapboxVersion = packageJson.dependencies?.['@rnmapbox/maps'];
  
  console.log('\n✅ Package dependencies:');
  console.log(`   - @rnmapbox/maps installed: ${hasMapboxMaps ? '✅' : '❌'}`);
  if (hasMapboxMaps) {
    console.log(`   - Version: ${mapboxVersion}`);
  }
  
  if (!hasMapboxMaps) {
    console.log('   ⚠️ Install with: npm install @rnmapbox/maps');
  }
  
} catch (error) {
  console.log('\n❌ Error reading package.json:', error.message);
}

console.log('\n📋 Full Configuration Analysis:\n');

console.log('🔧 Problems Identified:');
console.log('Based on your logs:');
console.log('✅ Token loading works correctly');
console.log('❌ @rnmapbox/maps library not loading properly');
console.log('');
console.log('Common causes:');
console.log('1. Library not installed');
console.log('2. Expo build cache issues');
console.log('3. iOS/Android native dependency issues');
console.log('4. Version compatibility issues');

console.log('\n🚀 Solutions to Try:');

console.log('\n1. 📦 Install/Update Dependencies:');
console.log('   npm install @rnmapbox/maps');
console.log('   npx expo install @rnmapbox/maps');

console.log('\n2. 🧹 Clear Expo Cache:');
console.log('   npx expo start --clear');

console.log('\n3. 🔄 Rebuild Project:');
console.log('   npx expo install --fix');

console.log('\n4. 🏗️ For Native Development:');
console.log('   npx expo run:ios    # iOS');
console.log('   npx expo run:android # Android');

console.log('\n5. ⚠️ Check Metro Bundler:');
console.log('   Look for: "📦 Cargando librería @rnmapbox/maps..."');
console.log('   Should see: "✅ Todos los componentes de Mapbox cargados"');

console.log('\n🎯 Expected Runtime Logs:');
console.log('✅ "📦 MapboxGL cargado exitosamente: true"');
console.log('✅ "✅ MapView disponible"');
console.log('✅ "✅ PointAnnotation disponible"');
console.log('✅ "✅ UserLocation disponible"');
console.log('✅ "✅ Camera disponible"');
console.log('✅ "✅ Todos los componentes de Mapbox cargados correctamente"');
console.log('✅ "✅ Token de Mapbox configurado exitosamente"');
console.log('');
console.log('❌ If you see "📦 MapboxGL cargado exitosamente: false"');
console.log('   Then there\'s an installation or compatibility issue');