import { Platform } from 'react-native';
import type { Location } from '@/types/location';

// Importar WebSocket dinámicamente para cada plataforma
let RNWebSocket: any = null;

if (Platform.OS === 'web') {
  RNWebSocket = WebSocket;
} else {
  // En React Native, WebSocket está disponible globalmente
  RNWebSocket = (global as any).WebSocket;
  if (!RNWebSocket) {
    console.warn('⚠️ WebSocket no disponible en esta plataforma');
  }
}

// WebSocket interface compatible con React Native
interface NativeWebSocket {
  onopen: ((event: any) => void) | null;
  onmessage: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onclose: ((event: any) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  readyState: number;
  CONNECTING: number;
  OPEN: number;
  CLOSING: number;
  CLOSED: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface LocationMessage {
  type: 'location_update';
  data: {
    vehicleId: string;
    driverId?: string;
    routeId?: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
    source: 'MOVILE';
    hasAssignedRoute: boolean;
    trackingType: 'assigned_route' | 'free_tracking';
  };
}

export interface WebSocketStatus {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  lastError: string | null;
  reconnectAttempts: number;
}

export class WebSocketService {
  private ws: NativeWebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private statusCallback: ((status: WebSocketStatus) => void) | null = null;
  private locationCallback: ((location: Location) => void) | null = null;
  private currentStatus: WebSocketStatus = {
    connected: false,
    connecting: false,
    reconnecting: false,
    lastError: null,
    reconnectAttempts: 0,
  };

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  /**
   * Conecta al servidor WebSocket
   */
  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws?.readyState === 1) { // WebSocket.OPEN = 1
          resolve(true);
          return;
        }

        this.updateStatus({ connecting: true, lastError: null });

        console.log('🔌 Conectando al servidor WebSocket...');

        // Verificar que WebSocket esté disponible
        if (!RNWebSocket) {
          console.warn('⚠️ WebSocket no disponible, intentando usar polyfill...');
          // Intentar usar polyfill si está disponible
          try {
            RNWebSocket = require('react-native-tcp-socket').WebSocket || require('ws');
          } catch {
            throw new Error('WebSocket no está disponible en esta plataforma');
          }
        }

        // Crear instancia de WebSocket
        this.ws = new RNWebSocket(this.config.url) as NativeWebSocket;

        if (!this.ws) {
          throw new Error('No se pudo crear la instancia WebSocket');
        }

        this.ws.onopen = () => {
          console.log('✅ WebSocket conectado exitosamente');
          this.updateStatus({
            connected: true,
            connecting: false,
            reconnecting: false,
            reconnectAttempts: 0,
            lastError: null
          });
          
          // Iniciar heartbeat
          this.startHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event: any) => {
          this.handleMessage(event);
        };

        this.ws.onerror = (error: any) => {
          console.error('❌ Error en WebSocket:', error);
          this.updateStatus({
            lastError: error.message || 'Error de conexión WebSocket'
          });
          reject(error);
        };

        this.ws.onclose = (event: any) => {
          console.log('🔌 WebSocket desconectado:', event.code, event.reason);
          this.updateStatus({
            connected: false,
            connecting: false,
            reconnecting: false
          });
          
          // Limpiar heartbeat
          this.stopHeartbeat();
          
          // Intentar reconectar si no fue un cierre intencional
          if (event.code !== 1000 && this.currentStatus.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
          
          if (event.code !== 1000) {
            reject(new Error(`WebSocket cerrado: ${event.code} - ${event.reason}`));
          }
        };

        // Timeout de conexión
        setTimeout(() => {
          if (this.currentStatus.connecting && !this.currentStatus.connected) {
            this.ws?.close();
            reject(new Error('Timeout de conexión WebSocket'));
          }
        }, this.config.timeout);

      } catch (error) {
        console.error('❌ Error inicializando WebSocket:', error);
        this.updateStatus({ lastError: (error as Error).message });
        reject(error);
      }
    });
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect(): void {
    console.log('🔌 Desconectando WebSocket...');
    
    // Cancelar timers
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    // Cerrar conexión
    if (this.ws) {
      this.ws.close(1000, 'Desconexión intencional');
      this.ws = null;
    }
    
    this.updateStatus({ 
      connected: false, 
      connecting: false,
      reconnecting: false 
    });
  }

  /**
   * Envía un mensaje de ubicación
   */
  sendLocation(location: Location, options: {
    vehicleId?: string;
    driverId?: string;
    routeId?: string;
    hasAssignedRoute?: boolean;
    trackingType?: 'assigned_route' | 'free_tracking';
  } = {}): boolean {
    if (!this.ws || this.ws.readyState !== 1) { // WebSocket.OPEN = 1
      console.warn('⚠️ WebSocket no está conectado');
      return false;
    }

    try {
      const message: LocationMessage = {
        type: 'location_update',
        data: {
          vehicleId: options.vehicleId || 'unknown',
          driverId: options.driverId,
          routeId: options.routeId,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date(location.timestamp).toISOString(),
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          source: 'MOVILE',
          hasAssignedRoute: options.hasAssignedRoute || false,
          trackingType: options.trackingType || 'free_tracking',
        }
      };

      this.ws.send(JSON.stringify(message));
      console.log('📍 Ubicación enviada:', message.data);
      return true;
    } catch (error) {
      console.error('❌ Error enviando ubicación:', error);
      return false;
    }
  }

  /**
   * Establece callback para cambios de estado
   */
  onStatusChange(callback: (status: WebSocketStatus) => void): void {
    this.statusCallback = callback;
  }

  /**
   * Establece callback para mensajes recibidos
   */
  onLocationUpdate(callback: (location: Location) => void): void {
    this.locationCallback = callback;
  }

  /**
   * Obtiene el estado actual
   */
  getStatus(): WebSocketStatus {
    return { ...this.currentStatus };
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.currentStatus.connected;
  }

  /**
   * Maneja mensajes entrantes
   */
  private handleMessage(event: any): void {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'location_ack':
          console.log('✅ Ubicación confirmada por el servidor');
          break;
        
        case 'command':
          this.handleCommand(data.command);
          break;
          
        case 'error':
          console.error('❌ Error del servidor:', data.message);
          break;
          
        default:
          console.log('📨 Mensaje recibido:', data);
      }
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
    }
  }

  /**
   * Maneja comandos del servidor
   */
  private handleCommand(command: any): void {
    switch (command.type) {
      case 'ping':
        // El servidor hace ping, responder con pong
        this.sendPong();
        break;
        
      case 'update_config':
        // Actualizar configuración dinámicamente
        console.log('🔄 Actualizando configuración desde servidor');
        break;
        
      default:
        console.log('🔧 Comando recibido:', command);
    }
  }

  /**
   * Programa reconexión automática
   */
  private scheduleReconnect(): void {
    if (this.currentStatus.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      return;
    }

    this.updateStatus({ 
      reconnecting: true,
      reconnectAttempts: this.currentStatus.reconnectAttempts + 1 
    });

    this.clearReconnectTimer();
    
    const delay = this.config.reconnectInterval * Math.pow(2, this.currentStatus.reconnectAttempts - 1);
    
    console.log(`🔄 Programando reconexión en ${delay}ms (intento ${this.currentStatus.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.currentStatus.connected) {
        this.connect().catch(error => {
          console.error('❌ Error en reconexión:', error);
          this.scheduleReconnect();
        });
      }
    }, delay);
  }

  /**
   * Inicia heartbeat para mantener la conexión
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === 1) { // WebSocket.OPEN = 1
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Detiene heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Limpia timer de reconexión
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Envía pong en respuesta a ping
   */
  private sendPong(): void {
    if (this.ws?.readyState === 1) { // WebSocket.OPEN = 1
      this.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
    }
  }

  /**
   * Actualiza el estado y notifica callback
   */
  private updateStatus(partialStatus: Partial<WebSocketStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...partialStatus };
    
    if (this.statusCallback) {
      this.statusCallback(this.currentStatus);
    }
  }
}