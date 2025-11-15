import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import MqttProvider from '@/services/MqttProvider';

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar un splash screen mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#ffffff', fontSize: 16, marginTop: 10 }}>Cargando UrbanTracker...</Text>
      </View>
    );
  }

  return (
    <MqttProvider
      isAuthenticated={isAuthenticated}
      shouldConnect={isAuthenticated}
    >
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'UrbanTracker - Mapa Público'
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
            title: 'Login de Conductores'
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            // Esta pantalla solo será accesible cuando esté autenticado
            ...(isAuthenticated ? {} : { redirect: '/index' })
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </MqttProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
