import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import useAuth from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleToggleOnline = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsOnline(!isOnline);
      setIsLoading(false);
      Alert.alert(
        'Estado Actualizado',
        `Ahora estás ${isOnline ? 'desconectado' : 'conectado'} como conductor disponible.`,
        [{ text: 'Entendido' }]
      );
    }, 1000);
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Reportar Problema',
      '¿Qué tipo de problema tienes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Problema de Vehículo', onPress: () => handleReportType('vehicle') },
        { text: 'Problema de Ruta', onPress: () => handleReportType('route') },
        { text: 'Problema Técnico', onPress: () => handleReportType('technical') },
      ]
    );
  };

  const handleReportType = (type: string) => {
    const messages = {
      vehicle: 'Problema de vehículo reportado. El equipo de soporte te contactará.',
      route: 'Problema de ruta reportado. Se revisarán las asignaciones.',
      technical: 'Problema técnico reportado. Se investigará la aplicación.',
    };
    Alert.alert('Reporte Enviado', messages[type as keyof typeof messages], [{ text: 'Entendido' }]);
  };

  const handleViewHistory = () => {
    Alert.alert(
      'Historial de Viajes',
      'Aquí podrías ver el historial completo de tus viajes anteriores.',
      [{ text: 'Ver Más' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : user?.identificacion?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.nombre || 'Conductor'}
        </Text>
        <Text style={styles.id}>
          ID: {user?.identificacion || 'N/A'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Servicio</Text>
        
        <View style={styles.statusCard}>
          <Text style={styles.cardLabel}>Estado:</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Disponible' : 'No Disponible'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: isOnline ? '#ef4444' : '#10b981' }
            ]}
            onPress={handleToggleOnline}
            disabled={isLoading}
          >
            <Text style={styles.toggleButtonText}>
              {isLoading ? 'Cargando...' : isOnline ? 'Marcar No Disponible' : 'Marcar Disponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Vehículo</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vehículo Asignado:</Text>
            <Text style={styles.value}>{user?.vehicleId || 'No asignado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ruta Asignada:</Text>
            <Text style={styles.value}>{user?.routeId || 'No asignada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={[styles.value, { color: '#10b981' }]}>Activo</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad</Text>
        
        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>0</Text>
              <Text style={styles.activityLabel}>Viajes Hoy</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>0.0</Text>
              <Text style={styles.activityLabel}>Km Hoy</Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityValue}>00:00</Text>
              <Text style={styles.activityLabel}>Tiempo Activo</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
            <Text style={styles.historyButtonText}>Ver Historial Completo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte y Reportes</Text>
        
        <View style={styles.supportCard}>
          <TouchableOpacity style={styles.supportButton} onPress={handleReportIssue}>
            <Text style={styles.supportButtonText}>Reportar Problema</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Ayuda y Documentación</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Notificaciones</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Privacidad</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Acerca de la Aplicación</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          UrbanTracker Driver v1.0.0
        </Text>
        <Text style={styles.footerText}>
          © 2024 UrbanTracker. Todos los derechos reservados.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1f2937',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  id: {
    fontSize: 16,
    color: '#9ca3af',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  cardLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#9ca3af',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  activityCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  activityItem: {
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  activityLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  historyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  supportCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  supportButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  supportButtonText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  settingsCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center',
  },
});
