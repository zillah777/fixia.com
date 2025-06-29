import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/utils/constants';
import toast from 'react-hot-toast';
import { authService, LoginData } from '@/services/api';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para el backend
      const loginData: LoginData = {
        email: formData.email,
        password: formData.password
      };

      // Llamar al servicio de login
      const response = await authService.login(loginData);
      
      if (response.success && response.data) {
        // Redirigir según el tipo de usuario
        const userType = response.data.user.tipo_usuario;
        if (userType === 'as') {
          router.push('/dashboard/as');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      // Los errores ya se muestran en el servicio authService
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Inicia sesión en tu cuenta de Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-display text-2xl font-bold text-neutral-900">
                {APP_CONFIG.NAME}
              </span>
            </Link>
            
            <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="text-neutral-600">
              Inicia sesión para continuar con tu cuenta
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-primary-blue focus:ring-primary-blue"
                  />
                  <span className="ml-2 text-sm text-neutral-600">Recordarme</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-blue hover:text-primary-blue-dark transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary-blue hover:text-primary-blue-dark font-semibold transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500">
              Al continuar, aceptas nuestros{' '}
              <Link href="/terms" className="text-primary-blue hover:underline">
                Términos de Uso
              </Link>{' '}
              y{' '}
              <Link href="/privacy" className="text-primary-blue hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}