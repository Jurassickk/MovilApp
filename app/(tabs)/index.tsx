import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import useAuth from '@/hooks/useAuth';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const [trackingStatus, setTrackingStatus] = useState<'INACTIVE' | 'ACTIVE' | 'PAUSED'>('INACTIVE');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleToggleTracking = () => {
    if (trackingStatus === 'INACTIVE') {
      setTrackingStatus('ACTIVE');
      setIsConnecting(true);
      
      setTimeout(() => {
        setIsConnecting(false);
        Alert.alert(
          'Seguimiento Iniciado',
          'El seguimiento de ubicación se ha iniciado correctamente.',
          [{ text: 'Entendido' }]
        );
      }, 2000);
    } else if (trackingStatus === 'ACTIVE') {
      setTrackingStatus('PAUSED');
      Alert.alert(
        'Seguimiento Pausado',
        'El seguimiento de ubicación se ha pausado.',
        [{ text: 'Entendido' }]
      );
    } else {
      setTrackingStatus('ACTIVE');
      Alert.alert(
        'Seguimiento Reanudado',
        'El seguimiento de ubicación se ha reanudado.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const getTrackingButtonText = () => {
    if (isConnecting) return 'Conectando...';
    
    switch (trackingStatus) {
      case 'INACTIVE':
        return 'Iniciar Seguimiento';
      case 'ACTIVE':
        return 'Pausar Seguimiento';
      case 'PAUSED':
        return 'Reanudar Seguimiento';
      default:
        return 'Iniciar Seguimiento';
    }
  };

  const getTrackingButtonColor = () => {
    if (isConnecting) return '#f59e0b';
    
    switch (trackingStatus) {
      case 'INACTIVE':
        return '#10b981';
      case 'ACTIVE':
        return '#f59e0b';
      case 'PAUSED':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>UrbanTracker Driver</Text>
        <Text style={styles.subtitle}>Panel de Conductor</Text>
      </View>

      <View style={styles.driverInfoCard}>
        <Text style={styles.cardTitle}>Información del Conductor</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Identificación:</Text>
          <Text style={styles.value}>{user?.identificacion || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{user?.nombre || 'No especificado'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehículo Asignado:</Text>
          <Text style={styles.value}>{user?.vehicleId || 'No asignado'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ruta Asignada:</Text>
          <Text style={styles.value}>{user?.routeId || 'No asignada'}</Text>
        </View>
      </View>

      <View style={styles.trackingCard}>
        <Text style={styles.cardTitle}>Estado de Seguimiento</Text>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: trackingStatus === 'ACTIVE' ? '#10b981' : 
                             trackingStatus === 'PAUSED' ? '#f59e0b' : '#ef4444' }
          ]} />
          <Text style={styles.statusText}>
            {trackingStatus === 'ACTIVE' ? 'Seguimiento Activo' :
             trackingStatus === 'PAUSED' ? 'Seguimiento Pausado' : 'Seguimiento Inactivo'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.trackingButton, { backgroundColor: getTrackingButtonColor() }]}
          onPress={handleToggleTracking}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.trackingButtonText}>{getTrackingButtonText()}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.connectionCard}>
        <Text style={styles.cardTitle}>Estado de Conexión</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>Conectado</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  driverInfoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  trackingCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  connectionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    backgroundColor: '#10b981',
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#ffffff',
  },
  trackingButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
