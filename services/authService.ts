import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getCommonHeaders } from '@/config/api';
import type { LoginCredentials, User, LoginResult } from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const payload = { userName: credentials.identificacion, password: credentials.password };
      console.log('🔐 AuthService.login ->', {
        endpoint: API_ENDPOINTS.AUTH.LOGIN,
        payload: { ...payload, password: '***' },
      });

      const resp = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: getCommonHeaders(),
        body: JSON.stringify(payload),
      });

      const isJson = resp.headers.get('content-type')?.includes('application/json');
      console.log('🔐 AuthService.login <- respuesta', {
        status: resp.status,
        ok: resp.ok,
        isJson,
      });

      if (!resp.ok) {
        let errorMessage = 'Credenciales inválidas';

        if (isJson) {
          const errorBody = await resp.json().catch(() => null);
          console.log('🔐 AuthService.login <- errorBody', errorBody);
          errorMessage = errorBody?.message || errorBody?.error || errorMessage;
        } else {
          const text = await resp.text().catch(() => '');
          console.log('🔐 AuthService.login <- errorText', text);
          if (text) errorMessage = text;
        }
        return { success: false, error: errorMessage };
      }

      const rawData = isJson ? await resp.json() : await resp.text().then((t) => JSON.parse(t));
      console.log('🔐 AuthService.login <- success body keys', rawData ? Object.keys(rawData) : []);

      const token = rawData?.token;
      let user = rawData?.user || rawData?.data?.user || null;

      if (!token) {
        console.warn('⚠️ AuthService.login: no se encontró token en la respuesta');
        return { success: false, error: 'Respuesta inválida del servidor' };
      }

      if (user && user.id) {
        user = {
          ...user,
          id: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
        };
      }

      console.log('💾 [AuthService.login] Guardando token en AsyncStorage...');
      await AsyncStorage.setItem(TOKEN_KEY, String(token));
      console.log('✅ [AuthService.login] Token guardado en AsyncStorage');

      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('✅ [AuthService.login] Usuario guardado en AsyncStorage');
      }

      return { success: true, token: String(token), user: user || undefined };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: 'Error de conexión',
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(USER_KEY);
      if (!userString) return null;

      const user = JSON.parse(userString);
      if (user && user.id) {
        user.id = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      }
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  static async checkAuthStatus(): Promise<{
    isAuthenticated: boolean;
    user?: User;
    token?: string;
  }> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();

      console.log('🔍 Verificando estado de autenticación:', {
        tokenExists: !!token,
        userExists: !!user,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
      });

      if (token && user) {
        console.log('✅ Sesión válida encontrada');
        return {
          isAuthenticated: true,
          user,
          token,
        };
      }

      console.log('❌ No se encontró sesión válida');
      return { isAuthenticated: false };
    } catch (error) {
      console.error('❌ Error verificando auth status:', error);
      return { isAuthenticated: false };
    }
  }

  static async clearSession(): Promise<void> {
    try {
      console.log('🧼 Limpiando sesión completa...');
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      console.log('✅ Sesión limpiada exitosamente');
    } catch (error) {
      console.error('❌ Error limpiando sesión:', error);
    }
  }

  static async hasStoredSession(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      return !!(token && user);
    } catch (error) {
      return false;
    }
  }
}