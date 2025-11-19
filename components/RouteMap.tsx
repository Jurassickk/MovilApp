import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ENV } from '@/constants/config';
import { useRoute } from '@/contexts/RouteContext';

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export default function RouteMap() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const DEFAULT_LOCATION: UserLocation = {
    latitude: 4.6097,
    longitude: -74.0817,
    accuracy: 0
  };

  const [userLocation, setUserLocation] = useState<UserLocation | null>(DEFAULT_LOCATION);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapHtml, setMapHtml] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  const { routes, selectedRoutes, focusedRoute } = useRoute();

  // Generate map HTML with routes
  useEffect(() => {
    if (userLocation) {
      generateMapHTML(userLocation);
    }
  }, [userLocation, routes, selectedRoutes, focusedRoute]);

  // Request location permissions
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined
        };

        setUserLocation(newLocation);
        setIsLoadingLocation(false);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        setIsLoadingLocation(false);
      }
    };

    requestLocationPermission();
  }, []);

  const generateMapHTML = (location: UserLocation) => {
    const mapboxToken = ENV.MAPBOX_ACCESS_TOKEN;
    const isDark = colorScheme === 'dark';
    const mapStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12';

    // Prepare route data for JavaScript
    let routesToDisplay: any[] = [];

    if (selectedRoutes.length > 0) {
      routesToDisplay = routes.filter(route => selectedRoutes.includes(route.id));
      if (focusedRoute !== null && !selectedRoutes.includes(focusedRoute)) {
        const focusedRouteData = routes.find(r => r.id === focusedRoute);
        if (focusedRouteData) routesToDisplay.push(focusedRouteData);
      }
      routesToDisplay = routesToDisplay.slice(0, 6);
    } else if (focusedRoute !== null) {
      const focusedRouteData = routes.find(r => r.id === focusedRoute);
      if (focusedRouteData) routesToDisplay = [focusedRouteData];
    }

    const routeData = routesToDisplay.map(route => ({
      id: route.id,
      outboundPoints: route.outboundPoints || [],
      returnPoints: route.returnPoints || [],
    }));

    console.log('🗺️ RouteMap: routesToDisplay', routesToDisplay.length, 'routeData', routeData);

    const timestamp = Date.now();
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Mapa con Rutas ${timestamp}</title>
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

          // Navigation controls
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

          // User location marker
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
                <div style="color: #000; font-size: 12px;">
                  📍 Mi Ubicación<br/>
                  ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}<br/>
                  Precisión: ${location.accuracy ? location.accuracy.toFixed(0) + 'm' : 'N/A'}
                </div>
              \`))
            .addTo(map);

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

          // Add pulse animation
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

          // Route data
          const routeData = ${JSON.stringify(routeData)};
          console.log('🗺️ Map JS: routeData', routeData);

          // Add routes to map after load
          map.on('load', () => {
            console.log('🗺️ Map loaded, adding routes');
            routeData.forEach((route, routeIndex) => {
              console.log('🗺️ Adding route', route.id, 'outbound points:', route.outboundPoints?.length, 'return points:', route.returnPoints?.length);
              try {
            // Outbound route
            if (route.outboundPoints && route.outboundPoints.length >= 2) {
              map.addSource('route-' + route.id + '-outbound', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: route.outboundPoints
                  }
                }
              });

              // Glow layer
              map.addLayer({
                id: 'route-' + route.id + '-outbound-glow',
                type: 'line',
                source: 'route-' + route.id + '-outbound',
                paint: {
                  'line-color': '#5BE201',
                  'line-width': 30,
                  'line-opacity': 0.5,
                  'line-blur': 5
                }
              });

              // Main layer
              map.addLayer({
                id: 'route-' + route.id + '-outbound-main',
                type: 'line',
                source: 'route-' + route.id + '-outbound',
                paint: {
                  'line-color': '#5BE201',
                  'line-width': 10,
                  'line-opacity': 1.0,
                  'line-dasharray': routeIndex > 0 ? [2, 1] : [1, 0]
                }
              });
            }

            // Return route
            if (route.returnPoints && route.returnPoints.length >= 2) {
              map.addSource('route-' + route.id + '-return', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: route.returnPoints
                  }
                }
              });

              // Glow layer
              map.addLayer({
                id: 'route-' + route.id + '-return-glow',
                type: 'line',
                source: 'route-' + route.id + '-return',
                paint: {
                  'line-color': '#FF4444',
                  'line-width': 30,
                  'line-opacity': 0.5,
                  'line-blur': 5
                }
              });

              // Main layer
              map.addLayer({
                id: 'route-' + route.id + '-return-main',
                type: 'line',
                source: 'route-' + route.id + '-return',
                paint: {
                  'line-color': '#FF4444',
                  'line-width': 10,
                  'line-opacity': 1.0,
                  'line-dasharray': routeIndex > 0 ? [2, 1] : [1, 0]
                }
              });
            }
           } catch (error) {
             console.error('🗺️ Error adding route', route.id, error);
           }
            });

            // Fit bounds to routes if any
            if (routeData.length > 0) {
              let allPoints = [];
              routeData.forEach(route => {
                if (route.outboundPoints) allPoints.push(...route.outboundPoints);
                if (route.returnPoints) allPoints.push(...route.returnPoints);
              });

              if (allPoints.length > 0) {
                const bounds = allPoints.reduce(
                  (acc, point) => [
                    [Math.min(acc[0][0], point[0]), Math.min(acc[0][1], point[1])],
                    [Math.max(acc[1][0], point[0]), Math.max(acc[1][1], point[1])]
                  ],
                  [[Infinity, Infinity], [-Infinity, -Infinity]]
                );

                map.fitBounds(bounds, {
                  padding: 50,
                  maxZoom: 18,
                  duration: 1000
                });
              }
            }

            console.log('🗺️ Mapa con rutas cargado exitosamente');
            console.log('🗺️ Map center:', map.getCenter());
            console.log('🗺️ Map zoom:', map.getZoom());
          });

          // Real-time location updates
          if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
              (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                const newAcc = position.coords.accuracy;

                userLocationMarker.setLngLat([newLng, newLat]);
                userLocationMarker.getPopup().setHTML(\`
                  <div style="color: #000; font-size: 12px;">
                    📍 Mi Ubicación (Actualizada)<br/>
                    \${newLat.toFixed(6)}, \${newLng.toFixed(6)}<br/>
                    Precisión: \${newAcc ? newAcc.toFixed(0) + 'm' : 'N/A'}
                  </div>
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

  return (
    <View style={styles.container}>
      {mapHtml ? (
        <WebView
          key={`map-${routes.length}-${selectedRoutes.length}`}
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
        <View style={[styles.loadingContainer, { backgroundColor: theme.mapContainer }]}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});