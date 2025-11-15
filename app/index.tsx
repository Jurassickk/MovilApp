import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import SimpleMapScreen from '@/components/SimpleMap';
import MapControls from '@/components/MapControls';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as AppColors } from '@/constants/theme';

export default function PublicMapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = AppColors[colorScheme ?? 'dark'];
  
  const [showDriverLogin, setShowDriverLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleDriverLogin = () => {
    setShowDriverLogin(true);
  };

  const handleCloseLogin = () => {
    setShowDriverLogin(false);
    router.push('/login');
  };

  const handleRequestLocation = () => {
    Alert.alert(
      'Permisos de Ubicación',
      'Esta aplicación necesita acceso a tu ubicación para mostrar el mapa. Ve a Configuración > Aplicaciones > UrbanTracker > Permisos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Configuración', onPress: () => console.log('Abrir configuración') }
      ]
    );
  };

  const handleZoomIn = () => {
    // Función placeholder para zoom in
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    // Función placeholder para zoom out
    console.log('Zoom out');
  };

  const handleLocationPress = () => {
    // Función placeholder para centrar ubicación
    console.log('Centrar ubicación');
  };

  const handleLayerPress = () => {
    // Función placeholder para cambiar capa
    console.log('Cambiar capa');
  };

  const handleDirectionsPress = () => {
    // Función placeholder para direcciones
    console.log('Direcciones');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Cargando UrbanTracker...</Text>
        <Text style={styles.loadingSubtext}>Inicializando mapa interactivo</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Mapa de MapBox - Pantalla completa */}
      <SimpleMapScreen />
      
      {/* Header flotante con logo y título */}
      <View style={[styles.floatingHeader, { 
        backgroundColor: colorScheme === 'dark' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.appTitle, { color: theme.text }]}>🚌 UrbanTracker</Text>
          <Text style={[styles.appSubtitle, { color: theme.icon }]}>Mapa de Rutas en Tiempo Real</Text>
        </View>
      </View>

      {/* Controles de mapa estilo Google Maps */}
      <MapControls
        onLocationPress={handleLocationPress}
        onLayerPress={handleLayerPress}
        onDirectionsPress={handleDirectionsPress}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Botón flotante principal - Acceso Conductores */}
      <TouchableOpacity
        style={[styles.mainFab, { backgroundColor: '#3b82f6' }]}
        onPress={handleDriverLogin}
        activeOpacity={0.8}
      >
        <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Botón secundario - Permisos */}
      <TouchableOpacity
        style={[styles.secondaryFab, { backgroundColor: theme.secondary }]}
        onPress={handleRequestLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="location" size={20} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal de confirmación para login */}
      <Modal
        visible={showDriverLogin}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDriverLogin(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>🔑 Acceso para Conductores</Text>
              <TouchableOpacity onPress={() => setShowDriverLogin(false)}>
                <Ionicons name="close" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: theme.text }]}>
              Estás a punto de acceder al sistema seguro para conductores autorizados.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.secondary }]}
                onPress={() => setShowDriverLogin(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.loginButton, { backgroundColor: '#3b82f6' }]}
                onPress={handleCloseLogin}
              >
                <Text style={styles.modalButtonText}>Continuar al Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Indicador de estado de conexión */}
      <View style={[styles.connectionStatus, { backgroundColor: 'rgba(16, 185, 129, 0.9)' }]}>
        <View style={styles.statusIndicator} />
        <Text style={styles.statusText}>🟢 Mapa Activo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  loadingSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 5,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    padding: 16,
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  mainFab: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  secondaryFab: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 0.6,
  },
  loginButton: {
    flex: 1,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  connectionStatus: {
    position: 'absolute',
    top: 120,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});