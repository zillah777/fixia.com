import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  EyeIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ChatBubbleLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import toast from 'react-hot-toast';

// Mock user data - basado en estructura real de DB
const mockUsers: { [key: string]: any } = {
  '1': {
    // Usuario base
    id: '1',
    email: 'maria@example.com',
    tipo_usuario: 'as',
    estado: 'verificado',
    fecha_registro: new Date('2023-05-10'),
    email_verificado: true,
    
    // Perfil As
    perfil_as: {
      id: 'as1',
      nombre: 'María',
      apellido: 'González',
      dni: '87654321',
      fecha_nacimiento: new Date('1988-07-15'),
      telefono: '+54 9 11 9876-5432',
      foto_perfil: null,
      
      // Ubicación
      direccion: 'Av. Santa Fe 2000',
      localidad: 'CABA',
      provincia: 'Buenos Aires',
      codigo_postal: '1123',
      
      // Información adicional
      nivel_educativo: 'secundario',
      referencias_laborales: 'Especialista en limpieza profunda con más de 8 años de experiencia. Trabajo con productos ecológicos y me enfoco en la satisfacción del cliente.',
      tiene_movilidad: false,
      
      // Verificación
      identidad_verificada: true,
      profesional_verificado: false,
      
      // Suscripción
      suscripcion_activa: true,
      plan_actual: 'profesional'
    },
    
    // Estadísticas
    stats: {
      servicios_publicados: 5,
      total_trabajos: 243,
      rating_promedio: 4.9,
      total_views: 3420,
      clientes_totales: 156
    },
    servicios: [
      {
        id: '1',
        titulo: 'Limpieza profunda de hogar',
        descripcion: 'Limpieza completa de todos los ambientes con productos ecológicos',
        precio_desde: 8500,
        categoria: 'Limpieza',
        activo: true,
        rating: 4.9,
        total_contrataciones: 89
      },
      {
        id: '2',
        titulo: 'Limpieza post-construcción',
        descripcion: 'Limpieza especializada después de obras y remodelaciones',
        precio_desde: 12000,
        categoria: 'Limpieza',
        activo: true,
        rating: 4.8,
        total_contrataciones: 45
      }
    ],
    reseñas: [
      {
        id: '1',
        explorador: 'Ana Martínez',
        rating: 5,
        comentario: 'Excelente trabajo! Muy detallista y puntual. Super recomendable.',
        fecha: new Date('2024-12-15'),
        servicio: 'Limpieza profunda de hogar'
      },
      {
        id: '2',
        explorador: 'Carlos López',
        rating: 5,
        comentario: 'Dejó la casa impecable. Muy profesional y usa productos de buena calidad.',
        fecha: new Date('2024-12-10'),
        servicio: 'Limpieza profunda de hogar'
      }
    ]
  },
  '2': {
    id: '2',
    nombre: 'Roberto',
    apellido: 'Silva',
    email: 'roberto@example.com',
    telefono: '+54 9 11 5555-4444',
    tipo: 'explorador',
    foto_perfil: null,
    bio: 'Siempre busco los mejores servicios para mi hogar. Me gusta apoyar a profesionales locales.',
    direccion: 'Av. Corrientes 3000',
    localidad: 'CABA',
    provincia: 'Buenos Aires',
    fecha_registro: new Date('2024-02-20'),
    verificado: true,
    activo: true,
    stats: {
      servicios_contratados: 28,
      reseñas_dadas: 24,
      ases_contactados: 45
    }
  }
};

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      // Simular carga de datos del backend
      setTimeout(() => {
        const userData = mockUsers[id as string];
        if (userData) {
          setUser(userData);
        }
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleContact = () => {
    if (user?.telefono) {
      const whatsappUrl = `${APP_CONFIG.WHATSAPP_BASE}${user.telefono.replace(/\D/g, '')}?text=Hola! Te contacto desde ${APP_CONFIG.NAME}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Usuario no encontrado</h1>
          <p className="text-neutral-600 mb-6">El perfil que buscas no existe o ha sido eliminado.</p>
          <Link
            href="/explore"
            className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
          >
            Volver a explorar
          </Link>
        </div>
      </div>
    );
  }

  const isAs = user.tipo === 'as';

  return (
    <>
      <Head>
        <title>{user.nombre} {user.apellido} - {APP_CONFIG.NAME}</title>
        <meta name="description" content={user.bio || `Perfil de ${user.nombre} ${user.apellido} en ${APP_CONFIG.NAME}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-display text-xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/explore"
                  className="px-3 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  Explorar
                </Link>
                
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.foto_perfil ? (
                      <img
                        src={user.foto_perfil}
                        alt={`${user.nombre} ${user.apellido}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-neutral-400" />
                    )}
                  </div>
                  {user.verificado && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                      <CheckBadgeIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
                    {user.nombre} {user.apellido}
                    {user.verificado && (
                      <CheckBadgeIcon className="inline-block w-6 h-6 text-primary-blue ml-2" />
                    )}
                  </h1>
                  <div className="flex items-center space-x-4 text-neutral-600 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAs ? 'bg-secondary-green/10 text-secondary-green' : 'bg-primary-blue/10 text-primary-blue'
                    }`}>
                      {isAs ? BRAND_TERMS.AS : BRAND_TERMS.EXPLORADOR}
                    </span>
                    {isAs && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{user.rating}</span>
                        <span className="text-sm">({user.total_trabajos} trabajos)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-neutral-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{user.localidad}, {user.provincia}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-neutral-400" />
                  )}
                </button>
                
                {isAs && (
                  <button
                    onClick={handleContact}
                    className="flex items-center space-x-2 px-6 py-3 bg-secondary-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span>Contactar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-6">
                <h3 className="font-semibold text-neutral-900 mb-2">Acerca de {user.nombre}</h3>
                <p className="text-neutral-700">{user.bio}</p>
              </div>
            )}

            {/* Info adicional */}
            <div className="flex items-center space-x-6 text-neutral-600 text-sm">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Miembro desde {user.fecha_registro.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
              </div>
              {isAs && (
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-4 h-4" />
                  <span>{user.stats.total_views} visualizaciones</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats para As */}
          {isAs && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.stats.servicios_publicados}
                </div>
                <div className="text-sm text-neutral-600">Servicios</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.stats.clientes_totales}
                </div>
                <div className="text-sm text-neutral-600">Clientes</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.stats.rating_promedio}
                </div>
                <div className="text-sm text-neutral-600">Rating</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.total_trabajos}
                </div>
                <div className="text-sm text-neutral-600">Trabajos</div>
              </div>
            </div>
          )}

          {/* Servicios (solo para As) */}
          {isAs && user.servicios && user.servicios.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                Servicios de {user.nombre}
              </h2>

              <div className="space-y-4">
                {user.servicios.map((servicio: any) => (
                  <div
                    key={servicio.id}
                    className="border border-neutral-200 rounded-xl p-6 hover:border-primary-blue transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-2">
                          {servicio.titulo}
                        </h3>
                        <p className="text-neutral-600 mb-3">
                          {servicio.descripcion}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded">
                            {servicio.categoria}
                          </span>
                          <span className="font-semibold text-secondary-green">
                            Desde ${servicio.precio_desde.toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span>{servicio.rating}</span>
                            <span className="text-neutral-500">({servicio.total_contrataciones})</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleContact}
                        className="ml-4 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
                      >
                        Contratar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reseñas (solo para As) */}
          {isAs && user.reseñas && user.reseñas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                Reseñas ({user.reseñas.length})
              </h2>

              <div className="space-y-6">
                {user.reseñas.map((reseña: any) => (
                  <div key={reseña.id} className="border-b border-neutral-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900">{reseña.explorador}</h4>
                        <p className="text-sm text-neutral-600">{reseña.servicio}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < reseña.rating ? 'text-yellow-500 fill-current' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500">
                          {reseña.fecha.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-neutral-700">{reseña.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats para Exploradores */}
          {!isAs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.stats.servicios_contratados}
                </div>
                <div className="text-sm text-neutral-600">Servicios Contratados</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.stats.reseñas_dadas}
                </div>
                <div className="text-sm text-neutral-600">Reseñas Dadas</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {user.stats.ases_contactados}
                </div>
                <div className="text-sm text-neutral-600">{BRAND_TERMS.ASES} Contactados</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}