export interface SearchFilters {
  query: string;
  categoria: string;
  ubicacion: {lat: number, lng: number} | null;
  radio: number;
  precio_min: number;
  precio_max: number;
  disponible_ahora: boolean;
  verificados_solo: boolean;
  urgentes_solo: boolean;
  con_movilidad: boolean;
  tags: string[];
  ordenar_por: 'distancia' | 'precio' | 'rating' | 'reciente' | 'relevancia';
}

export interface QuickFilter {
  id: string;
  nombre: string;
  emoji: string;
  filters: Partial<SearchFilters>;
  popular: boolean;
}

export interface SearchSuggestion {
  id: string;
  type: 'servicio' | 'categoria' | 'as' | 'ubicacion';
  texto: string;
  icono?: string;
  metadata?: any;
}

export interface SearchResult {
  servicios: any[];
  total: number;
  pagina: number;
  por_pagina: number;
  filtros_aplicados: SearchFilters;
  tiempo_busqueda: number;
  sugerencias?: string[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: Date;
  resultados_count: number;
}

export interface PopularSearch {
  query: string;
  count: number;
  trending: boolean;
}