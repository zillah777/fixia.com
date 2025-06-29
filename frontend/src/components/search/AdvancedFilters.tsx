import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  XMarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckBadgeIcon,
  TruckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { SearchFilters } from '@/types/search';
import { BRAND_TERMS } from '@/utils/constants';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose?: () => void;
  className?: string;
}

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onClose,
  className = '' 
}: AdvancedFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose?.();
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      query: localFilters.query, // Mantener el query
      categoria: '',
      ubicacion: null,
      radio: 10,
      precio_min: 0,
      precio_max: 100000,
      disponible_ahora: false,
      verificados_solo: false,
      urgentes_solo: false,
      con_movilidad: false,
      tags: [],
      ordenar_por: 'relevancia'
    };
    setLocalFilters(defaultFilters);
  };

  const categories = [
    { id: 'limpieza', nombre: 'Limpieza', icono: '🧹' },
    { id: 'plomeria', nombre: 'Plomería', icono: '🔧' },
    { id: 'electricidad', nombre: 'Electricidad', icono: '⚡' },
    { id: 'jardineria', nombre: 'Jardinería', icono: '🌱' },
    { id: 'pintura', nombre: 'Pintura', icono: '🎨' },
    { id: 'carpinteria', nombre: 'Carpintería', icono: '🪚' },
    { id: 'albañileria', nombre: 'Albañilería', icono: '🧱' },
    { id: 'tecnologia', nombre: 'Tecnología', icono: '💻' },
    { id: 'cuidado_personal', nombre: 'Cuidado Personal', icono: '💅' },
    { id: 'mascotas', nombre: 'Mascotas', icono: '🐕' },
    { id: 'transporte', nombre: 'Transporte', icono: '🚚' },
    { id: 'educacion', nombre: 'Educación', icono: '📚' },
    { id: 'eventos', nombre: 'Eventos', icono: '🎉' }
  ];

  const sortOptions = [
    { value: 'relevancia', label: 'Más relevante', icono: '🎯' },
    { value: 'distancia', label: 'Más cerca', icono: '📍' },
    { value: 'precio', label: 'Menor precio', icono: '💰' },
    { value: 'rating', label: 'Mejor calificado', icono: '⭐' },
    { value: 'reciente', label: 'Más reciente', icono: '🕐' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white rounded-2xl border border-neutral-200 shadow-lg p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-primary-blue" />
          <h3 className="font-display text-lg font-semibold text-neutral-900">
            Filtros Avanzados
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categorías */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Categoría
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange('categoria', 
                  localFilters.categoria === category.id ? '' : category.id
                )}
                className={`
                  p-3 rounded-lg border transition-all text-left
                  flex items-center space-x-2 text-sm
                  ${localFilters.categoria === category.id
                    ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }
                `}
              >
                <span>{category.icono}</span>
                <span className="truncate">{category.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3 flex items-center space-x-2">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>Rango de precios</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Mínimo</label>
              <input
                type="number"
                value={localFilters.precio_min}
                onChange={(e) => handleFilterChange('precio_min', parseInt(e.target.value) || 0)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Máximo</label>
              <input
                type="number"
                value={localFilters.precio_max === 100000 ? '' : localFilters.precio_max}
                onChange={(e) => handleFilterChange('precio_max', parseInt(e.target.value) || 100000)}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Distancia */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3 flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4" />
            <span>Distancia máxima</span>
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="50"
              value={localFilters.radio}
              onChange={(e) => handleFilterChange('radio', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-neutral-500">
              <span>1 km</span>
              <span className="font-medium text-primary-blue">
                {localFilters.radio} km
              </span>
              <span>50 km</span>
            </div>
          </div>
        </div>

        {/* Opciones especiales */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Opciones especiales
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.disponible_ahora}
                onChange={(e) => handleFilterChange('disponible_ahora', e.target.checked)}
                className="w-4 h-4 text-primary-blue border-neutral-300 rounded focus:ring-primary-blue"
              />
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-secondary-orange" />
                <span className="text-sm text-neutral-700">Disponible ahora</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.verificados_solo}
                onChange={(e) => handleFilterChange('verificados_solo', e.target.checked)}
                className="w-4 h-4 text-primary-blue border-neutral-300 rounded focus:ring-primary-blue"
              />
              <div className="flex items-center space-x-2">
                <CheckBadgeIcon className="w-4 h-4 text-secondary-green" />
                <span className="text-sm text-neutral-700">Solo {BRAND_TERMS.ASES} verificados</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.urgentes_solo}
                onChange={(e) => handleFilterChange('urgentes_solo', e.target.checked)}
                className="w-4 h-4 text-primary-blue border-neutral-300 rounded focus:ring-primary-blue"
              />
              <div className="flex items-center space-x-2">
                <span className="text-secondary-red">🚨</span>
                <span className="text-sm text-neutral-700">Solo servicios urgentes</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.con_movilidad}
                onChange={(e) => handleFilterChange('con_movilidad', e.target.checked)}
                className="w-4 h-4 text-primary-blue border-neutral-300 rounded focus:ring-primary-blue"
              />
              <div className="flex items-center space-x-2">
                <TruckIcon className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">Con movilidad propia</span>
              </div>
            </label>
          </div>
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Ordenar por
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange('ordenar_por', option.value)}
                className={`
                  p-3 rounded-lg border transition-all text-left
                  flex items-center space-x-2 text-sm
                  ${localFilters.ordenar_por === option.value
                    ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }
                `}
              >
                <span>{option.icono}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200">
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          Limpiar filtros
        </button>
        
        <div className="flex items-center space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedFilters;