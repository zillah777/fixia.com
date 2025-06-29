// Terminología de marca
export const BRAND_TERMS = {
  // Roles principales
  AS: 'As',
  ASES: 'Ases', 
  EXPLORADOR: 'Explorador',
  EXPLORADORES: 'Exploradores',
  
  // Mensajes de marca
  BECOME_AS: 'Convertite en un As de Fixialo',
  EXPLORERS_FIND: 'Los Exploradores encuentran todo lo que necesitan',
  MATCH_MESSAGE: 'Match entre Ases y Exploradores',
  
  // CTAs
  JOIN_AS_AS: '¡Convertite en As!',
  START_EXPLORING: '¡Empezá a explorar!',
  FIND_YOUR_AS: 'Encontrá tu As perfecto',
  
  // Descripciones
  AS_DESCRIPTION: 'Los que brindan servicios con pasión y profesionalismo',
  EXPLORADOR_DESCRIPTION: 'Los que buscan servicios de calidad cerca suyo',
  
  // Onboarding
  AS_WELCOME: '¡Bienvenido/a al equipo de Ases! 🌟',
  EXPLORADOR_WELCOME: '¡Listo/a para explorar servicios increíbles! 🔍',
  
  // Matching
  NEW_MATCH: '¡Nuevo match encontrado!',
  PERFECT_AS: 'El As perfecto para vos',
  INTERESTED_EXPLORADOR: 'Un Explorador interesado en tu servicio',
  
  // Estados
  AS_VERIFIED: 'As Verificado ✓',
  TOP_AS: 'Top As ⭐',
  ACTIVE_EXPLORADOR: 'Explorador Activo',
  
  // Notificaciones  
  AS_CONTACTED: 'Un As te contactó',
  EXPLORADOR_INTERESTED: 'Un Explorador está interesado',
  
} as const;

// Configuración de la app
export const APP_CONFIG = {
  NAME: 'Fixialo',
  TAGLINE: 'Conectando Ases y Exploradores',
  VERSION: '1.0.0',
  
  // URLs
  WHATSAPP_BASE: 'https://wa.me/',
  INSTAGRAM_URL: 'https://instagram.com/fixialo',
  SUPPORT_EMAIL: 'hola@fixialo.com',
  
  // Límites
  MAX_SERVICES_FREE: 3,
  MAX_PHOTOS: 5,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 100,
  
  // Distancias
  DEFAULT_RADIUS: 10, // km
  MAX_RADIUS: 50, // km
  
} as const;

// Colores de categorías por defecto
export const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6',
  '#a3a3a3', '#dc2626', '#06b6d4', '#ec4899', '#f97316',
  '#6b7280', '#7c3aed', '#ef4444', '#f59e0b', '#1f2937'
];

// Iconos de categorías modernos y atractivos
export const CATEGORY_ICONS = [
  '✨', '🚰', '💡', '🌿', '🎨', '🔨', '🏗️', '👨‍💻', 
  '💅', '🐕', '📦', '📚', '🏥', '🎉', '📸', '👶', 
  '💆‍♀️', '💪', '🛵', '🔧', '👨‍🍳', '🎵', '🛡️', '📐'
];