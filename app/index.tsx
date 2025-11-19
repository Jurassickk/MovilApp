import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import RouteMap from '@/components/RouteMap';
import RoutePanel from '@/components/RoutePanel';
import { RouteProvider } from '@/contexts/RouteContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors as AppColors } from '@/constants/theme';

export default function PublicMapScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = AppColors[colorScheme ?? 'dark'];
  
  const [showDriverLogin, setShowDriverLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoutesPanel, setShowRoutesPanel] = useState(false);

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
      <RouteProvider>
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          {/* Mapa con rutas */}
          <RouteMap />

          {/* Barra inferior con botón de rutas */}
          <View style={[styles.bottomBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.routeButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowRoutesPanel(true)}
            >
              <Text style={styles.routeButtonText}>🗺️ Rutas</Text>
            </TouchableOpacity>
          </View>

          {/* Panel de rutas */}
          <RoutePanel
            visible={showRoutesPanel}
            onClose={() => setShowRoutesPanel(false)}
          />
        </View>
      </RouteProvider>

      {/* Botón flotante principal - Acceso Conductores */}
      <TouchableOpacity
        style={[styles.mainFab, { backgroundColor: '#3b82f6' }]}
        onPress={handleDriverLogin}
        activeOpacity={0.8}
      >
        <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
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
  routesFab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
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
  routesPanel: {
    position: 'absolute',
    bottom: 140, // Above the fab
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  routeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  routeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});