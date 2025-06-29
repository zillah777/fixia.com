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
  LockClosedIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { RegisterFormData } from '@/types';
import { BRAND_TERMS, APP_CONFIG } from '@/utils/constants';

const signupSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  tipo_usuario: z.enum(['as', 'explorador'], {
    required_error: 'Seleccioná tu tipo de usuario'
  }),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(10, 'Ingresá un número de teléfono válido')
});

interface SignupFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export default function SignupForm({ onSuccess, onError }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(signupSchema)
  });

  const selectedUserType = watch('tipo_usuario');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      
      // TODO: Reemplazar con llamada real a la API
      // const response = await api.post('/auth/register', data);
      // const { user, token } = response.data;
      
      // localStorage.setItem('auth_token', token);

      // Mock registration por ahora
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      const mockUser = {
        id: '1',
        email: data.email,
        tipo_usuario: data.tipo_usuario,
        nombre: data.nombre,
        apellido: data.apellido
      };

      if (onSuccess) {
        onSuccess(mockUser);
      } else {
        // Redirect to onboarding or verification
        router.push('/verification');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la cuenta';
      
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
      {/* User Type Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          ¿Qué querés hacer en {APP_CONFIG.NAME}?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={`
            relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
            ${selectedUserType === 'explorador' 
              ? 'border-primary-blue bg-primary-blue/5' 
              : 'border-neutral-200 hover:border-neutral-300'
            }
          `}>
            <input
              {...register('tipo_usuario')}
              type="radio"
              value="explorador"
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🔍</span>
                <span className="font-medium text-neutral-900">Soy {BRAND_TERMS.EXPLORADOR}</span>
              </div>
              <p className="text-sm text-neutral-600">
                Busco servicios y profesionales
              </p>
            </div>
          </label>

          <label className={`
            relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
            ${selectedUserType === 'as' 
              ? 'border-primary-blue bg-primary-blue/5' 
              : 'border-neutral-200 hover:border-neutral-300'
            }
          `}>
            <input
              {...register('tipo_usuario')}
              type="radio"
              value="as"
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">⭐</span>
                <span className="font-medium text-neutral-900">Soy {BRAND_TERMS.AS}</span>
              </div>
              <p className="text-sm text-neutral-600">
                Ofrezco servicios profesionales
              </p>
            </div>
          </label>
        </div>
        {errors.tipo_usuario && (
          <p className="mt-1 text-sm text-secondary-red">{errors.tipo_usuario.message}</p>
        )}
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-2">
            Nombre
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              {...register('nombre')}
              type="text"
              id="nombre"
              autoComplete="given-name"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg 
                focus:outline-none focus:ring-2 transition-all
                ${errors.nombre 
                  ? 'border-secondary-red focus:ring-secondary-red/20 focus:border-secondary-red' 
                  : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
                }
              `}
              placeholder="Tu nombre"
            />
          </div>
          {errors.nombre && (
            <p className="mt-1 text-sm text-secondary-red">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-neutral-700 mb-2">
            Apellido
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              {...register('apellido')}
              type="text"
              id="apellido"
              autoComplete="family-name"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg 
                focus:outline-none focus:ring-2 transition-all
                ${errors.apellido 
                  ? 'border-secondary-red focus:ring-secondary-red/20 focus:border-secondary-red' 
                  : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
                }
              `}
              placeholder="Tu apellido"
            />
          </div>
          {errors.apellido && (
            <p className="mt-1 text-sm text-secondary-red">{errors.apellido.message}</p>
          )}
        </div>
      </div>

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

      {/* Phone */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-2">
          Teléfono
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PhoneIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            {...register('telefono')}
            type="tel"
            id="telefono"
            autoComplete="tel"
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all
              ${errors.telefono 
                ? 'border-secondary-red focus:ring-secondary-red/20 focus:border-secondary-red' 
                : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
              }
            `}
            placeholder="+54 11 1234-5678"
          />
        </div>
        {errors.telefono && (
          <p className="mt-1 text-sm text-secondary-red">{errors.telefono.message}</p>
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
            autoComplete="new-password"
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all
              ${errors.password 
                ? 'border-secondary-red focus:ring-secondary-red/20 focus:border-secondary-red' 
                : 'border-neutral-300 focus:ring-primary-blue/20 focus:border-primary-blue'
              }
            `}
            placeholder="Mínimo 6 caracteres"
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

      {/* Terms */}
      <div className="text-sm text-neutral-600">
        Al registrarte, aceptás nuestros{' '}
        <button
          type="button"
          onClick={() => router.push('/terms')}
          className="text-primary-blue hover:text-primary-blue-dark underline"
        >
          Términos de Servicio
        </button>
        {' '}y{' '}
        <button
          type="button"
          onClick={() => router.push('/privacy')}
          className="text-primary-blue hover:text-primary-blue-dark underline"
        >
          Política de Privacidad
        </button>
        .
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
            <span>Creando cuenta...</span>
          </div>
        ) : (
          'Crear Cuenta'
        )}
      </button>
    </motion.form>
  );
}