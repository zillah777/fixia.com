import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/common/Layout';
import SearchBar from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';
import { Servicio, Categoria } from '@/types';
import { SearchFilters, SearchResult } from '@/types/search';
import { defaultFilters, calculateRelevance } from '@/utils/searchHelpers';
import { BRAND_TERMS } from '@/utils/constants';

// Mock data para desarrollo
const mockServices: Servicio[] = [
  {
    id: '1',
    as_id: '1',
    categoria_id: '1',
    titulo: 'Limpieza profunda de hogar',
    descripcion: 'Servicio completo de limpieza para tu hogar. Incluye todos los ambientes, desinfección y productos ecológicos.',
    tipo_precio: 'por_trabajo',
    precio_desde: 8500,
    precio_hasta: 15000,
    moneda: 'ARS',
    disponible: true,
    urgente: false,
    requiere_matricula: false,
    activo: true,
    destacado: true,
    created_at: new Date(),
    updated_at: new Date(),
    as: {
      id: '1',
      usuario_id: '1',
      nombre: 'María',
      apellido: 'González',
      dni: '12345678',
      fecha_nacimiento: new Date('1985-03-15'),
      telefono: '+5491234567890',
      foto_perfil: '/images/avatars/maria.jpg',
      direccion: 'Av. Corrientes 1234',
      localidad: 'CABA',
      provincia: 'Buenos Aires',
      tiene_movilidad: true,
      radio_notificaciones: 15,
      identidad_verificada: true,
      profesional_verificado: false,
      suscripcion_activa: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    categoria: {
      id: '1',
      nombre: 'Limpieza',
      icono: '🧹',
      color: '#10b981',
      activa: true,
      orden: 1
    },
    tags: [
      { id: '1', nombre: 'Limpieza profunda', uso_count: 150, sugerido: true },
      { id: '2', nombre: 'Productos ecológicos', uso_count: 89, sugerido: true },
      { id: '3', nombre: 'Hogar completo', uso_count: 200, sugerido: true }
    ],
    rating: 4.8,
    distancia: 2.5
  },
  // Agregar más servicios mock...
];

const mockCategories: Categoria[] = [
  { id: '1', nombre: 'Limpieza', icono: '✨', color: '#10b981', activa: true, orden: 1 },
  { id: '2', nombre: 'Plomería', icono: '🚰', color: '#3b82f6', activa: true, orden: 2 },
  { id: '3', nombre: 'Electricidad', icono: '💡', color: '#f59e0b', activa: true, orden: 3 },
  { id: '4', nombre: 'Jardinería', icono: '🌿', color: '#22c55e', activa: true, orden: 4 },
];

export default function ExplorePage() {
  const [allServices, setAllServices] = useState<Servicio[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  useEffect(() => {
    // Cargar servicios iniciales
    setAllServices(mockServices);
  }, []);

  const performSearch = (searchFilters: SearchFilters) => {
    setLoading(true);
    setFilters(searchFilters);

    // Simular búsqueda con delay
    setTimeout(() => {
      const startTime = Date.now();
      
      let filteredServices = [...allServices];

      // Filtrar por query
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        filteredServices = filteredServices.filter(service => 
          service.titulo.toLowerCase().includes(query) ||
          service.descripcion.toLowerCase().includes(query) ||
          service.as?.nombre.toLowerCase().includes(query) ||
          service.categoria?.nombre.toLowerCase().includes(query) ||
          service.tags?.some(tag => tag.nombre.toLowerCase().includes(query))
        );
      }

      // Filtrar por categoría
      if (searchFilters.categoria) {
        filteredServices = filteredServices.filter(service => 
          service.categoria?.nombre.toLowerCase() === searchFilters.categoria.toLowerCase()
        );
      }

      // Filtrar por verificación
      if (searchFilters.verificados_solo) {
        filteredServices = filteredServices.filter(service => 
          service.as?.identidad_verificada
        );
      }

      // Filtrar por urgencia
      if (searchFilters.urgentes_solo) {
        filteredServices = filteredServices.filter(service => service.urgente);
      }

      // Filtrar por movilidad
      if (searchFilters.con_movilidad) {
        filteredServices = filteredServices.filter(service => 
          service.as?.tiene_movilidad
        );
      }

      // Filtrar por precio
      filteredServices = filteredServices.filter(service => 
        service.precio_desde >= searchFilters.precio_min &&
        service.precio_desde <= searchFilters.precio_max
      );

      // Filtrar por distancia
      if (searchFilters.ubicacion) {
        filteredServices = filteredServices.filter(service => 
          !service.distancia || service.distancia <= searchFilters.radio
        );
      }

      // Ordenar resultados
      if (searchFilters.ordenar_por === 'relevancia') {
        filteredServices.sort((a, b) => 
          calculateRelevance(b, searchFilters) - calculateRelevance(a, searchFilters)
        );
      } else if (searchFilters.ordenar_por === 'distancia') {
        filteredServices.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
      } else if (searchFilters.ordenar_por === 'precio') {
        filteredServices.sort((a, b) => a.precio_desde - b.precio_desde);
      } else if (searchFilters.ordenar_por === 'rating') {
        filteredServices.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (searchFilters.ordenar_por === 'reciente') {
        filteredServices.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      }

      const endTime = Date.now();

      setSearchResults({
        servicios: filteredServices,
        total: filteredServices.length,
        pagina: 1,
        por_pagina: 20,
        filtros_aplicados: searchFilters,
        tiempo_busqueda: endTime - startTime
      });
      
      setLoading(false);
    }, 800);
  };

  const handleServiceClick = (service: Servicio) => {
    // Navegar al detalle del servicio
    console.log('Clicked service:', service.id);
    // router.push(`/services/${service.id}`);
  };

  return (
    <Layout 
      title="Explorar Servicios" 
      description={`Descubrí los mejores ${BRAND_TERMS.ASES} cerca tuyo`}
      showSearch={false}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-4xl font-bold text-neutral-900 mb-2">
              Explorá {BRAND_TERMS.ASES} Increíbles
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              {BRAND_TERMS.EXPLORERS_FIND} 🔍✨
            </p>

            {/* Search Bar Principal */}
            <SearchBar 
              onSearch={performSearch}
              placeholder={`Buscá ${BRAND_TERMS.ASES} increíbles... ej: 'plomero urgente', 'limpieza profunda'`}
              size="lg"
            />
          </motion.div>
        </div>

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          loading={loading}
          filters={filters}
          onFiltersChange={performSearch}
          onServiceClick={handleServiceClick}
        />
      </div>
    </Layout>
  );
}