import { Redirect } from 'expo-router';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLoginForm } from '@/hooks/useLoginForm';

export default function Login() {
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

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-black px-7">
      <View className="mb-10 h-60 w-60">
        <Image
          source={require('@/assets/images/logo.svg')}
          className="h-full w-full"
          resizeMode="contain"
        />
      </View>

      <View className="mb-4 w-full">
        <Text className="mb-1 ml-4 text-gray-300">Identificación</Text>
        <TextInput
          keyboardType="numeric"
          placeholderTextColor="#a1a1aa"
          className="rounded-full bg-zinc-800 px-5 py-3 text-white"
          placeholder="Ingresa tu credencial"
          value={loginCredential.identificacion}
          onChangeText={handleChangeCredentials('identificacion')}
        />
      </View>

      <View className="mb-2 w-full">
        <Text className="mb-1 ml-4 text-gray-300">Contraseña</Text>
        <View className="flex-row items-center rounded-full bg-zinc-800">
          <TextInput
            placeholderTextColor="#a1a1aa"
            className="flex-1 px-5 py-3 text-white"
            placeholder="Ingresa tu contraseña"
            secureTextEntry={!showPassword}
            value={loginCredential.password}
            onChangeText={handleChangeCredentials('password')}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} className="p-3">
            <Text className="font-bold text-gray-400">{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleForgotPassword} className="mb-6 w-full items-end pr-2">
        <Text className="text-sm text-blue-500">¿Necesitas ayuda?</Text>
      </TouchableOpacity>

      {error && (
        <View className="mb-4 w-full rounded-lg bg-red-900/50 p-3">
          <Text className="text-center text-red-300">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoggingIn}
        className={`mb-4 rounded-full px-16 py-4 ${isLoggingIn ? 'bg-gray-400' : 'bg-gray-200'}`}>
        <Text className="text-center text-lg font-bold text-black">
          {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}