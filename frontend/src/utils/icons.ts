// Sistema de iconos modernos y consistente para Serviplay

// Categorías de servicios con iconos modernos y atractivos
export const CATEGORY_ICONS = {
  // Hogar y limpieza
  limpieza: '✨',
  limpieza_hogar: '🏠',
  limpieza_oficina: '🏢',
  limpieza_post_obra: '🧹',
  
  // Técnicos
  plomeria: '🚰',
  electricidad: '💡',
  gas: '🔥',
  aire_acondicionado: '❄️',
  calefaccion: '🌡️',
  
  // Construcción y reparaciones
  carpinteria: '🔨',
  albanileria: '🏗️',
  pintura: '🎨',
  techado: '🏠',
  cerrajeria: '🔐',
  vidrieria: '🪟',
  
  // Hogar y mantenimiento
  jardineria: '🌿',
  piscinas: '🏊‍♂️',
  pest_control: '🦗',
  mudanzas: '📦',
  montaje_muebles: '🛋️',
  
  // Belleza y bienestar
  belleza: '💅',
  peluqueria: '💇‍♀️',
  barberia: '💈',
  masajes: '💆‍♀️',
  estetica: '✨',
  
  // Cuidados
  ninera: '👶',
  cuidado_adultos: '👵',
  cuidado_enfermos: '🏥',
  mascotas: '🐕',
  veterinaria: '🐕‍🦺',
  
  // Fitness y deporte
  personal_trainer: '💪',
  yoga: '🧘‍♀️',
  pilates: '🤸‍♀️',
  natacion: '🏊‍♂️',
  
  // Transporte
  delivery: '🛵',
  taxi: '🚗',
  remis: '🚙',
  mudanzas_transporte: '🚚',
  
  // Tecnología
  programacion: '👨‍💻',
  soporte_tecnico: '🛠️',
  reparacion_celulares: '📱',
  reparacion_computadoras: '💻',
  
  // Automotor
  mecanica: '🔧',
  lavado_auto: '🚗',
  gomeria: '🛞',
  
  // Alimentación
  cocina: '👨‍🍳',
  catering: '🍽️',
  panaderia: '🥖',
  reposteria: '🎂',
  
  // Educación
  clases_particulares: '📚',
  idiomas: '🌍',
  musica: '🎵',
  arte: '🎨',
  
  // Profesionales
  contabilidad: '📊',
  abogacia: '⚖️',
  arquitectura: '📐',
  diseño: '🎨',
  marketing: '📈',
  fotografia: '📸',
  
  // Eventos
  eventos: '🎉',
  catering_eventos: '🥂',
  decoracion: '🎈',
  musica_eventos: '🎶',
  fotografia_eventos: '📷',
  
  // Seguridad
  seguridad: '🛡️',
  alarmas: '🚨',
  camaras: '📹',
  
  // Otros
  consultoria: '💼',
  traduccion: '🌐',
  turismo: '✈️',
  seguros: '🛡️'
};

// Estados y acciones
export const ACTION_ICONS = {
  // Acciones principales
  crear: '➕',
  editar: '✏️',
  eliminar: '🗑️',
  guardar: '💾',
  buscar: '🔍',
  filtrar: '🔽',
  compartir: '📤',
  descargar: '⬇️',
  subir: '⬆️',
  
  // Estados
  activo: '✅',
  inactivo: '❌',
  pendiente: '⏳',
  completado: '✅',
  cancelado: '❌',
  urgente: '🚨',
  destacado: '⭐',
  nuevo: '🆕',
  popular: '🔥',
  
  // Calificaciones y feedback
  excelente: '⭐⭐⭐⭐⭐',
  muy_bueno: '⭐⭐⭐⭐',
  bueno: '⭐⭐⭐',
  regular: '⭐⭐',
  malo: '⭐',
  
  // Comunicación
  mensaje: '💬',
  llamada: '📞',
  whatsapp: '💚',
  email: '📧',
  notificacion: '🔔',
  
  // Progreso
  cargando: '⏳',
  procesando: '⚙️',
  sincronizando: '🔄',
  error: '❌',
  exito: '✅',
  advertencia: '⚠️',
  informacion: 'ℹ️'
};

// Características del usuario
export const USER_FEATURES = {
  // Verificación
  verificado: '✅',
  identidad_verificada: '🆔',
  profesional_verificado: '👨‍💼',
  email_verificado: '📧',
  telefono_verificado: '📱',
  
  // Suscripciones
  plan_basico: '📋',
  plan_profesional: '💎',
  plan_premium: '👑',
  
  // Características
  movilidad_propia: '🚙',
  disponible_24h: '🕐',
  emergencias: '🚨',
  garantia: '🛡️',
  asegurado: '🛡️',
  experiencia: '🎓',
  certificado: '📜',
  
  // Ubicación
  cerca: '📍',
  radio_amplio: '🌍',
  domicilio: '🏠',
  
  // Pagos
  efectivo: '💵',
  tarjeta: '💳',
  transferencia: '🏦',
  mercadopago: '💙'
};

// Emojis para diferentes secciones de la app
export const SECTION_ICONS = {
  perfil: '👤',
  servicios: '💼',
  busquedas: '🔍',
  matches: '🤝',
  mensajes: '💬',
  calificaciones: '⭐',
  configuracion: '⚙️',
  ayuda: '❓',
  soporte: '🆘',
  estadisticas: '📊',
  notificaciones: '🔔',
  favoritos: '❤️',
  historial: '📋',
  pagos: '💳',
  suscripcion: '💎'
};

// Función helper para obtener icono por categoría
export const getCategoryIcon = (categoryName: string): string => {
  const normalizedName = categoryName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n');
    
  return CATEGORY_ICONS[normalizedName as keyof typeof CATEGORY_ICONS] || '🔧';
};

// Función helper para obtener icono por acción
export const getActionIcon = (actionName: string): string => {
  return ACTION_ICONS[actionName as keyof typeof ACTION_ICONS] || '⚙️';
};

// Función helper para obtener icono por característica
export const getFeatureIcon = (featureName: string): string => {
  return USER_FEATURES[featureName as keyof typeof USER_FEATURES] || '✨';
};