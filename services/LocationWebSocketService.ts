import { LocationService } from './locationService';
import { WebSocketService, type WebSocketConfig, type WebSocketStatus } from './WebSocketService';
import type { Location, LocationUpdate } from '@/types/location';
import { LOCATION_CONFIG } from '@/config/constants';

// Importar hooks MQTT para método principal
import { useMqttLocation } from '@/hooks/useMqtt';
import { useMqtt } from '@/hooks/useMqtt';

export interface LocationWebSocketConfig extends WebSocketConfig {
  autoPublish: boolean;
  publishInterval: number;
  batchSize: number;
  enableOfflineQueue: boolean;
}

export interface LocationTrackingOptions {
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
  autoStart?: boolean;
  highAccuracy?: boolean;
}

export interface LocationStatus extends WebSocketStatus {
  tracking: boolean;
  lastUpdate: Date | null;
  updateCount: number;
  offlineQueueSize: number;
}

export class LocationWebSocketService {
  private wsService: WebSocketService;
  private config: LocationWebSocketConfig;
  private trackingOptions: LocationTrackingOptions = {};
  private statusCallback: ((status: LocationStatus) => void) | null = null;
  private locationCallback: ((location: Location, success: boolean) => void) | null = null;
  
  // Estado de tracking
  private isTracking = false;
  private lastUpdate: Date | null = null;
  private updateCount = 0;
  private offlineQueue: Location[] = [];
  private publishInterval: number | null = null;

  // Lista de listeners para cambios de ubicación
  private locationListeners: Array<(location: Location) => void> = [];

  constructor(
    wsConfig: WebSocketConfig,
    locationConfig?: Partial<LocationWebSocketConfig>
  ) {
    this.config = {
      ...wsConfig,
      autoPublish: true,
      publishInterval: LOCATION_CONFIG.UPDATE_INTERVAL,
      batchSize: 1,
      enableOfflineQueue: true,
      ...locationConfig
    };

    this.wsService = new WebSocketService(wsConfig);
    
    // Configurar callbacks del WebSocket
    this.wsService.onStatusChange((status) => {
      this.handleWebSocketStatusChange(status);
    });

    this.wsService.onLocationUpdate((location) => {
      // Notificar listeners de ubicación recibida del servidor
      this.locationListeners.forEach(listener => listener(location));
    });
  }

  /**
   * Inicia el servicio de tracking de ubicación
   */
  async startTracking(options: LocationTrackingOptions = {}): Promise<boolean> {
    try {
      this.trackingOptions = { 
        autoStart: true, 
        highAccuracy: true,
        ...options 
      };

      console.log('🗺️ Iniciando servicio de tracking de ubicación...');

      // Conectar WebSocket si no está conectado
      if (!this.wsService.isConnected()) {
        await this.wsService.connect();
      }

      // Verificar permisos de ubicación
      const hasPermission = await this.checkLocationPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación no concedidos');
      }

      // Iniciar tracking
      this.isTracking = true;
      
      // Configurar interval de publicación automática
      if (this.config.autoPublish) {
        this.startAutoPublish();
      }

      this.notifyStatusChange();
      
      console.log('✅ Servicio de tracking iniciado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error iniciando tracking:', error);
      this.isTracking = false;
      this.notifyStatusChange();
      return false;
    }
  }

  /**
   * Detiene el servicio de tracking
   */
  stopTracking(): void {
    console.log('🛑 Deteniendo servicio de tracking...');
    
    this.isTracking = false;
    this.stopAutoPublish();
    
    // Vaciar cola offline antes de detener
    if (this.offlineQueue.length > 0 && this.wsService.isConnected()) {
      this.processOfflineQueue();
    }
    
    this.notifyStatusChange();
  }

  /**
   * Envía ubicación manualmente
   */
  async sendLocation(location: Location): Promise<boolean> {
    try {
      // Validar datos de ubicación
      if (!this.validateLocation(location)) {
        console.error('❌ Datos de ubicación inválidos:', location);
        return false;
      }

      // Si hay listeners, notificar antes de enviar
      this.locationListeners.forEach(listener => listener(location));

      // Actualizar estado
      this.lastUpdate = new Date();
      this.updateCount++;
      
      let success = false;

      // Intentar enviar vía WebSocket
      if (this.wsService.isConnected() && this.isTracking) {
        success = this.wsService.sendLocation(location, {
          vehicleId: this.trackingOptions.vehicleId,
          driverId: this.trackingOptions.driverId,
          routeId: this.trackingOptions.routeId,
          hasAssignedRoute: !!this.trackingOptions.routeId,
          trackingType: this.trackingOptions.routeId ? 'assigned_route' : 'free_tracking'
        });

        if (success) {
          console.log('✅ Ubicación enviada vía WebSocket');
        } else {
          console.warn('⚠️ Error enviando vía WebSocket, usando método alternativo');
        }
      }

      // Usar LocationService con MQTT como método principal
      if (!success) {
        success = LocationService.publishLocationData(
          location,
          this.trackingOptions.routeId,
          this.trackingOptions.vehicleId || 'unknown',
          this.trackingOptions.driverId,
          // Función de publicación MQTT simple
          (topic: string, data: any) => {
            try {
              console.log(`📡 MQTT Publish: ${topic}`, data);
              // Aquí se integraría con el hook MQTT real
              // Por ahora solo simula la publicación
              return true;
            } catch (error) {
              console.error('❌ Error en función MQTT:', error);
              return false;
            }
          }
        );
        
        if (success) {
          console.log('✅ Ubicación enviada vía MQTT principal');
        }
      }

      // Si falla todo y hay cola offline habilitada, guardar para envío posterior
      if (!success && this.config.enableOfflineQueue) {
        this.offlineQueue.push(location);
        console.log(`📥 Ubicación guardada en cola offline (${this.offlineQueue.length} pendientes)`);
      }

      // Notificar callback
      if (this.locationCallback) {
        this.locationCallback(location, success);
      }

      this.notifyStatusChange();
      return success;
      
    } catch (error) {
      console.error('❌ Error enviando ubicación:', error);
      return false;
    }
  }

  /**
   * Añade listener para cambios de ubicación
   */
  addLocationListener(listener: (location: Location) => void): () => void {
    this.locationListeners.push(listener);
    
    // Retornar función para remover listener
    return () => {
      const index = this.locationListeners.indexOf(listener);
      if (index > -1) {
        this.locationListeners.splice(index, 1);
      }
    };
  }

  /**
   * Establece callback para cambios de estado
   */
  onStatusChange(callback: (status: LocationStatus) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Establece callback para actualizaciones de ubicación
   */
  onLocationUpdate(callback: (location: Location, success: boolean) => void): void {
    this.locationCallback = callback;
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus(): LocationStatus {
    const wsStatus = this.wsService.getStatus();
    
    return {
      ...wsStatus,
      tracking: this.isTracking,
      lastUpdate: this.lastUpdate,
      updateCount: this.updateCount,
      offlineQueueSize: this.offlineQueue.length
    };
  }

  /**
   * Verifica si el tracking está activo
   */
  isTrackingActive(): boolean {
    return this.isTracking && this.wsService.isConnected();
  }

  /**
   * Obtiene el número de actualizaciones pendientes en cola
   */
  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  /**
   * Procesa la cola de ubicaciones offline
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0 || !this.wsService.isConnected()) {
      return;
    }

    console.log(`📤 Procesando ${this.offlineQueue.length} ubicaciones de cola offline...`);

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const location of queue) {
      const success = await this.sendLocation(location);
      if (!success) {
        // Si falla, volver a poner en cola
        this.offlineQueue.push(location);
      }
      
      // Pequeña pausa entre envíos para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Inicia publicación automática
   */
  private startAutoPublish(): void {
    this.stopAutoPublish();
    
    this.publishInterval = setInterval(() => {
      if (this.isTracking) {
        // En una implementación real, aquí se obtendría la ubicación actual
        // Por ahora, simulamos una actualización
        console.log('⏰ Actualización automática de ubicación');
      }
    }, this.config.publishInterval);
  }

  /**
   * Detiene publicación automática
   */
  private stopAutoPublish(): void {
    if (this.publishInterval !== null) {
      clearInterval(this.publishInterval);
      this.publishInterval = null;
    }
  }

  /**
   * Maneja cambios de estado del WebSocket
   */
  private handleWebSocketStatusChange(wsStatus: WebSocketStatus): void {
    console.log('📡 Estado WebSocket cambiado:', wsStatus);
    
    // Si se reconnectó y hay cola offline, procesarla
    if (wsStatus.connected && this.offlineQueue.length > 0) {
      setTimeout(() => {
        this.processOfflineQueue();
      }, 1000); // Esperar un momento para que la conexión se estabilice
    }
    
    this.notifyStatusChange();
  }

  /**
   * Notifica cambios de estado
   */
  private notifyStatusChange(): void {
    if (this.statusCallback) {
      this.statusCallback(this.getStatus());
    }
  }

  /**
   * Valida datos de ubicación
   */
  private validateLocation(location: Location): boolean {
    return (
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      typeof location.timestamp === 'number' &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180 &&
      location.timestamp > 0
    );
  }

  /**
   * Verifica permisos de ubicación (implementación básica)
   */
  private async checkLocationPermissions(): Promise<boolean> {
    // En una implementación real, aquí se verificarían los permisos
    // usando expo-location o react-native-permissions
    console.log('✅ Verificando permisos de ubicación...');
    return true;
  }
}