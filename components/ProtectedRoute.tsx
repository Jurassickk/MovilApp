import useAuth from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#ffffff', marginTop: 10 }}>Verificando autenticación...</Text>
      </View>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('🔐 [ProtectedRoute] Usuario no autenticado, redirigiendo al login');
    return <Redirect href={("/login" as RelativePathString)} />;
  }

  console.log('✅ [ProtectedRoute] Usuario autenticado, mostrando contenido protegido');
  return <>{children}</>;
}