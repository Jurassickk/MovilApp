import { useRouter, RelativePathString } from 'expo-router';
import { Image, Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useEffect } from 'react';

export default function Login() {
  const router = useRouter();
  const {
    loginCredential,
    handleChangeCredentials,
    showPassword,
    isLoggingIn,
    isAuthenticated,
    error,
    handleLogin,
    togglePasswordVisibility,
    handleForgotPassword,
  } = useLoginForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ [Login] Usuario autenticado, redirigiendo a interfaz del conductor');
      router.replace('/(tabs)' as RelativePathString);
    }
  }, [isAuthenticated, router]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botón de volver atrás */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Header con logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.svg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>UrbanTracker</Text>
        <Text style={styles.subtitle}>Acceso para Conductores</Text>
      </View>

      {/* Formulario de login */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Identificación</Text>
          <TextInput
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            style={styles.textInput}
            placeholder="Ingresa tu credencial"
            value={loginCredential.identificacion}
            onChangeText={handleChangeCredentials('identificacion')}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholderTextColor="#9ca3af"
              style={styles.passwordInput}
              placeholder="Ingresa tu contraseña"
              secureTextEntry={!showPassword}
              value={loginCredential.password}
              onChangeText={handleChangeCredentials('password')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                {showPassword ? '🔒 Ocultar' : '👁️ Mostrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleForgotPassword} style={styles.helpContainer}>
          <Text style={styles.helpText}>¿Necesitas ayuda? Contacta al administrador</Text>
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoggingIn || !loginCredential.identificacion || !loginCredential.password}
          style={[
            styles.loginButton,
            (isLoggingIn || !loginCredential.identificacion || !loginCredential.password) 
              ? styles.loginButtonDisabled 
              : styles.loginButtonEnabled
          ]}
        >
          {isLoggingIn ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.loginButtonText}>Verificando credenciales...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sistema seguro para conductores autorizados
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
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  logoContainer: {
    height: 80,
    width: 80,
    marginBottom: 20,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 60,
    width: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  toggleText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  helpContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  helpText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#451a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonEnabled: {
    backgroundColor: '#3b82f6',
  },
  loginButtonDisabled: {
    backgroundColor: '#374151',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});