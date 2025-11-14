# UrbanTracker - Google Maps-Style Mobile App

Una aplicación móvil moderna estilo Google Maps para seguimiento urbano, construida con React Native, Expo y Mapbox.

## 🚀 Características

- **Interfaz Estilo Google Maps**: UI familiar con tema oscuro y negro como color predominante
- **Integración Mapbox**: Mapeo interactivo de alta calidad
- **Ubicación en Tiempo Real**: GPS y servicios de ubicación
- **Controles Interactivos**: Zoom, cambio de capas, ubicación actual y navegación
- **Marcadores Urbanos**: Características urbanas, transporte público y puntos de interés
- **Tema Oscuro**: Optimizado para visualización nocturna

## 🛠 Instalación y Configuración

### Prerrequisitos
- Node.js (16 o superior)
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Cuenta de Mapbox (para token de API)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Token de Mapbox

**Opción A: Archivo .env (Recomendado)**
1. Ve a [mapbox.com](https://www.mapbox.com/) y crea una cuenta
2. Obtén tu token de acceso desde [account access tokens](https://www.mapbox.com/account/access-tokens/)
3. Edita el archivo `.env` en la raíz del proyecto:
```bash
# UrbanTracker Environment Variables
MAPBOX_ACCESS_TOKEN=pk.tu_token_real_aqui
APP_NAME=UrbanTracker
APP_VERSION=1.0.0
```

**Opción B: Configuración Directa**
Si prefieres configurar directamente, edita `constants/config.ts`:
```typescript
export const ENV = {
  MAPBOX_ACCESS_TOKEN: 'pk.tu_token_real_aqui',
  APP_NAME: 'UrbanTracker',
  APP_VERSION: '1.0.0',
};
```

### 3. Ejecutar la App
```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en plataformas específicas
npm run ios     # Simulador iOS
npm run android # Emulador Android
npm run web     # Navegador Web
```

## 📁 Estructura del Proyecto

```
MovilApp/
├── .env                    # Variables de entorno (tu token aquí)
├── .env.example           # Plantilla de variables
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Layout de navegación
│   │   ├── index.tsx      # Pantalla de inicio
│   │   ├── map.tsx        # Pantalla de mapa principal
│   │   └── explore.tsx    # Pantalla de exploración
│   ├── _layout.tsx        # Layout raíz
│   └── modal.tsx          # Pantalla modal
├── components/
│   ├── MapControls.tsx    # Controles de mapa
│   └── ui/                # Componentes UI
├── constants/
│   ├── config.ts         # Configuración de entorno
│   └── theme.ts          # Tema oscuro y config Mapbox
└── assets/
    └── images/           # Logos UrbanTracker (SVG)
```

## 🗺️ Funcionalidades del Mapa

### Controles Disponibles
- **Zoom In/Out**: Botones +/- en la esquina superior derecha
- **Ubicación Actual**: Botón GPS para centrar en tu ubicación
- **Selector de Capas**: Cambia entre Dark, Streets, Outdoors, Satellite, Hybrid
- **Búsqueda**: Barra de búsqueda con entrada de voz
- **Navegación**: Función de direcciones (próximamente)

### Tipos de Marcadores
- **🔴 Urbano**: Características urbanas (edificios, parques)
- **🔵 Transporte**: Rutas y paradas de transporte público
- **🟢 POI**: Puntos de interés (monumentos, museos)
- **🟡 Eventos**: Eventos y actividades urbanas

### Temas de Mapa Disponibles
- **Dark**: Tema oscuro para visualización nocturna
- **Streets**: Mapa detallado de calles
- **Outdoors**: Características al aire libre y senderos
- **Satellite**: Imágenes satelitales
- **Hybrid**: Satélite con etiquetas de calles

## 🎨 Tema Oscuro

La aplicación utiliza un tema oscuro completo con negro como color predominante:

- **Fondo Principal**: `#000000` (negro puro)
- **Superficies**: `#121212`, `#1e1e1e`
- **Botones**: `#2d2d2d`
- **Bordes**: `#333333`
- **Acentos**: 
  - Azul: `#1a73e8`
  - Verde: `#34a853`
  - Naranja: `#ff9800`

## 🔧 Configuración de Desarrollo

### Variables de Entorno
El proyecto usa variables de entorno para configuraciones sensibles:

```bash
# Archivo .env (crear este archivo)
MAPBOX_ACCESS_TOKEN=pk.tu_token_real_aqui
APP_NAME=UrbanTracker
APP_VERSION=1.0.0
```

### Detección Automática
La aplicación detecta automáticamente:
- ✅ Si Mapbox está configurado → Muestra mapa interactivo
- ⚠️ Si no hay token → Muestra UI de respaldo elegante
- 📱 Plataforma del dispositivo → Ajusta comportamiento

## 🐛 Solución de Problemas

### Mapbox no funciona
1. Verifica que el token sea válido en [mapbox.com](https://www.mapbox.com/)
2. Asegúrate de que el token tenga los permisos correctos
3. Revisa la consola de desarrollo para mensajes de error

### Problemas de Ubicación
1. Verifica permisos de ubicación en configuración del dispositivo
2. Asegúrate de que los servicios de ubicación estén habilitados
3. Prueba con un dispositivo real (la ubicación puede no funcionar en simulador)

### Errores de Compilación
1. Limpia la caché: `npm start -- --clear`
2. Reinicia Metro bundler
3. Verifica que todas las dependencias estén instaladas

## 📱 Uso de la App

### Pantalla de Inicio
- Logo de UrbanTracker con branding completo
- Estadísticas de la aplicación (500+ características urbanas, 50+ rutas de transporte)
- Descripción de características clave
- Botón para navegar al mapa

### Pantalla de Mapa
- **Header**: Logo + botón de búsqueda
- **Mapa**: Interfaz estilo Google Maps con todos los controles
- **Controles**: Zoom, ubicación, capas, navegación
- **Marcadores**: Características urbanas interactivas
- **Tarjetas**: Información detallada de ubicaciones

## 🚀 Despliegue

### Para Desarrollo
```bash
npm start
```

### Para Producción
```bash
# Build para iOS
eas build --platform ios

# Build para Android
eas build --platform android

# Build para Web
eas build --platform web
```

## 🤝 Contribución

1. Sigue la estructura de código existente
2. Mantén la consistencia del tema oscuro
3. Prueba en iOS y Android
4. Actualiza documentación para nuevas características

## 📄 Licencia

Este proyecto utiliza Expo, React Native y Mapbox. Asegúrate de cumplir con sus términos de licencia respectivos.

---

**Construido con ❤️ para Exploración Urbana**

### 🔗 Enlaces Útiles
- [Documentación de Mapbox](https://docs.mapbox.com/)
- [Documentación de Expo](https://docs.expo.dev/)
- [Tokens de Mapbox](https://www.mapbox.com/account/access-tokens/)
