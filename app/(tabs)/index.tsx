import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import useLocationTracking from '@/hooks/useLocationTracking';
import { Colors } from '@/constants/theme';

interface TripHistoryItem {
  id: string;
  fecha: string;
  inicio: string;
  fin: string;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { 
    isTracking, 
    trackingStatus: locationTrackingStatus, 
    mqttStatus,
    startTracking, 
    stopTracking 
  } = useLocationTracking();

  // Estados locales para manejar el recorrido
  const [isRecorridoActive, setIsRecorridoActive] = useState(false);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [tripHistory, setTripHistory] = useState<TripHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Estados para datos de ruta asignada (simulados por ahora)
  const [assignedData, setAssignedData] = useState<any>(null);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);

  // Formatear tiempo
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Obtener estado de conexión MQTT
  const getConnectionStatus = () => {
    return mqttStatus === 'Conectado' ? 'Conectado' : 'Desconectado';
  };

  // Determinar si puede hacer tracking
  const canStartTracking = (): boolean => {
    const hasVehicle = !!user?.vehicleId;
    const hasMqttConnection = mqttStatus === 'Conectado';
    
    return hasVehicle && hasMqttConnection;
  };

  // Obtener información de tracking
  const getTrackingInfo = () => {
    const hasAssignedRoute = !!user?.routeId && assignedData?.numberRoute;
    const vehicleId = user?.vehicleId || 'default-vehicle';
    const routeId = user?.routeId;
    
    return {
      hasAssignedRoute,
      vehicleId,
      routeId,
      displayText: hasAssignedRoute 
        ? `Ruta ${assignedData?.numberRoute || routeId}`
        : `Vehículo ${vehicleId}`
    };
  };

  // Manejar toggle de trayecto
  const handleToggleTrayecto = async () => {
    if (!isRecorridoActive) {
      // Verificar si puede iniciar tracking
      if (!canStartTracking()) {
        Alert.alert(
          'Configuración Incompleta',
          'Verificar conexión MQTT y permisos antes de iniciar el recorrido.',
          [{ text: 'Entendido' }]
        );
        return;
      }

      // Iniciar trayecto
      const now = new Date();
      setStartTime(formatTime(now));
      setIsRecorridoActive(true);

      // Iniciar tracking de ubicación
      const trackingInfo = getTrackingInfo();
      await startTracking(
        trackingInfo.vehicleId,
        trackingInfo.routeId,
        user?.id?.toString()
      );

      Alert.alert(
        'Trayecto Iniciado',
        'El seguimiento de ubicación se ha iniciado correctamente.',
        [{ text: 'Entendido' }]
      );
    } else {
      // Finalizar trayecto
      Alert.alert(
        'Finalizar Trayecto',
        '¿Estás seguro de que quieres finalizar el trayecto? Esto detendrá el tracking y finalizará el viaje.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Finalizar',
            style: 'destructive',
            onPress: async () => {
              const now = new Date();
              setEndTime(formatTime(now));
              setIsRecorridoActive(false);

              // Detener tracking
              stopTracking();

              // Agregar al historial (simulado)
              const newTrip: TripHistoryItem = {
                id: Date.now().toString(),
                fecha: new Date().toLocaleDateString('es-ES'),
                inicio: startTime,
                fin: formatTime(now)
              };
              setTripHistory(prev => [newTrip, ...prev]);

              Alert.alert(
                'Trayecto Finalizado',
                'El seguimiento de ubicación se ha detenido correctamente.',
                [{ text: 'Entendido' }]
              );
            },
          },
        ]
      );
    }
  };

  // Manejar logout
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

  // Estados derivados
  const trackingInfo = getTrackingInfo();
  const canTrack = canStartTracking();
  const trackingStatusText = isRecorridoActive ? 'En Recorrido' : 'Detenido';
  const trackingType = trackingInfo.hasAssignedRoute ? 'Ruta Asignada' : 'Tracking Libre';
  const connectionStatus = getConnectionStatus();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.dark.card,
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 48
      }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.dark.text }}>
          Ruta
        </Text>
        <TouchableOpacity 
          onPress={handleLogout}
          style={{
            borderRadius: 20,
            backgroundColor: Colors.dark.border,
            padding: 8
          }}
        >
          <Text style={{ color: Colors.dark.text, fontSize: 20 }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: Colors.dark.background, paddingHorizontal: 16 }}
      >
        {/* Tarjeta de Estado de Conexiones */}
        <View style={{
          marginBottom: 24,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          backgroundColor: Colors.dark.card,
          padding: 16
        }}>
          <Text style={{ marginBottom: 12, fontSize: 14, fontWeight: 'bold', color: Colors.dark.secondary }}>
            ESTADO DE CONEXIONES
          </Text>
          
          {/* MQTT Status */}
          <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: Colors.dark.secondary }}>MQTT Broker</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: connectionStatus === 'Conectado' ? '#10b981' : '#ef4444',
                marginRight: 8
              }} />
              <Text style={{
                fontWeight: '600',
                color: connectionStatus === 'Conectado' ? '#10b981' : '#ef4444'
              }}>
                {connectionStatus}
              </Text>
            </View>
          </View>

          {/* Tracking Status */}
          <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: Colors.dark.secondary }}>Tracking de Ubicación</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: isTracking ? '#10b981' : Colors.dark.border,
                marginRight: 8
              }} />
              <Text style={{
                fontWeight: '600',
                color: isTracking ? '#10b981' : Colors.dark.secondary
              }}>
                {isTracking ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>

          {/* Recorrido Status */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: Colors.dark.secondary }}>Estado del Recorrido</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: isRecorridoActive 
                  ? (trackingInfo.hasAssignedRoute ? '#10b981' : '#3b82f6')
                  : Colors.dark.border,
                marginRight: 8
              }} />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{
                  fontWeight: '600',
                  color: isRecorridoActive 
                    ? (trackingInfo.hasAssignedRoute ? '#10b981' : '#3b82f6')
                    : Colors.dark.secondary
                }}>
                  {trackingStatusText}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.dark.secondary }}>
                  {trackingType}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Botón Principal Único */}
        <TouchableOpacity
          onPress={handleToggleTrayecto}
          style={{
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: 1,
            paddingVertical: 16,
            borderColor: isRecorridoActive ? '#ef4444' : '#10b981',
            backgroundColor: isRecorridoActive ? '#ef4444' : '#10b981'
          }}
        >
          <Text style={{ fontSize: 24, color: Colors.dark.text, marginRight: 12 }}>🚗</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark.text }}>
            {isRecorridoActive ? 'Finalizar Trayecto' : 'Iniciar Trayecto'}
          </Text>
        </TouchableOpacity>

        {/* Tarjeta de Horas */}
        <View style={{
          marginBottom: 24,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          backgroundColor: Colors.dark.card,
          padding: 16
        }}>
          <View style={{ marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Colors.dark.secondary }}>Hora de inicio</Text>
            <Text style={{ fontWeight: '600', color: Colors.dark.text }}>
              {startTime || '05:00'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: Colors.dark.secondary }}>Hora final</Text>
            <Text style={{ fontWeight: '600', color: Colors.dark.text }}>
              {isRecorridoActive ? 'En curso...' : endTime || '00:00'}
            </Text>
          </View>
        </View>

        {/* Información de Tracking */}
        <Text style={{ marginBottom: 12, fontSize: 14, fontWeight: 'bold', color: Colors.dark.secondary }}>
          Información de Tracking
        </Text>
        <View style={{
          marginBottom: 24,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          backgroundColor: Colors.dark.card,
          padding: 16
        }}>
          {isLoadingAssigned ? (
            <Text style={{ color: Colors.dark.secondary }}>
              Cargando información de tracking...
            </Text>
          ) : trackingInfo.hasAssignedRoute && assignedData ? (
            // Caso: Ruta Asignada
            <>
              <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#10b981' }}>
                  ✅ Ruta Asignada
                </Text>
                <Text style={{ fontSize: 16, color: '#10b981' }}>📍</Text>
              </View>
              <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.dark.border, paddingBottom: 12 }}>
                <Text style={{ color: Colors.dark.secondary }}>Placas del vehículo</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.dark.text }}>
                  {assignedData.licencePlate || user?.vehicleId}
                </Text>
              </View>
              <View>
                <Text style={{ color: Colors.dark.secondary }}>Número de ruta</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.dark.text }}>
                  {assignedData.numberRoute || user?.routeId}
                </Text>
              </View>
            </>
          ) : canTrack ? (
            // Caso: Tracking Libre
            <>
              <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#3b82f6' }}>
                  🚗 Tracking Libre
                </Text>
                <Text style={{ fontSize: 16, color: '#3b82f6' }}>🚗</Text>
              </View>
              <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.dark.border, paddingBottom: 12 }}>
                <Text style={{ color: Colors.dark.secondary }}>ID del vehículo</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.dark.text }}>
                  {trackingInfo.vehicleId}
                </Text>
              </View>
              <View>
                <Text style={{ color: Colors.dark.secondary }}>Tipo de tracking</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6' }}>
                  Coordenadas sin ruta específica
                </Text>
              </View>
            </>
          ) : (
            // Caso: No puede hacer tracking
            <>
              <View style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#f59e0b' }}>
                  ⚠️ Configuración Incompleta
                </Text>
                <Text style={{ fontSize: 16, color: '#f59e0b' }}>⚠️</Text>
              </View>
              <View>
                <Text style={{ color: Colors.dark.secondary }}>Estado</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#f59e0b' }}>
                  Verificar conexión MQTT y permisos
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Historial de recorridos */}
        <Text style={{ marginBottom: 12, fontSize: 14, fontWeight: 'bold', color: Colors.dark.secondary }}>
          Historial de recorridos
        </Text>
        <View style={{
          marginBottom: 32,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.dark.border,
          backgroundColor: Colors.dark.card,
          padding: 16
        }}>
          {isLoadingHistory ? (
            <Text style={{ color: Colors.dark.secondary }}>
              Cargando historial de recorridos...
            </Text>
          ) : tripHistory.length > 0 ? (
            tripHistory.map((item, index) => (
              <View
                key={item.id}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: index < tripHistory.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.dark.border
                }}
              >
                <Text style={{ fontWeight: '600', color: Colors.dark.text }}>
                  {item.fecha}
                </Text>
                <Text style={{ color: Colors.dark.secondary }}>
                  {item.inicio} - {item.fin}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: Colors.dark.secondary }}>
              No hay recorridos registrados
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: Colors.dark.secondary }}>UrbanTracker Driver</Text>
          <Text style={{ color: Colors.dark.secondary }}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
