import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteService } from '@/services/routeService';
import { Route } from '@/types/route';
import { useRoute } from '@/contexts/RouteContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RoutePanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function RoutePanel({ visible, onClose }: RoutePanelProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeDetail, setRouteDetail] = useState<Route | null>(null);

  const { selectedRoutes, setSelectedRoutes, loadRoute, removeRoute } = useRoute();

  useEffect(() => {
    if (visible) {
      loadRoutes();
    }
  }, [visible]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await RouteService.getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error loading routes:', error);
      Alert.alert('Error', 'No se pudieron cargar las rutas');
    } finally {
      setLoading(false);
    }
  };

  const handleRoutePress = async (route: Route) => {
    try {
      await loadRoute(route.id);
      // Add to selected routes to show on map
      if (!selectedRoutes.includes(route.id)) {
        toggleRouteSelection(route);
      }
      setSelectedRoute(route);
      // Load detail
      const geometry = await RouteService.getRouteGeometry(route.id);
      const waypoints = geometry.data?.waypoints || [];
      const first = waypoints.find((w: any) => w.sequence === 1) || waypoints[0];
      const last = waypoints.reduce((prev: any, curr: any) => (prev && curr && curr.sequence > prev.sequence) ? curr : prev, waypoints[0] || first);

      setRouteDetail({
        ...route,
        start: first ? `${first.latitude}, ${first.longitude}` : '',
        end: last ? `${last.latitude}, ${last.longitude}` : '',
        startDetail: first ? `Inicio: ${first.latitude}, ${first.longitude}` : '',
        endDetail: last ? `Fin: ${last.latitude}, ${last.longitude}` : '',
      });
    } catch (error) {
      console.error('Error loading route detail:', error);
      Alert.alert('Error', 'No se pudo cargar el detalle de la ruta');
    }
  };

  const handleBackToList = () => {
    setSelectedRoute(null);
    setRouteDetail(null);
  };

  const toggleRouteSelection = async (route: Route) => {
    const isSelected = selectedRoutes.includes(route.id);
    const maxRoutes = 6;

    if (isSelected) {
      setSelectedRoutes(prev => prev.filter(id => id !== route.id));
      removeRoute(route.id);
    } else {
      if (selectedRoutes.length < maxRoutes) {
        // Load route data first
        await loadRoute(route.id);
        setSelectedRoutes(prev => [...prev, route.id]);
      } else {
        Alert.alert('Límite alcanzado', `Solo puedes seleccionar hasta ${maxRoutes} rutas para comparar`);
      }
    }
  };

  const renderRouteList = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {selectedRoutes.length > 0 && (
        <View style={[styles.selectionInfo, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
          <Text style={[styles.selectionText, { color: theme.primary }]}>
            {selectedRoutes.length} ruta{selectedRoutes.length !== 1 ? 's' : ''} seleccionada{selectedRoutes.length !== 1 ? 's' : ''} para comparación
          </Text>
        </View>
      )}

      {routes.map((route) => {
        const isSelected = selectedRoutes.includes(route.id);
        return (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.routeCard,
              {
                backgroundColor: theme.card,
                borderColor: isSelected ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handleRoutePress(route)}
          >
            <View style={styles.routeHeader}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleRouteSelection(route)}
              >
                <Ionicons
                  name={isSelected ? "checkbox" : "square-outline"}
                  size={20}
                  color={isSelected ? theme.primary : theme.icon}
                />
              </TouchableOpacity>
              <Text style={[styles.routeName, { color: theme.text }]}>{route.name}</Text>
              <Image source={{ uri: '/bus-img.png' }} style={styles.busIcon} />
            </View>
            <Text style={[styles.routeDescription, { color: theme.icon }]}>{route.description}</Text>
            <View style={styles.routeDirections}>
              <View style={styles.direction}>
                <View style={[styles.directionDot, { backgroundColor: '#5BE201' }]} />
                <Text style={[styles.directionText, { color: theme.icon }]}>Ida: {route.start || 'Cargando...'}</Text>
              </View>
              <View style={styles.direction}>
                <View style={[styles.directionDot, { backgroundColor: '#FF4444' }]} />
                <Text style={[styles.directionText, { color: theme.icon }]}>Vuelta: {route.end || 'Cargando...'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderRouteDetail = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {routeDetail && (
        <View style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.detailTitle, { color: theme.text }]}>{routeDetail.name}</Text>
          </View>
          <Text style={[styles.detailDescription, { color: theme.icon }]}>{routeDetail.description}</Text>

          <View style={styles.imagesContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: routeDetail.imageStart }} style={styles.routeImage} />
              <View style={styles.imageLabel}>
                <View style={[styles.labelDot, { backgroundColor: '#5BE201' }]} />
                <Text style={[styles.labelText, { color: theme.icon }]}>Ida</Text>
              </View>
            </View>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: routeDetail.imageEnd }} style={styles.routeImage} />
              <View style={styles.imageLabel}>
                <View style={[styles.labelDot, { backgroundColor: '#FF4444' }]} />
                <Text style={[styles.labelText, { color: theme.icon }]}>Vuelta</Text>
              </View>
            </View>
          </View>

          <View style={styles.routeInfo}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Recorrido</Text>
            <View style={styles.infoItem}>
              <View style={[styles.infoDot, { backgroundColor: '#5BE201' }]} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.icon }]}>Ida:</Text>
                <Text style={[styles.infoText, { color: theme.text }]}>{routeDetail.startDetail}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoDot, { backgroundColor: '#FF4444' }]} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.icon }]}>Vuelta:</Text>
                <Text style={[styles.infoText, { color: theme.text }]}>{routeDetail.endDetail}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.panel, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {selectedRoute ? `Ruta ${selectedRoute.name}` : 'Rutas disponibles'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.text }]}>Cargando rutas...</Text>
            </View>
          ) : selectedRoute ? renderRouteDetail() : renderRouteList()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectionInfo: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  routeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  busIcon: {
    width: 24,
    height: 20,
    resizeMode: 'contain',
  },
  routeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  routeDirections: {
    gap: 6,
  },
  direction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  directionText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  detailCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  detailDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  routeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});