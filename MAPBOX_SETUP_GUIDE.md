# 🔑 Guía de Configuración de Token de Mapbox

## Problema Identificado
El token actual en la aplicación es un token de placeholder que no funciona para cargar mapas reales de Mapbox.

## Solución Paso a Paso

### 1. 🔍 Obtener un Token Real de Mapbox
1. Ve a [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Crea una cuenta gratuita si no tienes una
3. Crea un nuevo token con los siguientes scopes:
   - `styles:read`
   - `fonts:read` 
   - `datasets:read`
   - `vision:read`

### 2. 💾 Actualizar el Token en la Aplicación

#### Opción A: Actualizar app.json (Recomendado)
1. Abre `app.json`
2. Busca la línea:
   ```json
   "MAPBOX_ACCESS_TOKEN": "pk.eyJ1IjoiYWZzYjExNCIsImEiOiJjbWI1bmN2OGYxanloMmlvbjd0dndtb3g5In0.2ON4hP04tvToiU_p_IsHbg"
   ```
3. Reemplaza con tu token real:
   ```json
   "MAPBOX_ACCESS_TOKEN": "tu_token_real_aqui"
   ```

#### Opción B: Actualizar .env
1. Abre `.env`
2. Busca:
   ```
   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiYWZzYjExNCIsImEiOiJjbWI1bmN2OGYxanloMmlvbjd0dndtb3g5In0.2ON4hP04tvToiU_p_IsHbg
   ```
3. Reemplaza con:
   ```
   MAPBOX_ACCESS_TOKEN=tu_token_real_aqui
   ```

### 3. 🔄 Reiniciar el Servidor
```bash
# Parar el servidor actual (Ctrl+C)
npm start
```

### 4. ✅ Verificar la Configuración
El script de testing mejorado debería mostrar:
```
🧪 Testing Mapbox Token Configuration

✅ Config file checks:
   - Reads from Expo extra config: ✅
   - Supports process.env fallback: ✅
   - Has proper token validation: ✅

✅ App.json configuration:
   - Has extra.MAPBOX_ACCESS_TOKEN: ✅
   - Token in app.json: Set

✅ .env file: Contains MAPBOX_ACCESS_TOKEN

🔧 UrbanTracker Environment:
  mapboxToken: ✅ Configured (pk.eyJ1Ijoi....)
```

### 5. 📱 Probar en la Aplicación
1. Inicia la aplicación: `npm start`
2. Abre la pestaña del mapa
3. Deberías ver:
   - ✅ Mensaje "Mapbox token set successfully" en la consola
   - 🗺️ Mapa cargado con estilo oscuro
   - 📍 Tu ubicación si das permisos
   - 📌 Marcadores de ejemplo visibles

## 🚨 Solución de Problemas

### Si Sigues Viendo Warnings:
1. **Limpia la caché de Metro:**
   ```bash
   npx expo start --clear
   ```

2. **Verifica la configuración:**
   ```bash
   node scripts/test-mapbox-config.js
   ```

3. **Verifica que el token sea válido:**
   - Debe comenzar con `pk.`
   - Debe tener más de 50 caracteres
   - No debe ser el token placeholder

### Códigos de Error Comunes:
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Token no tiene los permisos correctos
- `Network Error`: Token válido pero problemas de conexión

## 🔧 Tokens de Prueba (Solo para Testing)
Si necesitas un token temporal para pruebas:
1. Usa el token público de Mapbox (limitado): `pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`

2. O crea una cuenta gratuita en Mapbox para obtener un token completo

## 📊 Verificación Final
Una vez configurado correctamente, deberías ver en la consola:
```
🚀 Inicializando Mapbox - Estado actual: {
  platform: ios,
  hasMapboxGL: true,
  isConfigured: true,
  tokenPreview: "pk.eyJ1Ijoi....",
  tokenLength: 65
}

✅ Token de Mapbox configurado exitosamente
✅ Confirmación de token exitosa
```

Y en la aplicación:
- Mapa cargando completamente
- Sin mensajes de advertencia sobre tokens
- Funcionalidad de ubicación activa
- Interfaz de mapas interactiva funcionando