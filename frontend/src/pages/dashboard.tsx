import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  CogIcon, 
  PlusIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { authService } from '@/services/api';

// Default user structure
const defaultUserStats = {
  servicios_contratados: 0,
  servicios_publicados: 0,
  rating_promedio: 0,
  total_views: 0
};

// User type definition
interface User {
  id: string;
  email: string;
  tipo_usuario: 'explorador' | 'as';
  nombre?: string;
  apellido?: string;
  stats: typeof defaultUserStats;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación y cargar datos del usuario
    const loadUserData = async () => {
      try {
        // Verificar si hay sesión activa
        if (!authService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        // Obtener datos del usuario del localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Combinar datos del usuario con stats por defecto
          setUser({
            ...currentUser,
            stats: defaultUserStats
          } as User);
        } else {
          // Si no hay datos, redirigir al login
          router.push('/auth/login');
          return;
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá al login)
  if (!user) {
    return null;
  }

  const isAs = user.tipo_usuario === 'as';

  return (
    <>
      <Head>
        <title>Dashboard - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Tu panel de control en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-display text-xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/explore"
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Explorar</span>
                </Link>
                
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Perfil</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="p-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  <CogIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
                  ¡Hola, {user.nombre}! 👋
                </h1>
                <p className="text-xl text-neutral-600">
                  {isAs ? 
                    `Bienvenido a tu panel de ${BRAND_TERMS.AS}` : 
                    `¿Listo para encontrar tu ${BRAND_TERMS.AS} perfecto?`
                  }
                </p>
              </div>
              
              {isAs && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/services/new')}
                  className="flex items-center space-x-2 bg-secondary-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nuevo Servicio</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isAs ? (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-secondary-green/10 rounded-xl flex items-center justify-center">
                      <PlusIcon className="w-6 h-6 text-secondary-green" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    {user.stats.servicios_publicados}
                  </h3>
                  <p className="text-neutral-600">Servicios Publicados</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                      <EyeIcon className="w-6 h-6 text-primary-blue" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    {user.stats.total_views}
                  </h3>
                  <p className="text-neutral-600">Vistas Totales</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    {user.stats.rating_promedio}
                  </h3>
                  <p className="text-neutral-600">Rating Promedio</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    0
                  </h3>
                  <p className="text-neutral-600">Clientes Totales</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                      <MagnifyingGlassIcon className="w-6 h-6 text-primary-blue" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    {user.stats.servicios_contratados}
                  </h3>
                  <p className="text-neutral-600">Servicios Contratados</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-secondary-green/10 rounded-xl flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-secondary-green" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    5
                  </h3>
                  <p className="text-neutral-600">Favoritos</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <StarIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    8
                  </h3>
                  <p className="text-neutral-600">Reseñas Dadas</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                    15
                  </h3>
                  <p className="text-neutral-600">{BRAND_TERMS.ASES} Contactados</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                Acciones Rápidas
              </h2>
              
              <div className="space-y-4">
                <Link
                  href="/explore"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-primary-blue hover:bg-primary-blue/5 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <MagnifyingGlassIcon className="w-6 h-6 text-primary-blue" />
                    <span className="font-semibold text-neutral-900">
                      {isAs ? 'Ver la Competencia' : `Buscar ${BRAND_TERMS.ASES}`}
                    </span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</span>
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-primary-blue hover:bg-primary-blue/5 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-6 h-6 text-primary-blue" />
                    <span className="font-semibold text-neutral-900">Editar Perfil</span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</span>
                </Link>

                {isAs && (
                  <Link
                    href="/services/new"
                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-secondary-green hover:bg-secondary-green/5 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <PlusIcon className="w-6 h-6 text-secondary-green" />
                      <span className="font-semibold text-neutral-900">Agregar Servicio</span>
                    </div>
                    <span className="text-neutral-400 group-hover:text-secondary-green transition-colors">→</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                Actividad Reciente
              </h2>
              
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <p className="text-neutral-600">
                    No hay actividad reciente
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                    {isAs ? 
                      'Comienza publicando tu primer servicio' : 
                      'Comienza explorando servicios disponibles'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}