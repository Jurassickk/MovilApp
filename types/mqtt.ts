import type { MqttClient } from 'mqtt';

export type MqttConnectionStatus =
  | 'Desconectado'
  | 'Conectado'
  | 'Reconectando'
  | 'Error de conexión';

export interface MqttContextType {
  // Cliente MQTT actual
  client: MqttClient | null;

  // Estado actual de la conexión
  connectionStatus: MqttConnectionStatus;

  // Método para publicar mensajes
  publish: (topic: string, message: string) => void;
}

export interface MqttProviderConditionalProps {
  children: React.ReactNode;
  shouldConnect?: boolean; // Prop para controlar si debe conectarse
  isAuthenticated?: boolean; // Prop para verificar autenticación
}

export interface MqttPublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
  callback?: (error?: Error) => void;
}

export interface MqttLocationData {
  lat: number;
  lon: number;
  timestamp: number;
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
}

export interface MqttConnectionMessage {
  type: 'connection_status';
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  timestamp: string;
  clientId: string;
}

export interface MqttRecorridoMessage {
  type: 'recorrido_status';
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  timestamp: string;
}