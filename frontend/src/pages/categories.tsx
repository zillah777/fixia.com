import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { CategoryIcon } from '@/components/common/ModernIcon';

// Categorías completas con datos realistas
const categories = [
  {
    id: '1',
    nombre: 'Limpieza del Hogar',
    icono: '✨',
    color: '#10b981',
    descripcion: 'Servicios de limpieza profunda, mantenimiento regular y organización',
    subcategorias: ['Limpieza general', 'Limpieza profunda', 'Limpieza post-obra', 'Organización'],
    serviciosPopulares: ['Limpieza semanal', 'Limpieza fin de obra', 'Limpieza de vidrios'],
    precioPromedio: '2000-8000',
    asesActivos: 156,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '2',
    nombre: 'Plomería',
    icono: '🚰',
    color: '#3b82f6',
    descripcion: 'Instalación, reparación y mantenimiento de sistemas de agua y gas',
    subcategorias: ['Reparaciones', 'Instalaciones', 'Emergencias', 'Mantenimiento'],
    serviciosPopulares: ['Destapado de cañerías', 'Reparación de canillas', 'Instalación de termotanques'],
    precioPromedio: '1500-12000',
    asesActivos: 89,
    demanda: 'alta',
    tendencia: 'estable'
  },
  {
    id: '3',
    nombre: 'Electricidad',
    icono: '💡',
    color: '#f59e0b',
    descripcion: 'Instalaciones eléctricas, reparaciones y automatización del hogar',
    subcategorias: ['Instalaciones', 'Reparaciones', 'Iluminación', 'Automatización'],
    serviciosPopulares: ['Instalación de enchufes', 'Reparación de cortocircuitos', 'Iluminación LED'],
    precioPromedio: '2000-15000',
    asesActivos: 67,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '4',
    nombre: 'Jardinería y Paisajismo',
    icono: '🌿',
    color: '#22c55e',
    descripcion: 'Mantenimiento de jardines, diseño paisajístico y cuidado de plantas',
    subcategorias: ['Mantenimiento', 'Diseño', 'Poda', 'Plantación'],
    serviciosPopulares: ['Poda de árboles', 'Diseño de jardines', 'Mantenimiento de césped'],
    precioPromedio: '1800-10000',
    asesActivos: 73,
    demanda: 'media',
    tendencia: 'estable'
  },
  {
    id: '5',
    nombre: 'Pintura y Decoración',
    icono: '🎨',
    color: '#8b5cf6',
    descripcion: 'Pintura interior y exterior, decoración y acabados especiales',
    subcategorias: ['Pintura interior', 'Pintura exterior', 'Decoración', 'Acabados'],
    serviciosPopulares: ['Pintura de ambientes', 'Pintura de fachadas', 'Técnicas decorativas'],
    precioPromedio: '3000-20000',
    asesActivos: 94,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '6',
    nombre: 'Carpintería',
    icono: '🔨',
    color: '#a3a3a3',
    descripcion: 'Muebles a medida, reparaciones y trabajos en madera',
    subcategorias: ['Muebles a medida', 'Reparaciones', 'Instalaciones', 'Restauración'],
    serviciosPopulares: ['Muebles de cocina', 'Reparación de puertas', 'Estanterías'],
    precioPromedio: '4000-25000',
    asesActivos: 52,
    demanda: 'media',
    tendencia: 'estable'
  },
  {
    id: '7',
    nombre: 'Albañilería',
    icono: '🏗️',
    color: '#dc2626',
    descripcion: 'Construcción, reformas y trabajos de mampostería',
    subcategorias: ['Reformas', 'Construcción', 'Reparaciones', 'Acabados'],
    serviciosPopulares: ['Reforma de baños', 'Construcción de muros', 'Reparación de techos'],
    precioPromedio: '5000-50000',
    asesActivos: 78,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '8',
    nombre: 'Programación y Desarrollo',
    icono: '👨‍💻',
    color: '#06b6d4',
    descripcion: 'Desarrollo web, aplicaciones móviles y soluciones tecnológicas',
    subcategorias: ['Desarrollo web', 'Apps móviles', 'E-commerce', 'Automatización'],
    serviciosPopulares: ['Páginas web', 'Tiendas online', 'Apps móviles'],
    precioPromedio: '8000-80000',
    asesActivos: 134,
    demanda: 'muy alta',
    tendencia: 'creciente'
  },
  {
    id: '9',
    nombre: 'Cuidado de Niños',
    icono: '👶',
    color: '#f97316',
    descripcion: 'Niñeras, cuidado temporal y actividades para niños',
    subcategorias: ['Niñeras', 'Cuidado ocasional', 'Actividades', 'Apoyo escolar'],
    serviciosPopulares: ['Niñera por horas', 'Cuidado nocturno', 'Apoyo escolar'],
    precioPromedio: '1000-3000',
    asesActivos: 187,
    demanda: 'alta',
    tendencia: 'estable'
  },
  {
    id: '10',
    nombre: 'Belleza y Estética',
    icono: '💅',
    color: '#ec4899',
    descripcion: 'Servicios de belleza, estética y cuidado personal',
    subcategorias: ['Manicura', 'Pedicura', 'Maquillaje', 'Tratamientos'],
    serviciosPopulares: ['Manicura y pedicura', 'Maquillaje para eventos', 'Tratamientos faciales'],
    precioPromedio: '1500-8000',
    asesActivos: 142,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '11',
    nombre: 'Masajes y Bienestar',
    icono: '💆‍♀️',
    color: '#a855f7',
    descripcion: 'Masajes terapéuticos, relajantes y tratamientos de bienestar',
    subcategorias: ['Masajes relajantes', 'Masajes terapéuticos', 'Reflexología', 'Reiki'],
    serviciosPopulares: ['Masajes a domicilio', 'Masajes terapéuticos', 'Tratamientos anti-estrés'],
    precioPromedio: '2500-6000',
    asesActivos: 89,
    demanda: 'media',
    tendencia: 'creciente'
  },
  {
    id: '12',
    nombre: 'Fitness y Entrenamiento',
    icono: '💪',
    color: '#ef4444',
    descripcion: 'Entrenamiento personal, clases grupales y asesoramiento nutricional',
    subcategorias: ['Entrenamiento personal', 'Clases grupales', 'Nutrición', 'Yoga'],
    serviciosPopulares: ['Entrenador personal', 'Clases de yoga', 'Planes nutricionales'],
    precioPromedio: '2000-8000',
    asesActivos: 97,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '13',
    nombre: 'Gastronomía y Catering',
    icono: '👨‍🍳',
    color: '#f59e0b',
    descripcion: 'Catering, chef a domicilio y servicios gastronómicos',
    subcategorias: ['Chef a domicilio', 'Catering eventos', 'Repostería', 'Comida saludable'],
    serviciosPopulares: ['Chef para eventos', 'Catering empresarial', 'Tortas personalizadas'],
    precioPromedio: '5000-30000',
    asesActivos: 64,
    demanda: 'media',
    tendencia: 'estable'
  },
  {
    id: '14',
    nombre: 'Delivery y Transporte',
    icono: '🛵',
    color: '#06b6d4',
    descripcion: 'Envíos, mudanzas y servicios de transporte',
    subcategorias: ['Delivery', 'Mudanzas', 'Transporte', 'Mensajería'],
    serviciosPopulares: ['Delivery express', 'Mini mudanzas', 'Transporte de muebles'],
    precioPromedio: '800-5000',
    asesActivos: 203,
    demanda: 'muy alta',
    tendencia: 'creciente'
  },
  {
    id: '15',
    nombre: 'Mudanzas y Fletes',
    icono: '📦',
    color: '#6b7280',
    descripcion: 'Mudanzas completas, mini mudanzas y transporte de mercaderías',
    subcategorias: ['Mudanzas completas', 'Mini mudanzas', 'Embalaje', 'Almacenamiento'],
    serviciosPopulares: ['Mudanzas locales', 'Mudanzas nacionales', 'Guardamuebles'],
    precioPromedio: '8000-40000',
    asesActivos: 45,
    demanda: 'media',
    tendencia: 'estable'
  },
  {
    id: '16',
    nombre: 'Mecánica y Automotor',
    icono: '🔧',
    color: '#374151',
    descripcion: 'Reparación y mantenimiento de vehículos',
    subcategorias: ['Mecánica general', 'Chapa y pintura', 'Gomería', 'Lavado'],
    serviciosPopulares: ['Service general', 'Reparaciones urgentes', 'Lavado detallado'],
    precioPromedio: '3000-25000',
    asesActivos: 71,
    demanda: 'alta',
    tendencia: 'estable'
  },
  {
    id: '17',
    nombre: 'Veterinaria',
    icono: '🐕',
    color: '#059669',
    descripcion: 'Atención veterinaria, grooming y cuidado de mascotas',
    subcategorias: ['Consultas', 'Vacunación', 'Grooming', 'Cuidado'],
    serviciosPopulares: ['Consultas a domicilio', 'Vacunación', 'Baño y corte'],
    precioPromedio: '2000-8000',
    asesActivos: 38,
    demanda: 'media',
    tendencia: 'creciente'
  },
  {
    id: '18',
    nombre: 'Música y Arte',
    icono: '🎵',
    color: '#7c3aed',
    descripcion: 'Clases de música, arte y entretenimiento para eventos',
    subcategorias: ['Clases de música', 'Arte y pintura', 'Entretenimiento', 'Producciones'],
    serviciosPopulares: ['Clases de guitarra', 'Música para eventos', 'Clases de arte'],
    precioPromedio: '1500-10000',
    asesActivos: 56,
    demanda: 'media',
    tendencia: 'estable'
  },
  {
    id: '19',
    nombre: 'Fotografía y Video',
    icono: '📸',
    color: '#be185d',
    descripcion: 'Fotografía profesional, video y producción audiovisual',
    subcategorias: ['Fotografía eventos', 'Retratos', 'Video', 'Edición'],
    serviciosPopulares: ['Fotografía de bodas', 'Sesiones familiares', 'Videos corporativos'],
    precioPromedio: '5000-50000',
    asesActivos: 87,
    demanda: 'alta',
    tendencia: 'creciente'
  },
  {
    id: '20',
    nombre: 'Seguridad',
    icono: '🛡️',
    color: '#1f2937',
    descripcion: 'Servicios de seguridad, vigilancia y sistemas de protección',
    subcategorias: ['Vigilancia', 'Alarmas', 'Portería', 'Custodia'],
    serviciosPopulares: ['Seguridad para eventos', 'Instalación de alarmas', 'Portería'],
    precioPromedio: '3000-15000',
    asesActivos: 34,
    demanda: 'media',
    tendencia: 'estable'
  }
];

const demandaColors = {
  'muy alta': 'bg-red-100 text-red-800',
  'alta': 'bg-green-100 text-green-800',
  'media': 'bg-yellow-100 text-yellow-800',
  'baja': 'bg-green-100 text-green-800'
};

const tendenciaIcons = {
  'creciente': '📈',
  'estable': '➡️',
  'decreciente': '📉'
};

export default function Categories() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<string>('');
  const [sortBy, setSortBy] = useState<'nombre' | 'demanda' | 'ases'>('nombre');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = categories
    .filter(category => 
      category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategorias.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(category => 
      selectedDemand === '' || category.demanda === selectedDemand
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'demanda':
          const demandaOrder = { 'muy alta': 4, 'alta': 3, 'media': 2, 'baja': 1 };
          return demandaOrder[b.demanda as keyof typeof demandaOrder] - demandaOrder[a.demanda as keyof typeof demandaOrder];
        case 'ases':
          return b.asesActivos - a.asesActivos;
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/explore?categoria=${categoryId}`);
  };

  const totalAses = categories.reduce((sum, cat) => sum + cat.asesActivos, 0);
  const avgPrice = categories.reduce((sum, cat) => {
    const prices = cat.precioPromedio.split('-').map(p => parseInt(p));
    return sum + (prices[0] + prices[1]) / 2;
  }, 0) / categories.length;

  return (
    <>
      <Head>
        <title>Categorías de Servicios - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Explora todas las categorías de servicios disponibles en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-display text-2xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/explore" className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  Explorar
                </Link>
                <Link href="/pricing" className="px-4 py-2 text-neutral-600 hover:text-purple-600 transition-colors">
                  Planes
                </Link>
                <Link href="/auth/login" className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="px-6 py-2 bg-primary-blue text-white rounded-full hover:bg-primary-blue-dark transition-colors">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Todas las Categorías 📂
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Descubre la amplia variedad de servicios disponibles en {APP_CONFIG.NAME}. 
              Desde el hogar hasta lo profesional, tenemos todo cubierto.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-primary-blue">{categories.length}</div>
                <div className="text-sm text-neutral-600">Categorías disponibles</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-secondary-green">{totalAses.toLocaleString()}</div>
                <div className="text-sm text-neutral-600">{BRAND_TERMS.ASES} activos</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-secondary-green">${Math.round(avgPrice).toLocaleString()}</div>
                <div className="text-sm text-neutral-600">Precio promedio</div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={selectedDemand}
                  onChange={(e) => setSelectedDemand(e.target.value)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Toda demanda</option>
                  <option value="muy alta">Muy alta</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'nombre' | 'demanda' | 'ases')}
                  className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="nombre">Ordenar por nombre</option>
                  <option value="demanda">Ordenar por demanda</option>
                  <option value="ases">Ordenar por Ases activos</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => handleCategoryClick(category.id)}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <CategoryIcon
                    emoji={category.icono}
                    color={category.color}
                    size="lg"
                  />
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${demandaColors[category.demanda as keyof typeof demandaColors]}`}>
                      {category.demanda}
                    </span>
                    <span className="text-lg">
                      {tendenciaIcons[category.tendencia as keyof typeof tendenciaIcons]}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-blue transition-colors">
                  {category.nombre}
                </h3>
                
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {category.descripcion}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm text-neutral-500">
                      <UsersIcon className="w-4 h-4" />
                      <span>{category.asesActivos} {BRAND_TERMS.ASES}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-neutral-500">
                      ${category.precioPromedio.replace('-', ' - ')}
                    </div>
                  </div>
                </div>

                {/* Popular Services */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Servicios populares:</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.serviciosPopulares.slice(0, 3).map((servicio, idx) => (
                      <span key={idx} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                        {servicio}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    {category.subcategorias.length} subcategorías
                  </div>
                  <div className="flex items-center space-x-1 text-primary-blue group-hover:text-primary-blue-dark">
                    <span className="text-sm font-medium">Ver servicios</span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                No encontramos categorías
              </h3>
              <p className="text-neutral-600 mb-6">
                Intentá con otros términos de búsqueda o ajustá los filtros
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDemand('');
                }}
                className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
              >
                Limpiar filtros
              </button>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gradient-to-r from-primary-blue to-primary-blue-dark rounded-2xl p-12 text-white mt-16"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              ¿No encontrás lo que buscás? 🤔
            </h2>
            <p className="text-primary-blue-light mb-8 max-w-2xl mx-auto">
              Nuestra plataforma está en constante crecimiento. Si necesitás un servicio específico, 
              ¡contactanos y lo agregaremos!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-white text-primary-blue rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Sugerir Categoría
              </Link>
              <Link
                href="/auth/register?tipo=as"
                className="px-8 py-4 bg-secondary-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Convertirse en As
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white px-4 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-neutral-500 text-sm">
              © 2024 {APP_CONFIG.NAME} - Mmata. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}