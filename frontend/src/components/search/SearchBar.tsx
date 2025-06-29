import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ClockIcon,
  FireIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline';
import { SearchFilters, SearchSuggestion } from '@/types/search';
import { 
  quickFilters, 
  defaultFilters, 
  parseNaturalQuery, 
  generateSuggestions,
  getSearchHistory,
  saveSearchToHistory 
} from '@/utils/searchHelpers';
import { BRAND_TERMS } from '@/utils/constants';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  placeholder?: string;
  showQuickFilters?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SearchBar = ({ 
  onSearch, 
  initialFilters = {}, 
  placeholder = "¿Qué servicio necesitás? ej: 'plomero urgente', 'niñera esta noche'",
  showQuickFilters = true,
  size = 'lg'
}: SearchBarProps) => {
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters, ...initialFilters });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tamaños responsivos
  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg'
  };

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generar sugerencias cuando cambia el query
  useEffect(() => {
    if (filters.query.length >= 2) {
      const newSuggestions = generateSuggestions(filters.query);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [filters.query]);

  const handleInputChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    setShowSuggestions(true);
  };

  const handleSearch = (customQuery?: string) => {
    const query = customQuery || filters.query;
    if (!query.trim()) return;

    setIsLoading(true);
    
    // Parsear query natural y combinar con filtros existentes
    const naturalFilters = parseNaturalQuery(query);
    const finalFilters = { ...filters, ...naturalFilters, query: query.trim() };
    
    // Guardar en historial
    saveSearchToHistory(query);
    setSearchHistory(getSearchHistory());
    
    // Ejecutar búsqueda
    onSearch(finalFilters);
    setShowSuggestions(false);
    
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'categoria') {
      setFilters(prev => ({ 
        ...prev, 
        query: suggestion.texto,
        categoria: suggestion.metadata?.categoria || ''
      }));
    } else {
      setFilters(prev => ({ ...prev, query: suggestion.texto }));
    }
    handleSearch(suggestion.texto);
  };

  const handleQuickFilterClick = (quickFilter: any) => {
    const newFilters = { ...filters, ...quickFilter.filters };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearSearch = () => {
    setFilters(defaultFilters);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const showHistoryOrSuggestions = showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || filters.query.length === 0);

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto">
      {/* Barra principal */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={filters.query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-20 rounded-2xl border-2 border-neutral-200 
            focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/20 
            transition-all outline-none
            ${sizeClasses[size]}
            ${showSuggestions ? 'rounded-b-none border-b-0' : ''}
          `}
        />

        {/* Botón limpiar */}
        {filters.query && (
          <button
            onClick={clearSearch}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        {/* Botón buscar */}
        <button
          onClick={() => handleSearch()}
          disabled={isLoading}
          className={`
            absolute right-2 top-2 px-6 bg-primary-blue text-white rounded-xl 
            hover:bg-primary-blue-dark transition-colors disabled:opacity-50
            ${size === 'sm' ? 'py-1 text-sm' : size === 'md' ? 'py-2' : 'py-2'}
          `}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            'Buscar'
          )}
        </button>
      </div>

      {/* Panel de sugerencias */}
      <AnimatePresence>
        {showHistoryOrSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full bg-white border-2 border-t-0 border-neutral-200 rounded-b-2xl shadow-lg max-h-80 overflow-y-auto"
          >
            {/* Sugerencias basadas en query */}
            {suggestions.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-neutral-500 mb-3">Sugerencias</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center space-x-3 p-2 text-left hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <span className="text-lg">{suggestion.icono}</span>
                      <span className="text-neutral-700">{suggestion.texto}</span>
                      {suggestion.type === 'categoria' && (
                        <span className="ml-auto text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                          Categoría
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de búsquedas */}
            {filters.query.length === 0 && searchHistory.length > 0 && (
              <div className="p-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-neutral-500 flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Búsquedas recientes</span>
                  </h4>
                  <button
                    onClick={() => {
                      localStorage.removeItem('search_history');
                      setSearchHistory([]);
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-600"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(historyItem)}
                      className="w-full flex items-center space-x-3 p-2 text-left hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <ClockIcon className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600">{historyItem}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Búsquedas populares cuando no hay query ni historial */}
            {filters.query.length === 0 && searchHistory.length === 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-neutral-500 mb-3 flex items-center space-x-2">
                  <FireIcon className="w-4 h-4" />
                  <span>Búsquedas populares</span>
                </h4>
                <div className="space-y-1">
                  {[
                    'Plomero urgente',
                    'Limpieza profunda',
                    'Electricista instalación',
                    'Niñera esta noche',
                    'Jardinero corte césped'
                  ].map((popular, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(popular)}
                      className="w-full flex items-center space-x-3 p-2 text-left hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <FireIcon className="w-4 h-4 text-secondary-orange" />
                      <span className="text-neutral-600">{popular}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick filters */}
      {showQuickFilters && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            {quickFilters.map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickFilterClick(filter)}
                className={`
                  whitespace-nowrap px-4 py-2 rounded-full transition-all
                  flex items-center space-x-2 font-medium
                  ${filter.popular 
                    ? 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20 hover:bg-primary-blue/20' 
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }
                `}
              >
                <span>{filter.emoji}</span>
                <span>{filter.nombre}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {(filters.categoria || filters.verificados_solo || filters.urgentes_solo || filters.con_movilidad) && (
        <div className="flex items-center space-x-2 mt-3 text-sm">
          <span className="text-neutral-500">Filtros activos:</span>
          
          {filters.categoria && (
            <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded-full">
              Categoría: {filters.categoria}
            </span>
          )}
          
          {filters.verificados_solo && (
            <span className="px-2 py-1 bg-secondary-green/10 text-secondary-green rounded-full">
              Solo {BRAND_TERMS.ASES} verificados
            </span>
          )}
          
          {filters.urgentes_solo && (
            <span className="px-2 py-1 bg-secondary-red/10 text-secondary-red rounded-full">
              Solo urgentes
            </span>
          )}
          
          {filters.con_movilidad && (
            <span className="px-2 py-1 bg-secondary-orange/10 text-secondary-orange rounded-full">
              Con movilidad
            </span>
          )}

          <button
            onClick={() => setFilters(defaultFilters)}
            className="text-neutral-400 hover:text-neutral-600 ml-2"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;