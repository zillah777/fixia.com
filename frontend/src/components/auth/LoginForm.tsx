import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { LoginFormData } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.post('/auth/login', data);
      // const { user, token } = response.data;
      
      // localStorage.setItem('auth_token', token);

      // Mock login por ahora
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      const mockUser = {
        id: '1',
        email: data.email,
        tipo_usuario: 'as',
        nombre: 'Usuario',
        apellido: 'Ejemplo'
      };

      if (onSuccess) {
        onSuccess(mockUser);
      } else {
        // Redirect based on user type
        const redirectPath = mockUser.tipo_usuario === 'as' ? '/dashboard' : '/explore';
        router.push(redirectPath);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      
      if (onError) {
        onError(errorMessage);
      } else {
        setError('root', { message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all
              ${errors.email 
                ? 'border-secondary-red focus:ring-secondary-red/20 focus:border-secondary-red' 
                : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
              }
            `}
            placeholder="tu@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-secondary-red">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all
              ${errors.password 
                ? 'border-secondary-red focus:ring-secondary-red/20 focus:border-secondary-red' 
                : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
              }
            `}
            placeholder="Tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-secondary-red">{errors.password.message}</p>
        )}
      </div>

      {/* General Error */}
      {errors.root && (
        <div className="p-3 bg-secondary-red/10 border border-secondary-red/20 rounded-lg">
          <p className="text-sm text-secondary-red">{errors.root.message}</p>
        </div>
      )}

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/auth/forgot-password')}
          className="text-sm text-primary-blue hover:text-primary-blue-dark transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white transition-all
          ${loading
            ? 'bg-neutral-400 cursor-not-allowed'
            : 'bg-primary-blue hover:bg-primary-blue-dark hover:shadow-lg'
          }
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Iniciando sesión...</span>
          </div>
        ) : (
          'Iniciar Sesión'
        )}
      </button>
    </motion.form>
  );
}