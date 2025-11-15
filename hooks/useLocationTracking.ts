import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMqttLocation } from '@/hooks/useMqtt';
import { LocationWebSocketService, type LocationStatus } from '@/services/LocationWebSocketService';
import type { Location } from '@/types/location';
import { WebSocketService } from '@/services/WebSocketService';
import type { WebSocketConfig } from '@/services/WebSocketService';

/**
 * Hook que combina WebSocket y MQTT para manejo robusto de ubicación
 */
export const useLocationTracking = () => {
  const { isAuthenticated, user } = useAuth();
  const { publishLocation, connectionStatus: mqttStatus, client: mqttClient } = useMqttLocation();
  
  const locationServiceRef = useRef<LocationWebSocketService | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<LocationStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Configuración WebSocket
  const wsConfig: WebSocketConfig = {
    url: 'ws://10.3.234.142:8080/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    timeout: 10000,
  };

  // Inicializar servicio de ubicación
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    console.log('📡 Inicializando servicio de ubicación con MQTT integrado...');

    // Crear instancia del servicio
    locationServiceRef.current = new LocationWebSocketService(wsConfig, {
      autoPublish: true,
      publishInterval: 5000, // 5 segundos
      batchSize: 1,
      enableOfflineQueue: true,
    });

    // Configurar callbacks
    locationServiceRef.current.onStatusChange((status) => {
      console.log('📊 Estado de tracking actualizado:', status);
      setTrackingStatus(status);
      setIsTracking(status.tracking);
    });

    locationServiceRef.current.onLocationUpdate((location, success) => {
      console.log('📍 Ubicación actualizada:', location, 'Éxito:', success);
      // Aquí se pueden manejar las ubicaciones recibidas del servidor
    });

    // Cleanup
    return () => {
      if (locationServiceRef.current) {
        locationServiceRef.current.stopTracking();
      }
    };
  }, [isAuthenticated, user]);

  /**
   * Inicia el tracking de ubicación
   */
  const startTracking = useCallback(async (
    vehicleId?: string,
    routeId?: string,
    driverId?: string
  ): Promise<boolean> => {
    try {
      if (!locationServiceRef.current) {
        console.error('❌ Servicio de ubicación no inicializado');
        return false;
      }

      console.log('🚀 Iniciando tracking de ubicación...', {
        vehicleId,
        routeId,
        driverId,
      });

      // Actualizar opciones de tracking en el servicio
      const options = {
        vehicleId: vehicleId || user?.vehicleId,
        routeId: routeId || user?.routeId,
        driverId: driverId || user?.id?.toString(),
        autoStart: true,
        highAccuracy: true,
      };

      // Iniciar tracking
      const success = await locationServiceRef.current.startTracking(options);
      
      if (success) {
        console.log('✅ Tracking iniciado exitosamente');
      } else {
        console.error('❌ Error iniciando tracking');
      }

      return success;
    } catch (error) {
      console.error('❌ Error en startTracking:', error);
      return false;
    }
  }, [user]);

  /**
   * Detiene el tracking de ubicación
   */
  const stopTracking = useCallback(() => {
    try {
      if (!locationServiceRef.current) {
        console.warn('⚠️ Servicio de ubicación no inicializado');
        return;
      }

      console.log('🛑 Deteniendo tracking de ubicación...');
      locationServiceRef.current.stopTracking();
      setIsTracking(false);
    } catch (error) {
      console.error('❌ Error en stopTracking:', error);
    }
  }, []);

  /**
   * Envía ubicación manualmente via MQTT
   */
  const sendLocation = useCallback(async (location: Location): Promise<boolean> => {
    try {
      // Usar el servicio principal con MQTT
      if (locationServiceRef.current) {
        const success = await locationServiceRef.current.sendLocation(location);
        return success;
      }

      // Fallback directo a MQTT
      if (mqttStatus === 'Conectado') {
        return publishLocation(
          location.latitude,
          location.longitude,
          location.timestamp,
          user?.vehicleId,
          user?.id?.toString(),
          user?.routeId
        );
      }

      console.warn('⚠️ No se puede enviar ubicación - Servicio no disponible');
      return false;
    } catch (error) {
      console.error('❌ Error enviando ubicación:', error);
      return false;
    }
  }, [mqttStatus, publishLocation, user]);

  /**
   * Obtiene el estado del tracking
   */
  const getTrackingStatus = useCallback((): LocationStatus | null => {
    return trackingStatus;
  }, [trackingStatus]);

  /**
   * Verifica si el tracking está activo
   */
  const isCurrentlyTracking = useCallback((): boolean => {
    return isTracking;
  }, [isTracking]);

  /**
   * Obtiene el tamaño de la cola offline
   */
  const getOfflineQueueSize = useCallback((): number => {
    return trackingStatus?.offlineQueueSize || 0;
  }, [trackingStatus]);

  return {
    // Estados
    isTracking: isCurrentlyTracking(),
    trackingStatus,
    mqttStatus,
    mqttClient,
    offlineQueueSize: getOfflineQueueSize(),

    // Acciones
    startTracking,
    stopTracking,
    sendLocation,
    getTrackingStatus,
    isCurrentlyTracking,

    // Utilidades
    isAuthenticated,
    user,
  };
};

export default useLocationTracking;