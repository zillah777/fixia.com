import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CogIcon, 
  PencilIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  EyeIcon,
  CalendarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import toast from 'react-hot-toast';

// Mock user data basado en estructura real de DB
const mockUser = {
  // Usuario base
  id: '1',
  email: 'juan@example.com',
  tipo_usuario: 'as', // 'as' | 'explorador' | 'ambos'
  estado: 'verificado', // 'pendiente' | 'verificado' | 'suspendido'
  fecha_registro: new Date('2024-01-15'),
  email_verificado: true,
  
  // Perfil As (perfiles_ases table)
  perfil_as: {
    id: 'as1',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    fecha_nacimiento: new Date('1985-03-15'),
    telefono: '+54 9 11 1234-5678',
    foto_perfil: null,
    
    // Documentos de identidad
    foto_dni_frente: null,
    foto_dni_dorso: null,
    foto_servicio_propio: null,
    
    // Ubicación
    direccion: 'Av. Corrientes 1234',
    localidad: 'CABA',
    provincia: 'Buenos Aires',
    codigo_postal: '1234',
    latitud: -34.6037,
    longitud: -58.3816,
    
    // Información adicional
    nivel_educativo: 'terciario', // 'primario' | 'secundario' | 'terciario' | 'universitario' | 'posgrado'
    referencias_laborales: 'Plomero con más de 10 años de experiencia en la zona.',
    tiene_movilidad: true,
    
    // Disponibilidad
    disponibilidad_horaria: {
      lunes: { inicio: '08:00', fin: '18:00' },
      martes: { inicio: '08:00', fin: '18:00' },
      miercoles: { inicio: '08:00', fin: '18:00' },
      jueves: { inicio: '08:00', fin: '18:00' },
      viernes: { inicio: '08:00', fin: '18:00' },
      sabado: { inicio: '09:00', fin: '15:00' },
      domingo: null
    },
    dias_disponibles: [1, 2, 3, 4, 5, 6], // 1=lunes, 7=domingo
    
    // Notificaciones
    radio_notificaciones: 15,
    servicios_notificaciones: [],
    monto_minimo_notificacion: 1000,
    horas_minimas_notificacion: 2,
    
    // Verificación
    identidad_verificada: true,
    profesional_verificado: false,
    fecha_verificacion: new Date('2024-02-01'),
    
    // Suscripción
    suscripcion_activa: true,
    fecha_vencimiento_suscripcion: new Date('2025-01-15'),
    plan_actual: 'profesional' // 'basico' | 'profesional' | 'premium'
  },
  
  servicios: [
    {
      id: '1',
      as_id: 'as1',
      categoria_id: 'cat1',
      titulo: 'Plomería de emergencia 24hs',
      descripcion: 'Reparaciones urgentes de cañerías, pérdidas y destapes. Servicio las 24 horas.',
      tipo_precio: 'por_trabajo', // 'por_hora' | 'por_trabajo' | 'por_semana' | 'por_mes'
      precio_desde: 2500,
      precio_hasta: 8000,
      moneda: 'ARS',
      disponible: true,
      urgente: true,
      requiere_matricula: false,
      activo: true,
      destacado: true,
      categoria: {
        nombre: 'Plomería',
        icono: '🚰',
        color: '#3b82f6'
      },
      tags: ['emergencia', 'plomería', '24hs', 'urgente']
    },
    {
      id: '2',
      as_id: 'as1',
      categoria_id: 'cat1',
      titulo: 'Instalación de sanitarios',
      descripcion: 'Instalación completa de inodoros, bidets y grifería. Incluye mano de obra y sellado.',
      tipo_precio: 'por_trabajo',
      precio_desde: 4500,
      precio_hasta: 12000,
      moneda: 'ARS',
      disponible: true,
      urgente: false,
      requiere_matricula: false,
      activo: true,
      destacado: false,
      categoria: {
        nombre: 'Plomería',
        icono: '🚰',
        color: '#3b82f6'
      },
      tags: ['instalación', 'sanitarios', 'grifería']
    }
  ],
  
  // Estadísticas calculadas
  stats: {
    servicios_publicados: 2,
    total_trabajos: 156,
    rating_promedio: 4.8,
    total_views: 2340,
    clientes_totales: 89
  }
};

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    // Campos editables del perfil
    nombre: user.perfil_as?.nombre || '',
    apellido: user.perfil_as?.apellido || '',
    telefono: user.perfil_as?.telefono || '',
    direccion: user.perfil_as?.direccion || '',
    localidad: user.perfil_as?.localidad || '',
    provincia: user.perfil_as?.provincia || '',
    codigo_postal: user.perfil_as?.codigo_postal || '',
    nivel_educativo: user.perfil_as?.nivel_educativo || '',
    referencias_laborales: user.perfil_as?.referencias_laborales || '',
    tiene_movilidad: user.perfil_as?.tiene_movilidad || false,
    radio_notificaciones: user.perfil_as?.radio_notificaciones || 10,
    monto_minimo_notificacion: user.perfil_as?.monto_minimo_notificacion || 0,
    horas_minimas_notificacion: user.perfil_as?.horas_minimas_notificacion || 1
  });

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Actualizar datos en backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ ...user, ...editData });
      setEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      nombre: user.perfil_as?.nombre || '',
      apellido: user.perfil_as?.apellido || '',
      telefono: user.perfil_as?.telefono || '',
      direccion: user.perfil_as?.direccion || '',
      localidad: user.perfil_as?.localidad || '',
      provincia: user.perfil_as?.provincia || '',
      codigo_postal: user.perfil_as?.codigo_postal || '',
      nivel_educativo: user.perfil_as?.nivel_educativo || '',
      referencias_laborales: user.perfil_as?.referencias_laborales || '',
      tiene_movilidad: user.perfil_as?.tiene_movilidad || false,
      radio_notificaciones: user.perfil_as?.radio_notificaciones || 10,
      monto_minimo_notificacion: user.perfil_as?.monto_minimo_notificacion || 0,
      horas_minimas_notificacion: user.perfil_as?.horas_minimas_notificacion || 1
    });
    setEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  if (loading && !editing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const isAs = user.tipo_usuario === 'as' || user.tipo_usuario === 'ambos';
  const perfil = isAs ? user.perfil_as : null;

  return (
    <>
      <Head>
        <title>Mi Perfil - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Gestiona tu perfil en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-display text-xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  Dashboard
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
                    {perfil?.foto_perfil ? (
                      <img
                        src={perfil.foto_perfil}
                        alt={`${perfil?.nombre} ${perfil?.apellido}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-neutral-400" />
                    )}
                  </div>
                  {perfil?.identidad_verificada && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                      <CheckBadgeIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          name="nombre"
                          value={editData.nombre}
                          onChange={handleChange}
                          className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          placeholder="Nombre"
                        />
                        <input
                          type="text"
                          name="apellido"
                          value={editData.apellido}
                          onChange={handleChange}
                          className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          placeholder="Apellido"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
                        {perfil?.nombre} {perfil?.apellido}
                        {perfil?.identidad_verificada && (
                          <CheckBadgeIcon className="inline-block w-6 h-6 text-primary-blue ml-2" />
                        )}
                      </h1>
                      <div className="flex items-center space-x-4 text-neutral-600">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isAs ? 'bg-secondary-green/10 text-secondary-green' : 'bg-primary-blue/10 text-primary-blue'
                        }`}>
                          {isAs ? BRAND_TERMS.AS : BRAND_TERMS.EXPLORADOR}
                        </span>
                        {isAs && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">{user.stats.rating_promedio}</span>
                            <span className="text-sm">({user.stats.total_trabajos} trabajos)</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>Guardar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Referencias Laborales */}
            <div className="mb-6">
              <h3 className="font-semibold text-neutral-900 mb-2">Referencias Laborales</h3>
              {editing ? (
                <textarea
                  name="referencias_laborales"
                  value={editData.referencias_laborales}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="Describe tu experiencia y especialidades..."
                />
              ) : (
                <p className="text-neutral-700">
                  {perfil?.referencias_laborales || 'No hay referencias disponibles'}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-neutral-600">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-neutral-600">
                  <PhoneIcon className="w-5 h-5" />
                  {editing ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={editData.telefono}
                      onChange={handleChange}
                      className="px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                    />
                  ) : (
                    <span>{perfil?.telefono}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-neutral-600">
                  <MapPinIcon className="w-5 h-5" />
                  {editing ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="direccion"
                        value={editData.direccion}
                        onChange={handleChange}
                        className="px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm"
                        placeholder="Dirección"
                      />
                      <input
                        type="text"
                        name="localidad"
                        value={editData.localidad}
                        onChange={handleChange}
                        className="px-2 py-1 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent text-sm w-24"
                        placeholder="Localidad"
                      />
                    </div>
                  ) : (
                    <span>{perfil?.direccion}, {perfil?.localidad}, {perfil?.provincia}</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-neutral-600">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Miembro desde {user.fecha_registro.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
                </div>
                
                {isAs && perfil && (
                  <>
                    <div className="flex items-center space-x-3 text-neutral-600">
                      <EyeIcon className="w-5 h-5" />
                      <span>{user.stats.total_views} visualizaciones</span>
                    </div>
                    
                    {perfil?.nivel_educativo && (
                      <div className="flex items-center space-x-3 text-neutral-600">
                        <span className="text-sm">🎓</span>
                        <span className="capitalize">{perfil?.nivel_educativo}</span>
                      </div>
                    )}
                    
                    {perfil?.tiene_movilidad && (
                      <div className="flex items-center space-x-3 text-neutral-600">
                        <span className="text-sm">🚙</span>
                        <span>Movilidad propia</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 text-neutral-600">
                      <span className="text-sm">🔔</span>
                      <span>Radio de notificaciones: {perfil?.radio_notificaciones}km</span>
                    </div>
                    
                    {perfil?.suscripcion_activa && (
                      <div className="flex items-center space-x-3 text-neutral-600">
                        <span className="text-sm">💎</span>
                        <span className="capitalize font-medium text-secondary-green">Plan {perfil?.plan_actual}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
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
                  {user.stats.total_views}
                </div>
                <div className="text-sm text-neutral-600">Vistas</div>
              </div>
            </div>
          )}

          {/* Servicios (solo para As) */}
          {isAs && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-neutral-900">
                  Mis Servicios
                </h2>
                <Link
                  href="/services/new"
                  className="px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Nuevo Servicio
                </Link>
              </div>

              <div className="space-y-4">
                {user.servicios.map((servicio) => (
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
                        <div className="flex items-center flex-wrap gap-2 text-sm mb-3">
                          <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded flex items-center space-x-1">
                            <span>{servicio.categoria?.icono}</span>
                            <span>{servicio.categoria?.nombre}</span>
                          </span>
                          
                          <span className="font-semibold text-secondary-green">
                            {servicio.precio_hasta 
                              ? `$${servicio.precio_desde.toLocaleString()} - $${servicio.precio_hasta.toLocaleString()}`
                              : `Desde $${servicio.precio_desde.toLocaleString()}`
                            }
                          </span>
                          
                          <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs capitalize">
                            {servicio.tipo_precio.replace('_', ' ')}
                          </span>
                          
                          {servicio.urgente && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              Urgente
                            </span>
                          )}
                          
                          {servicio.destacado && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              Destacado
                            </span>
                          )}
                          
                          <span className={`px-2 py-1 rounded text-xs ${
                            servicio.activo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {servicio.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        
                        {/* Tags */}
                        {servicio.tags && servicio.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {servicio.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-neutral-50 text-neutral-600 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-neutral-400 hover:text-primary-blue transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {user.servicios.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💼</span>
                    </div>
                    <p className="text-neutral-600 mb-4">
                      Aún no has publicado ningún servicio
                    </p>
                    <Link
                      href="/services/new"
                      className="inline-block px-6 py-3 bg-secondary-green text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Publicar mi primer servicio
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}