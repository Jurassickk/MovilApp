import { useContext } from 'react';
import MqttContext from '@/contexts/MqttContext';
import type { MqttContextType, MqttLocationData } from '@/types/mqtt';
import { 
  createLocationMessage, 
  createRecorridoStatusMessage, 
  generateLocationTopic,
  isValidTopic,
  isValidJsonMessage 
} from '@/config/mqtt';

export const useMqtt = (): MqttContextType => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqtt must be used within a MqttProvider');
  }
  return context;
};

// Hook personalizado para publicaciones más robustas
export const useMqttPublish = () => {
  const { client, connectionStatus, publish } = useMqtt();

  const publishSafely = (topic: string, data: any) => {
    try {
      // Validar que el cliente esté conectado
      if (connectionStatus !== 'Conectado') {
        console.log('❌ No se puede publicar: Cliente no conectado. Estado:', connectionStatus);
        return false;
      }

      // Validar que el topic no esté vacío
      if (!isValidTopic(topic)) {
        console.log('❌ No se puede publicar: Topic inválido');
        return false;
      }

      // Validar que los datos no estén vacíos
      if (!data) {
        console.log('❌ No se puede publicar: Datos vacíos');
        return false;
      }

      // Convertir a JSON
      const message = typeof data === 'string' ? data : JSON.stringify(data);

      // Validar que el JSON sea válido
      if (!isValidJsonMessage(message)) {
        console.log('❌ No se puede publicar: JSON inválido');
        return false;
      }

      // Publicar con QoS 0 para evitar desconexiones
      publish(topic, message);
      return true;
    } catch (error) {
      console.log('❌ Error en publishSafely:', error);
      return false;
    }
  };

  return {
    client,
    connectionStatus,
    publish,
    publishSafely,
  };
};

// Hook especializado para publicar ubicaciones
export const useMqttLocation = () => {
  const { publishSafely } = useMqttPublish();

  const publishLocation = (
    latitude: number, 
    longitude: number, 
    timestamp: number,
    vehicleId?: string,
    driverId?: string,
    routeId?: string
  ): boolean => {
    try {
      const locationMessage = createLocationMessage(latitude, longitude, timestamp);
      
      // Añadir metadatos adicionales si están disponibles
      if (vehicleId) locationMessage.vehicleId = vehicleId;
      if (driverId) locationMessage.driverId = driverId;
      if (routeId) locationMessage.routeId = routeId;

      // Generar topic dinámico basado en routeId
      const topic = routeId ? generateLocationTopic(routeId) : 'vehicles/telemetry';

      console.log('📍 Publicando ubicación via MQTT:', { 
        topic, 
        lat: latitude, 
        lon: longitude, 
        timestamp,
        vehicleId,
        driverId,
        routeId
      });

      return publishSafely(topic, locationMessage);
    } catch (error) {
      console.log('❌ Error publicando ubicación via MQTT:', error);
      return false;
    }
  };

  return {
    publishLocation,
    connectionStatus: useMqtt().connectionStatus,
    client: useMqtt().client,
  };
};

// Hook especializado para publicar estado de recorrido
export const useMqttRecorrido = () => {
  const { publishSafely } = useMqttPublish();

  const publishRecorridoStatus = (
    isActive: boolean,
    startTime?: string,
    endTime?: string
  ): boolean => {
    try {
      const recorridoMessage = createRecorridoStatusMessage(isActive, startTime, endTime);

      console.log('🚗 Publicando estado de recorrido via MQTT:', { 
        isActive, 
        startTime, 
        endTime 
      });

      // Publicar en el topic específico de recorrido
      return publishSafely('driver/recorrido', recorridoMessage);
    } catch (error) {
      console.log('❌ Error publicando estado de recorrido via MQTT:', error);
      return false;
    }
  };

  return {
    publishRecorridoStatus,
    connectionStatus: useMqtt().connectionStatus,
    client: useMqtt().client,
  };
};

export default useMqtt;