import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests (agregar token si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses (manejo de errores)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejo de errores específicos
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/auth/login';
    } else if (error.response?.status === 429) {
      toast.error('Demasiadas solicitudes. Intenta más tarde.');
    } else if (error.response && error.response.status >= 500) {
      toast.error('Error del servidor. Intenta más tarde.');
    }
    
    return Promise.reject(error);
  }
);

// Tipos para las respuestas de la API
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      tipo_usuario: 'explorador' | 'as';
      perfil?: any;
    };
    access_token: string;
    refresh_token: string;
  };
  error?: string;
}

export interface ApiError {
  message?: string;
  error?: string;
  code?: string;
  details?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
  errors?: Record<string, string[]>;
}

// Datos para registro
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  tipo_usuario: 'explorador' | 'as';
  acepta_terminos: boolean;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  fecha_nacimiento?: string;
  // Ubicación
  direccion: string;
  localidad: string;
  provincia: string;
  codigo_postal?: string;
  // Campos específicos para AS
  nivel_educativo?: string;
  tiene_movilidad?: boolean;
}

// Datos para login
export interface LoginData {
  email: string;
  password: string;
}

// Servicios de autenticación
export const authService = {
  // Registro de usuario
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      
      if (response.data.success && response.data.data) {
        // Guardar tokens
        localStorage.setItem('auth_token', response.data.data.access_token);
        localStorage.setItem('refresh_token', response.data.data.refresh_token);
        
        // Guardar info del usuario
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success(response.data.message || '¡Registro exitoso!');
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiError;
        
        // Mostrar errores específicos de validación
        if (errorData.details) {
          errorData.details.forEach(detail => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else if (errorData.errors) {
          Object.values(errorData.errors).flat().forEach(err => {
            toast.error(err);
          });
        } else {
          toast.error(errorData.message || errorData.error || 'Error en el registro');
        }
        
        throw errorData;
      } else {
        const errorMessage = 'Error de conexión. Verifica tu internet.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  },

  // Login de usuario
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      
      if (response.data.success && response.data.data) {
        // Guardar tokens
        localStorage.setItem('auth_token', response.data.data.access_token);
        localStorage.setItem('refresh_token', response.data.data.refresh_token);
        
        // Guardar info del usuario
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success(response.data.message || '¡Bienvenido de vuelta!');
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiError;
        
        // Mostrar errores específicos de validación
        if (errorData.details) {
          errorData.details.forEach(detail => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(errorData.message || errorData.error || 'Credenciales incorrectas');
        }
        
        throw errorData;
      } else {
        const errorMessage = 'Error de conexión. Verifica tu internet.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      // Limpiar almacenamiento local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      toast.success('Sesión cerrada correctamente');
    }
  },

  // Obtener perfil del usuario
  async getProfile(): Promise<any> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Verificar si hay una sesión activa
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Obtener usuario actual del localStorage
  getCurrentUser(): { id: string; email: string; tipo_usuario: 'explorador' | 'as'; nombre?: string; apellido?: string; } | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Refrescar token
  async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/api/auth/refresh-token', {
        refresh_token: refreshToken
      });

      if (response.data.success && response.data.data) {
        localStorage.setItem('auth_token', response.data.data.access_token);
      }
    } catch (error) {
      // Si falla el refresh, cerrar sesión
      this.logout();
      throw error;
    }
  }
};

// Exportar instancia de API para otros usos
export default api;