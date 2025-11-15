import type { Location } from '@/types/location';
import { generateLocationTopic, createLocationMessage } from '@/config/mqtt';

/**
 * Servicio de ubicación principal - Ahora usa MQTT como método primario
 */
export class LocationService {
  /**
   * Publica datos de ubicación usando MQTT (método primario)
   */
  static publishLocationData(
    location: Location,
    routeId?: string,
    vehicleId: string = '123-456',
    driverId?: string,
    publishViaMqtt?: (topic: string, data: any) => boolean
  ): boolean {
    try {
      if (!this.validateLocationData(location)) {
        console.error('❌ Datos de ubicación inválidos:', location);
        return false;
      }

      let topic: string;

      if (routeId) {
        // Usar el sistema de topics dinámico basado en routeId
        topic = generateLocationTopic(routeId);
        console.log('🛣️ Publicando ubicación via MQTT - Topic:', topic);
      } else {
        // Topic por defecto para vehículos sin ruta asignada
        topic = `vehicles/${vehicleId}/telemetry`;
        console.log('🚗 Publicando ubicación via MQTT (sin ruta) - Topic:', topic);
      }

      // Preparar mensaje usando el formato MQTT
      const message = createLocationMessage(
        location.latitude,
        location.longitude,
        location.timestamp,
        vehicleId,
        driverId,
        routeId
      );

      // Si hay función de publicación MQTT personalizada, usarla
      if (publishViaMqtt) {
        const success = publishViaMqtt(topic, message);
        if (success) {
          console.log('✅ Ubicación publicada exitosamente via MQTT:', {
            topic,
            lat: message.lat,
            lon: message.lon,
            timestamp: message.timestamp,
            vehicleId,
            driverId,
            routeId,
          });
        }
        return success;
      }

      // Si no hay función de publicación, solo logear (para desarrollo)
      console.log('📍 Ubicación preparada para publicación via MQTT:', {
        topic,
        message,
        trackingType: routeId ? 'ruta_asignada' : 'libre',
      });

      return true;
    } catch (error) {
      console.error('❌ Error publicando ubicación via MQTT:', error);
      return false;
    }
  }

  /**
   * Publica ubicación usando el sistema React Hook (para usar con useMqttLocation)
   */
  static publishLocationViaHook(
    publishLocationFunction: (lat: number, lon: number, timestamp: number, vehicleId?: string, driverId?: string, routeId?: string) => boolean,
    location: Location,
    routeId?: string,
    vehicleId: string = '123-456',
    driverId?: string
  ): boolean {
    try {
      if (!this.validateLocationData(location)) {
        console.error('❌ Datos de ubicación inválidos:', location);
        return false;
      }

      console.log('📡 Publicando ubicación via Hook MQTT:', {
        lat: location.latitude,
        lon: location.longitude,
        timestamp: location.timestamp,
        vehicleId,
        driverId,
        routeId,
      });

      return publishLocationFunction(
        location.latitude,
        location.longitude,
        location.timestamp,
        vehicleId,
        driverId,
        routeId
      );
    } catch (error) {
      console.error('❌ Error publicando ubicación via Hook MQTT:', error);
      return false;
    }
  }

  /**
   * Valida datos de ubicación
   */
  static validateLocationData(location: Location): boolean {
    return (
      location &&
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
   * Calcula distancia entre dos puntos usando fórmula de Haversine
   */
  static calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Retornar en metros
  }

  /**
   * Convierte grados a radianes
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Genera un topic de ubicación basado en parámetros
   */
  static generateLocationTopic(
    routeId?: string,
    vehicleId?: string,
    driverId?: string
  ): string {
    if (routeId) {
      return generateLocationTopic(routeId);
    } else if (vehicleId) {
      return `vehicles/${vehicleId}/telemetry`;
    } else if (driverId) {
      return `drivers/${driverId}/telemetry`;
    } else {
      return 'vehicles/default/telemetry';
    }
  }

  /**
   * Formatea datos de ubicación para envío
   */
  static formatLocationMessage(
    location: Location,
    vehicleId?: string,
    driverId?: string,
    routeId?: string
  ) {
    return {
      lat: location.latitude,
      lon: location.longitude,
      timestamp: location.timestamp,
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId }),
      ...(routeId && { routeId }),
      source: 'MOVILE',
    };
  }
}