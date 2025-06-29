import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AdjustmentsHorizontalIcon,
  MapIcon,
  ListBulletIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ServiceCard from '@/components/servicios/ServiceCard';
import Loading, { LoadingList } from '@/components/common/Loading';
import AdvancedFilters from './AdvancedFilters';
import { SearchFilters, SearchResult } from '@/types/search';
import { Servicio } from '@/types';
import { BRAND_TERMS } from '@/utils/constants';

interface SearchResultsProps {
  results: SearchResult | null;
  loading: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onServiceClick: (service: Servicio) => void;
}

const SearchResults = ({ 
  results, 
  loading, 
  filters, 
  onFiltersChange, 
  onServiceClick 
}: SearchResultsProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState(filters.ordenar_por);

  const handleSortChange = (newSort: SearchFilters['ordenar_por']) => {
    setSortBy(newSort);
    onFiltersChange({ ...filters, ordenar_por: newSort });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-6 bg-neutral-200 rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="w-24 h-10 bg-neutral-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
        <LoadingList count={6} />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="font-display text-2xl font-bold text-neutral-900 mb-4">
          Iniciá tu búsqueda
        </h3>
        <p className="text-neutral-600">
          Usá la barra de búsqueda para encontrar {BRAND_TERMS.ASES} increíbles cerca tuyo.
        </p>
      </div>
    );
  }

  const hasActiveFilters = filters.categoria || filters.verificados_solo || 
                          filters.urgentes_solo || filters.con_movilidad ||
                          filters.precio_min > 0 || filters.precio_max < 100000;

  return (
    <div className="space-y-6">
      {/* Header con resultados y controles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
            {results.total > 0 ? (
              <>
                {results.total} {BRAND_TERMS.ASES} encontrados
                {filters.query && (
                  <span className="text-primary-blue"> para "{filters.query}"</span>
                )}
              </>
            ) : (
              <>No encontramos {BRAND_TERMS.ASES} con esos criterios</>
            )}
          </h2>
          
          {results.tiempo_busqueda && (
            <p className="text-sm text-neutral-500 flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>Búsqueda realizada en {results.tiempo_busqueda}ms</span>
            </p>
          )}

          {hasActiveFilters && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm text-neutral-500">Filtros activos:</span>
              <div className="flex flex-wrap gap-1">
                {filters.categoria && (
                  <span className="text-xs bg-primary-blue/10 text-primary-blue px-2 py-1 rounded-full">
                    {filters.categoria}
                  </span>
                )}
                {filters.verificados_solo && (
                  <span className="text-xs bg-secondary-green/10 text-secondary-green px-2 py-1 rounded-full">
                    Verificados
                  </span>
                )}
                {filters.urgentes_solo && (
                  <span className="text-xs bg-secondary-red/10 text-secondary-red px-2 py-1 rounded-full">
                    Urgentes
                  </span>
                )}
                {filters.con_movilidad && (
                  <span className="text-xs bg-secondary-orange/10 text-secondary-orange px-2 py-1 rounded-full">
                    Con movilidad
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-2">
          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SearchFilters['ordenar_por'])}
            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
          >
            <option value="relevancia">Más relevante</option>
            <option value="distancia">Más cerca</option>
            <option value="precio">Menor precio</option>
            <option value="rating">Mejor calificado</option>
            <option value="reciente">Más reciente</option>
          </select>

          {/* Filtros avanzados */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
              ${showAdvancedFilters || hasActiveFilters
                ? 'bg-primary-blue text-white' 
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }
            `}
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-white text-primary-blue text-xs px-1.5 py-0.5 rounded-full">
                •
              </span>
            )}
          </button>

          {/* Vista */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                p-2 rounded transition-colors
                ${viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-primary-blue' 
                  : 'text-neutral-600 hover:text-neutral-800'
                }
              `}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`
                p-2 rounded transition-colors
                ${viewMode === 'map' 
                  ? 'bg-white shadow-sm text-primary-blue' 
                  : 'text-neutral-600 hover:text-neutral-800'
                }
              `}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AdvancedFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClose={() => setShowAdvancedFilters(false)}
          />
        </motion.div>
      )}

      {/* Resultados */}
      {results.total > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.servicios.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ServiceCard
                    service={service}
                    featured={service.destacado}
                    onClick={() => onServiceClick(service)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-200 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">Vista de mapa próximamente</p>
              </div>
            </div>
          )}

          {/* Paginación */}
          {results.total > results.por_pagina && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors">
                  Anterior
                </button>
                <span className="px-4 py-2 text-neutral-600">
                  Página {results.pagina} de {Math.ceil(results.total / results.por_pagina)}
                </span>
                <button className="px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😞</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-neutral-900 mb-4">
            No encontramos {BRAND_TERMS.ASES} con esos filtros
          </h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            Probá ajustando los filtros, expandiendo el área de búsqueda, o usando términos más generales.
          </p>
          
          {/* Sugerencias */}
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium text-neutral-700">Probá con:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Limpieza', 'Plomero', 'Electricista', 'Jardinero'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onFiltersChange({ ...filters, query: suggestion, categoria: '' })}
                  className="px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-full text-sm hover:bg-primary-blue/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => onFiltersChange({
                ...filters,
                categoria: '',
                verificados_solo: false,
                urgentes_solo: false,
                con_movilidad: false,
                precio_min: 0,
                precio_max: 100000,
                radio: 20
              })}
              className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => onFiltersChange({ ...filters, radio: filters.radio * 2 })}
              className="px-6 py-3 border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Expandir búsqueda ({filters.radio * 2} km)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchResults;