import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ENV } from '@/constants/config';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export default function SimpleMapScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  
  // Ubicación por defecto (Bogotá, Colombia)
  const DEFAULT_LOCATION: UserLocation = {
    latitude: 4.6097,
    longitude: -74.0817,
    accuracy: 0
  };
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(DEFAULT_LOCATION);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapHtml, setMapHtml] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  // Generar mapa HTML inicial con ubicación por defecto
  useEffect(() => {
    console.log('🗺️ Generando mapa con ubicación por defecto...');
    generateMapHTML(DEFAULT_LOCATION);
  }, []);

  // Request location permissions en segundo plano
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        console.log('📍 Solicitando permisos de ubicación en segundo plano...');
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('❌ Permisos de ubicación denegados');
          setIsLoadingLocation(false);
          return;
        }
        
        console.log('✅ Permisos de ubicación concedidos');
        
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        console.log('📍 Ubicación obtenida:', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        });
        
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined
        };
        
        setUserLocation(newLocation);
        
        // Actualizar mapa con ubicación real
        generateMapHTML(newLocation);
        
        setIsLoadingLocation(false);
        
      } catch (error) {
        console.error('❌ Error obteniendo ubicación:', error);
        setIsLoadingLocation(false);
      }
    };

    requestLocationPermission();
  }, []);

  // Generate HTML for Mapbox GL JS con estilo Google Maps/iPhone y paleta oscura
  const generateMapHTML = (location: UserLocation) => {
    const mapboxToken = ENV.MAPBOX_ACCESS_TOKEN;
    const isDark = colorScheme === 'dark';
    
    // Estilo oscuro similar a Google Maps/iPhone
    const mapStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Mi Ubicación</title>
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            width: 100%; 
            overflow: hidden;
            background-color: ${isDark ? '#0a0a0a' : '#ffffff'};
          }
          #map { 
            height: 100%; 
            width: 100%; 
          }
          
        
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = '${mapboxToken}';
          
          const map = new mapboxgl.Map({
            container: 'map',
            style: '${mapStyle}',
            center: [${location.longitude}, ${location.latitude}],
            zoom: 15,
            pitch: 0,
            bearing: 0,
            attributionControl: false,
            logoPosition: 'bottom-left'
          });
          
          // Controles de navegación estilo Google Maps
          map.addControl(new mapboxgl.NavigationControl({
            visualizePitch: true
          }), 'top-right');
          
          map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
          
          map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true,
            showAccuracyCircle: true,
            showUserLocation: true
          }), 'top-right');
          
          // Marcador de ubicación estilo Google Maps/iPhone
          const userLocationMarker = new mapboxgl.Marker({
            element: createCustomMarker(),
            scale: 1
          })
            .setLngLat([${location.longitude}, ${location.latitude}])
            .setPopup(new mapboxgl.Popup({ 
              offset: 30,
              closeButton: false,
              closeOnClick: false,
              maxWidth: '250px'
            })
              .setHTML(\`
                <div class="popup-title">📍 Mi Ubicación</div>
                <div class="popup-coords">${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}</div>
                <div class="popup-accuracy">Precisión: ${location.accuracy ? location.accuracy.toFixed(0) + 'm' : 'N/A'}</div>
              \`))
            .addTo(map);
          
          // Función para crear marcador personalizado estilo Google Maps
          function createCustomMarker() {
            const marker = document.createElement('div');
            marker.style.cssText = \`
              width: 20px;
              height: 20px;
              background: #4285f4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              position: relative;
              cursor: pointer;
            \`;
            
            // Añadir pulso animado
            const pulseRing = document.createElement('div');
            pulseRing.style.cssText = \`
              position: absolute;
              top: -10px;
              left: -10px;
              width: 40px;
              height: 40px;
              border: 2px solid #4285f4;
              border-radius: 50%;
              opacity: 0.6;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            \`;
            
            marker.appendChild(pulseRing);
            return marker;
          }
          
          // Añadir animación de pulso CSS
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes ping {
              75%, 100% {
                transform: scale(2);
                opacity: 0;
              }
            }
          \`;
          document.head.appendChild(style);
          
          // Centro inicial del mapa
          map.once('load', () => {
            console.log('🗺️ Mapa cargado exitosamente');
            map.flyTo({
              center: [${location.longitude}, ${location.latitude}],
              zoom: 15,
              duration: 2000
            });
          });
          
          // Actualizaciones de ubicación en tiempo real
          if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
              (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                const newAcc = position.coords.accuracy;
                
                userLocationMarker.setLngLat([newLng, newLat]);
                
                // Actualizar contenido del popup
                userLocationMarker.getPopup().setHTML(\`
                  <div class="popup-title">📍 Mi Ubicación (Actualizada)</div>
                  <div class="popup-coords">\${newLat.toFixed(6)}, \${newLng.toFixed(6)}</div>
                  <div class="popup-accuracy">Precisión: \${newAcc ? newAcc.toFixed(0) + 'm' : 'N/A'}</div>
                \`);
              },
              (error) => {
                console.log('Error de geolocalización:', error);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
              }
            );
          }
        </script>
      </body>
      </html>
    `;
    
    setMapHtml(html);
  };

  // Refresh location
  const refreshLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined
      };
      
      setUserLocation(newLocation);
      generateMapHTML(newLocation);
      setIsLoadingLocation(false);
    } catch (error) {
      console.error('Error refreshing location:', error);
      setIsLoadingLocation(false);
      Alert.alert('Error', 'No se pudo actualizar la ubicación');
    }
  };

  // Render map - MAPA DE PANTALLA COMPLETA SIN MÁRGENES
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Mapa de pantalla completa */}
      {mapHtml ? (
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.webview}
          scalesPageToFit={false}
          allowsBackForwardNavigationGestures={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(error) => {
            console.error('WebView error:', error);
          }}
        />
      ) : (
        <View style={[styles.loadingMapContainer, { backgroundColor: theme.mapContainer }]}>
          <Ionicons name="map" size={64} color={theme.icon} />
          <Text style={[styles.loadingMapText, { color: theme.text }]}>
            Cargando mapa...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingMapText: {
    fontSize: 18,
    fontWeight: '600',
  },
});