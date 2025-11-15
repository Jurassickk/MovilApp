export const APP_CONFIG = {
  NAME: 'UrbanTracker Driver',
  VERSION: '1.0.0',
  DESCRIPTION: 'Aplicación de seguimiento para conductores',
} as const;

export const LOCATION_CONFIG = {
  UPDATE_INTERVAL: 5000,
  DISTANCE_INTERVAL: 10,
  ACCURACY_THRESHOLD: 20,
  TIMEOUT: 15000,
} as const;

export const MQTT_TOPICS = {
  TRACKING_STATUS: 'driver/recorrido',
  CONNECTION_STATUS: 'driver/status',
  REPORTS: 'driver/reports',
} as const;

export const CONNECTION_STATUS = {
  CONNECTED: 'Conectado',
  CONNECTING: 'Conectando',
  RECONNECTING: 'Reconectando',
  DISCONNECTED: 'Desconectado',
  ERROR: 'Error',
} as const;

export const TRACKING_STATUS = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PAUSED: 'Pausado',
} as const;

export const RECORRIDO_STATUS = {
  STARTED: 'En Recorrido',
  STOPPED: 'Detenido',
  PAUSED: 'Pausado',
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  MODAL_ANIMATION: 'slide',
} as const;

export const STATUS_COLORS = {
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  NEUTRAL: '#6b7280',
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Teléfono inválido',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No puede exceder ${max} caracteres`,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'auth_user',
  SETTINGS: 'app_settings',
  LAST_LOCATION: 'last_location',
} as const;