import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { LocationWebSocketService, type LocationTrackingOptions, type LocationStatus } from '@/services/LocationWebSocketService';
import type { Location } from '@/types/location';

export interface UseLocationWebSocketOptions extends LocationTrackingOptions {
  wsUrl?: string;
  autoConnect?: boolean;
}

export interface UseLocationWebSocketReturn {
  // Estado del servicio
  status: LocationStatus;
  isTracking: boolean;
  isConnected: boolean;
  
  // Acciones
  startTracking: (options?: LocationTrackingOptions) => Promise<boolean>;
  stopTracking: () => void;
  sendLocation: (location: Location) => Promise<boolean>;
  
  // Estado de ubicación
  currentLocation: Location | null;
  locationHistory: Location[];
  
  // Utilidades
  addLocationListener: (listener: (location: Location) => void) => () => void;
  clearLocationHistory: () => void;
  getStatus: () => LocationStatus;
}

export function useLocationWebSocket(options: UseLocationWebSocketOptions = {}): UseLocationWebSocketReturn {
  const {
    vehicleId = 'unknown',
    driverId,
    routeId,
    wsUrl = Platform.OS === 'web' 
      ? `ws://localhost:8080/location` 
      : 'ws://your-server.com/location',
    autoConnect = false
  } = options;

  // Estado del servicio
  const [status, setStatus] = useState<LocationStatus>({
    connected: false,
    connecting: false,
    reconnecting: false,
    lastError: null,
    reconnectAttempts: 0,
    tracking: false,
    lastUpdate: null,
    updateCount: 0,
    offlineQueueSize: 0
  });

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);

  // Ref al servicio para evitar recreaciones
  const serviceRef = useRef<LocationWebSocketService | null>(null);

  // Inicializar servicio
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new LocationWebSocketService({
        url: wsUrl,
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000,
        timeout: 10000
      });

      // Configurar callbacks
      serviceRef.current.onStatusChange(setStatus);
      serviceRef.current.onLocationUpdate((location, success) => {
        if (success) {
          setCurrentLocation(location);
          setLocationHistory(prev => [...prev.slice(-99), location]); // Mantener últimas 100 ubicaciones
        }
      });

      // Auto conectar si está habilitado
      if (autoConnect) {
        serviceRef.current.startTracking({
          vehicleId,
          driverId,
          routeId
        });
      }
    }

    return () => {
      // Cleanup al desmontar
      if (serviceRef.current) {
        serviceRef.current.stopTracking();
      }
    };
  }, [wsUrl, autoConnect, vehicleId, driverId, routeId]);

  // Función para iniciar tracking
  const startTracking = useCallback(async (trackingOptions?: LocationTrackingOptions): Promise<boolean> => {
    if (!serviceRef.current) return false;

    try {
      const options = {
        vehicleId,
        driverId,
        routeId,
        ...trackingOptions
      };

      const success = await serviceRef.current.startTracking(options);
      return success;
    } catch (error) {
      console.error('❌ Error iniciando tracking:', error);
      return false;
    }
  }, [vehicleId, driverId, routeId]);

  // Función para detener tracking
  const stopTracking = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stopTracking();
    }
  }, []);

  // Función para enviar ubicación
  const sendLocation = useCallback(async (location: Location): Promise<boolean> => {
    if (!serviceRef.current) return false;

    try {
      const success = await serviceRef.current.sendLocation(location);
      if (success) {
        setCurrentLocation(location);
        setLocationHistory(prev => [...prev.slice(-99), location]);
      }
      return success;
    } catch (error) {
      console.error('❌ Error enviando ubicación:', error);
      return false;
    }
  }, []);

  // Función para añadir listener
  const addLocationListener = useCallback((listener: (location: Location) => void) => {
    if (!serviceRef.current) {
      return () => {};
    }
    return serviceRef.current.addLocationListener(listener);
  }, []);

  // Función para limpiar historial
  const clearLocationHistory = useCallback(() => {
    setLocationHistory([]);
  }, []);

  // Función para obtener estado actual
  const getStatus = useCallback(() => {
    if (!serviceRef.current) return status;
    return serviceRef.current.getStatus();
  }, [status]);

  // Estado derivado
  const isTracking = status.tracking;
  const isConnected = status.connected;

  return {
    // Estado
    status,
    isTracking,
    isConnected,
    currentLocation,
    locationHistory,
    
    // Acciones
    startTracking,
    stopTracking,
    sendLocation,
    
    // Utilidades
    addLocationListener,
    clearLocationHistory,
    getStatus
  };
}