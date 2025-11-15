import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import useAuth from '@/hooks/useAuth';
import { useLocationWebSocket } from '@/hooks/useLocationWebSocket';
import type { Location } from '@/types/location';

export default function MapScreen() {
  const { user } = useAuth();
  
  // Usar el nuevo hook de WebSocket para ubicación
  const {
    status,
    isTracking,
    isConnected,
    currentLocation,
    locationHistory,
    startTracking,
    stopTracking,
    sendLocation,
    addLocationListener
  } = useLocationWebSocket({
    vehicleId: user?.vehicleId || 'unknown',
    driverId: user?.id?.toString(),
    routeId: user?.routeId,
    wsUrl: 'ws://localhost:8080/location', // URL del servidor WebSocket
    autoConnect: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isManualLocationUpdate, setIsManualLocationUpdate] = useState(false);

  useEffect(() => {
    // Simular carga inicial del mapa
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  // Listener para actualizaciones de ubicación
  useEffect(() => {
    const unsubscribe = addLocationListener((location: Location) => {
      console.log('📍 Nueva ubicación recibida:', location);
    });
    
    return unsubscribe;
  }, [addLocationListener]);

  const handleStartTracking = async () => {
    try {
      const success = await startTracking({
        vehicleId: user?.vehicleId,
        driverId: user?.id?.toString(),
        routeId: user?.routeId
      });
      
      if (success) {
        Alert.alert(
          '✅ Seguimiento Iniciado',
          'El seguimiento de ubicación en tiempo real ha comenzado vía WebSocket.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert(
          '❌ Error',
          'No se pudo iniciar el seguimiento. Verifique la conexión.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'Error iniciando el seguimiento: ' + (error as Error).message,
        [{ text: 'OK' }]
      );
    }
  };

  const handleStopTracking = () => {
    stopTracking();
    Alert.alert(
      '🛑 Seguimiento Detenido',
      'El seguimiento de ubicación ha sido detenido.',
      [{ text: 'Entendido' }]
    );
  };

  const handleSendTestLocation = async () => {
    if (!isTracking) {
      Alert.alert(
        '⚠️ Advertencia',
        'Debe iniciar el tracking antes de enviar ubicaciones de prueba.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsManualLocationUpdate(true);
    
    // Simular envío de ubicación de prueba
    const testLocation: Location = {
      latitude: 4.7110 + (Math.random() - 0.5) * 0.01, // Bogotá con variación aleatoria
      longitude: -74.0721 + (Math.random() - 0.5) * 0.01,
      timestamp: Date.now(),
      accuracy: 5 + Math.random() * 10,
      speed: Math.random() * 50,
      heading: Math.random() * 360
    };

    try {
      const success = await sendLocation(testLocation);
      if (success) {
        Alert.alert(
          '📍 Ubicación Enviada',
          'Ubicación de prueba enviada exitosamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'Error enviando ubicación: ' + (error as Error).message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsManualLocationUpdate(false);
    }
  };

  const getConnectionStatusColor = () => {
    if (status.connecting) return '#f59e0b';
    if (status.reconnecting) return '#ef4444';
    if (status.connected) return '#10b981';
    return '#6b7280';
  };

  const getConnectionStatusText = () => {
    if (status.connecting) return 'Conectando...';
    if (status.reconnecting) return `Reconectando... (${status.reconnectAttempts}/5)`;
    if (status.connected) return 'Conectado';
    return 'Desconectado';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa de Seguimiento</Text>
        <Text style={styles.subtitle}>
          Conductor: {user?.identificacion || 'N/A'}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Mapa con seguimiento en tiempo real
          </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información de Viaje</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vehículo:</Text>
            <Text style={styles.value}>{user?.vehicleId || 'No asignado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ruta:</Text>
            <Text style={styles.value}>{user?.routeId || 'No asignada'}</Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Estado de Seguimiento</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isTracking ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.statusText}>
              {isTracking ? 'Seguimiento Activo' : 'Seguimiento Inactivo'}
            </Text>
          </View>
          
          {/* Estado de conexión WebSocket */}
          <View style={styles.connectionStatusRow}>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: getConnectionStatusColor() }
            ]} />
            <Text style={styles.connectionStatusText}>
              {getConnectionStatusText()}
            </Text>
          </View>
          
          {/* Información adicional del estado */}
          {status.lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Última actualización: {status.lastUpdate.toLocaleTimeString()}
            </Text>
          )}
          {status.offlineQueueSize > 0 && (
            <Text style={styles.queueInfoText}>
              📥 {status.offlineQueueSize} ubicaciones pendientes
            </Text>
          )}
          
          {!isTracking ? (
            <TouchableOpacity style={styles.button} onPress={handleStartTracking}>
              <Text style={styles.buttonText}>Iniciar Seguimiento</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStopTracking}>
                <Text style={styles.buttonText}>Detener Seguimiento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testButton} onPress={handleSendTestLocation} disabled={isManualLocationUpdate}>
                <Text style={styles.testButtonText}>
                  {isManualLocationUpdate ? 'Enviando...' : 'Enviar Ubicación Prueba'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Estadísticas del Viaje</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0.0</Text>
              <Text style={styles.statLabel}>Km Recorridos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>00:00</Text>
              <Text style={styles.statLabel}>Tiempo Activo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Paradas</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  mapContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 64,
    marginBottom: 10,
  },
  mapPlaceholderSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: '#000000',
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  statsCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  connectionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionStatusText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  lastUpdateText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  queueInfoText: {
    fontSize: 11,
    color: '#f59e0b',
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});