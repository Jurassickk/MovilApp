# Implementación MQTT - UrbanTracker

## Resumen de Implementación

Se ha implementado exitosamente la lógica MQTT completa del proyecto de referencia en el proyecto actual. La implementación incluye una arquitectura robusta con manejo automático de conexiones, reconexión, y integración con el sistema de autenticación.

## Archivos Implementados

### 1. Configuración MQTT (`config/mqtt.ts`)
- Configuración completa del broker MQTT
- Opciones de QoS para estabilidad
- Funciones auxiliares para generación de topics y mensajes
- Configuraciones de timeout y reconexión

### 2. Tipos TypeScript (`types/mqtt.ts`)
- Definiciones completas de tipos para el contexto MQTT
- Interfaces para mensajes de ubicación y estado
- Props del Provider y configuraciones

### 3. Contexto React (`contexts/MqttContext.tsx`)
- Contexto React para acceso global al cliente MQTT
- Implementación estándar de Context API

### 4. Provider Robusto (`services/MqttProvider.tsx`)
- Provider principal con manejo automático de conexiones
- Configuración condicional basada en autenticación
- Manejo de estados de conexión, reconexión y errores
- Publicación automática de estado de conexión

### 5. Hooks Especializados (`hooks/useMqtt.ts`)
- `useMqtt`: Hook básico para acceso al contexto
- `useMqttPublish`: Hook para publicaciones robustas con validaciones
- `useMqttLocation`: Hook especializado para publicar ubicaciones
- `useMqttRecorrido`: Hook para publicar estado de recorrido

### 6. Service de Ubicación Actualizado (`services/locationService.ts`)
- Ahora usa MQTT como método principal
- Funciones mejoradas para generar topics dinámicos
- Métodos para usar tanto con hooks como con funciones directas

### 7. Hook Combinado (`hooks/useLocationTracking.ts`)
- Combina WebSocket y MQTT para manejo robusto
- Integra con el sistema de autenticación
- Maneja automáticamente start/stop de tracking

### 8. Integración en Aplicación
- **Layout Principal**: MqttProvider integrado condicionalmente
- **Autenticación**: Hook useAuth agregado al contexto
- **Configuración**: Variables MQTT en .env.example

## Características Principales

### 🔗 Conexión Automática
- Se conecta automáticamente cuando el usuario está autenticado
- Se desconecta automáticamente en logout
- Manejo inteligente de estados de conexión

### 📡 Publicación Robusta
- Validaciones completas antes de publicar
- QoS 0 para evitar desconexiones
- Manejo de errores sin interrupciones

### 🛡️ Manejo de Errores
- Reintentos automáticos de conexión
- Logs detallados para debugging
- Fallbacks entre WebSocket y MQTT

### 📍 Topics Dinámicos
- Generados automáticamente basados en routeId
- Soporte para rutas asignadas y libres
- Metadatos completos en mensajes

## Uso en Componentes

### Usar MQTT Básico
```typescript
import { useMqtt } from '@/hooks/useMqtt';

const { connectionStatus, publish } = useMqtt();
```

### Publicar Ubicación
```typescript
import { useMqttLocation } from '@/hooks/useMqtt';

const { publishLocation, connectionStatus } = useMqttLocation();

// Publicar ubicación
const success = publishLocation(
  latitude,
  longitude,
  timestamp,
  vehicleId,
  driverId,
  routeId
);
```

### Tracking Completo
```typescript
import { useLocationTracking } from '@/hooks/useLocationTracking';

const { 
  isTracking, 
  startTracking, 
  stopTracking, 
  sendLocation 
} = useLocationTracking();

// Iniciar tracking
await startTracking(vehicleId, routeId, driverId);

// Enviar ubicación manualmente
await sendLocation(locationData);
```

## Configuración MQTT

Las configuraciones MQTT se leen desde las variables de entorno:

```bash
# .env
MQTT_HOST=10.3.234.142
MQTT_PORT=9001
```

## Topics MQTT

### Estados de Conexión
- **Topic**: `driver/status`
- **Mensaje**: Estado de conexión del cliente

### Estado de Recorrido
- **Topic**: `driver/recorrido`
- **Mensaje**: Inicio/parada de recorrido

### Ubicaciones
- **Topics Dinámicos**:
  - `routes/{routeId}/telemetry` (ruta asignada)
  - `vehicles/{vehicleId}/telemetry` (libre)
  - `drivers/{driverId}/telemetry` (conductor)

## Beneficios de la Implementación

1. **Robustez**: Manejo completo de errores y reconexiones
2. **Eficiencia**: QoS 0 para evitar overhead
3. **Flexibilidad**: Múltiples formas de usar MQTT
4. **Escalabilidad**: Arquitectura modular y extensible
5. **Mantenibilidad**: Código bien estructurado y documentado

## Próximos Pasos

La implementación está completa y lista para usar. Los componentes pueden empezar a usar los hooks MQTT inmediatamente para publicar ubicaciones y manejar el estado de conexión.