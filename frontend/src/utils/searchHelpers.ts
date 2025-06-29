import { SearchFilters, QuickFilter, SearchSuggestion } from '@/types/search';

// Quick filters predefinidos
export const quickFilters: QuickFilter[] = [
  {
    id: 'urgente',
    nombre: 'Urgente',
    emoji: '🚨',
    filters: { urgentes_solo: true, disponible_ahora: true },
    popular: true
  },
  {
    id: 'limpieza',
    nombre: 'Limpieza',
    emoji: '🧹',
    filters: { categoria: 'limpieza' },
    popular: true
  },
  {
    id: 'plomero',
    nombre: 'Plomero',
    emoji: '🔧',
    filters: { categoria: 'plomeria' },
    popular: true
  },
  {
    id: 'electricista',
    nombre: 'Electricista',
    emoji: '⚡',
    filters: { categoria: 'electricidad' },
    popular: true
  },
  {
    id: 'verificados',
    nombre: 'Verificados',
    emoji: '✓',
    filters: { verificados_solo: true },
    popular: false
  },
  {
    id: 'con-movilidad',
    nombre: 'Con movilidad',
    emoji: '🚗',
    filters: { con_movilidad: true },
    popular: false
  },
  {
    id: 'jardineria',
    nombre: 'Jardinería',
    emoji: '🌱',
    filters: { categoria: 'jardineria' },
    popular: false
  },
  {
    id: 'pintura',
    nombre: 'Pintura',
    emoji: '🎨',
    filters: { categoria: 'pintura' },
    popular: false
  },
  {
    id: 'tecnologia',
    nombre: 'Tecnología',
    emoji: '💻',
    filters: { categoria: 'tecnologia' },
    popular: false
  }
];

// Filtros iniciales por defecto
export const defaultFilters: SearchFilters = {
  query: '',
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

// Parsear query natural a filtros estructurados
export const parseNaturalQuery = (query: string): Partial<SearchFilters> => {
  const filters: Partial<SearchFilters> = {};
  const lowerQuery = query.toLowerCase();

  // Detectar urgencia
  if (lowerQuery.includes('urgente') || lowerQuery.includes('ahora') || lowerQuery.includes('ya')) {
    filters.urgentes_solo = true;
    filters.disponible_ahora = true;
  }

  // Detectar ubicación temporal
  if (lowerQuery.includes('esta noche') || lowerQuery.includes('hoy') || lowerQuery.includes('mañana')) {
    filters.disponible_ahora = true;
  }

  // Detectar preferencia por verificados
  if (lowerQuery.includes('confiable') || lowerQuery.includes('verificado') || lowerQuery.includes('seguro')) {
    filters.verificados_solo = true;
  }

  // Detectar movilidad
  if (lowerQuery.includes('que venga') || lowerQuery.includes('a domicilio') || lowerQuery.includes('con movilidad')) {
    filters.con_movilidad = true;
  }

  // Detectar categorías por palabras clave
  const categoryKeywords = {
    limpieza: ['limpieza', 'limpiar', 'mucama', 'servicio domestico'],
    plomeria: ['plomero', 'cañeria', 'agua', 'inodoro', 'canilla', 'destapacion'],
    electricidad: ['electricista', 'luz', 'enchufe', 'instalacion electrica', 'corte de luz'],
    jardineria: ['jardinero', 'cesped', 'plantas', 'jardin', 'poda'],
    pintura: ['pintor', 'pintar', 'pintura'],
    tecnologia: ['tecnico', 'computadora', 'celular', 'wifi', 'reparacion'],
    cuidado_personal: ['peluquero', 'maquillaje', 'masaje', 'belleza'],
    mascotas: ['veterinario', 'paseador', 'cuidado mascotas', 'perro', 'gato'],
    transporte: ['mudanza', 'flete', 'transporte'],
    educacion: ['profesor', 'clases', 'tutor', 'enseñanza'],
    eventos: ['fotografo', 'catering', 'evento', 'fiesta']
  };

  for (const [categoria, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      filters.categoria = categoria;
      break;
    }
  }

  return filters;
};

// Generar sugerencias basadas en el input
export const generateSuggestions = (query: string): SearchSuggestion[] => {
  if (query.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];
  const lowerQuery = query.toLowerCase();

  // Sugerencias de servicios populares
  const serviceSuggestions = [
    'Limpieza profunda de hogar',
    'Plomero para destapación',
    'Electricista instalación luces',
    'Jardinero corte de césped',
    'Pintor interior',
    'Técnico computadoras',
    'Niñera para esta noche',
    'Profesor de inglés',
    'Fotógrafo para eventos',
    'Mudanza departamento'
  ];

  serviceSuggestions
    .filter(service => service.toLowerCase().includes(lowerQuery))
    .slice(0, 3)
    .forEach(service => {
      suggestions.push({
        id: `service-${service}`,
        type: 'servicio',
        texto: service,
        icono: '🔍'
      });
    });

  // Sugerencias de categorías
  const categories = [
    { nombre: 'Limpieza', icono: '🧹' },
    { nombre: 'Plomería', icono: '🔧' },
    { nombre: 'Electricidad', icono: '⚡' },
    { nombre: 'Jardinería', icono: '🌱' },
    { nombre: 'Pintura', icono: '🎨' },
    { nombre: 'Tecnología', icono: '💻' }
  ];

  categories
    .filter(cat => cat.nombre.toLowerCase().includes(lowerQuery))
    .slice(0, 2)
    .forEach(cat => {
      suggestions.push({
        id: `category-${cat.nombre}`,
        type: 'categoria',
        texto: `Todos los servicios de ${cat.nombre}`,
        icono: cat.icono
      });
    });

  return suggestions.slice(0, 5);
};

// Calcular relevancia para ordenamiento
export const calculateRelevance = (servicio: any, filters: SearchFilters): number => {
  let score = 0;

  // Relevancia por query
  if (filters.query) {
    const query = filters.query.toLowerCase();
    const titulo = servicio.titulo.toLowerCase();
    const descripcion = servicio.descripcion.toLowerCase();
    
    if (titulo.includes(query)) score += 10;
    if (descripcion.includes(query)) score += 5;
    
    // Bonus por coincidencia exacta
    if (titulo === query) score += 20;
  }

  // Relevancia por verificación
  if (servicio.as?.identidad_verificada) score += 5;
  if (servicio.as?.profesional_verificado) score += 3;

  // Relevancia por rating
  if (servicio.rating) score += servicio.rating;

  // Relevancia por urgencia si se busca urgente
  if (filters.urgentes_solo && servicio.urgente) score += 15;

  // Relevancia por distancia (inversa)
  if (servicio.distancia) {
    score += Math.max(0, 10 - servicio.distancia);
  }

  // Relevancia por actividad reciente
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(servicio.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate < 7) score += 3;

  return score;
};

// Obtener historial de búsquedas del localStorage
export const getSearchHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem('search_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

// Guardar búsqueda en historial
export const saveSearchToHistory = (query: string): void => {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const history = getSearchHistory();
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  } catch {
    // Silently fail
  }
};

// Limpiar historial
export const clearSearchHistory = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('search_history');
  } catch {
    // Silently fail
  }
};