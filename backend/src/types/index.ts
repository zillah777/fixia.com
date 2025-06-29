export interface Usuario {
  id: string;
  email: string;
  password_hash: string;
  tipo_usuario: 'as' | 'explorador' | 'ambos';
  estado: 'pendiente' | 'verificado' | 'suspendido';
  fecha_registro: Date;
  ultimo_acceso?: Date;
  email_verificado: boolean;
  token_verificacion?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  intentos_fallidos: number;
  bloqueado_hasta?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PerfilAs {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: Date;
  telefono: string;
  foto_perfil?: string;
  foto_dni_frente?: string;
  foto_dni_dorso?: string;
  foto_servicio_propio?: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigo_postal?: string;
  latitud?: number;
  longitud?: number;
  nivel_educativo?: 'primario' | 'secundario' | 'terciario' | 'universitario' | 'posgrado';
  referencias_laborales?: string;
  tiene_movilidad: boolean;
  disponibilidad_horaria?: any;
  dias_disponibles?: number[];
  radio_notificaciones: number;
  servicios_notificaciones?: string[];
  monto_minimo_notificacion?: number;
  horas_minimas_notificacion?: number;
  identidad_verificada: boolean;
  profesional_verificado: boolean;
  fecha_verificacion?: Date;
  suscripcion_activa: boolean;
  fecha_vencimiento_suscripcion?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PerfilExplorador {
  id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  foto_perfil?: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigo_postal?: string;
  latitud?: number;
  longitud?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  activa: boolean;
  orden: number;
}

export interface Servicio {
  id: string;
  as_id: string;
  categoria_id: string;
  titulo: string;
  descripcion: string;
  tipo_precio: 'por_hora' | 'por_trabajo' | 'por_semana' | 'por_mes';
  precio_desde: number;
  precio_hasta?: number;
  moneda: string;
  disponible: boolean;
  urgente: boolean;
  requiere_matricula: boolean;
  matricula_numero?: string;
  titulo_profesional?: string;
  documento_respaldo?: string;
  activo: boolean;
  destacado: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  nombre: string;
  categoria_id?: string;
  uso_count: number;
  sugerido: boolean;
}

export interface BusquedaServicio {
  id: string;
  explorador_id: string;
  titulo: string;
  descripcion: string;
  categoria_id?: string;
  direccion_trabajo?: string;
  latitud_trabajo?: number;
  longitud_trabajo?: number;
  radio_busqueda: number;
  presupuesto_minimo?: number;
  presupuesto_maximo?: number;
  tipo_precio?: 'por_hora' | 'por_trabajo' | 'por_semana' | 'por_mes';
  fecha_necesaria?: Date;
  hora_necesaria?: string;
  urgente: boolean;
  estado: 'activa' | 'pausada' | 'completada' | 'cancelada';
  created_at: Date;
  updated_at: Date;
}

export interface Match {
  id: string;
  busqueda_id?: string;
  servicio_id?: string;
  as_id: string;
  explorador_id: string;
  score_matching?: number;
  distancia_km?: number;
  estado: 'sugerido' | 'contactado' | 'rechazado' | 'completado';
  fecha_contacto?: Date;
  metodo_contacto?: 'whatsapp' | 'chat_interno' | 'telefono';
  created_at: Date;
}

export interface Calificacion {
  id: string;
  match_id?: string;
  calificador_id: string;
  calificado_id: string;
  puntuacion: number;
  comentario?: string;
  puntualidad?: number;
  calidad?: number;
  comunicacion?: number;
  precio_justo?: number;
  publica: boolean;
  created_at: Date;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  tipo: 'match' | 'mensaje' | 'calificacion' | 'sistema' | 'pago';
  titulo: string;
  mensaje: string;
  datos_extra?: any;
  leida: boolean;
  enviada_push: boolean;
  created_at: Date;
}

export interface Suscripcion {
  id: string;
  as_id: string;
  mercadopago_id?: string;
  estado: 'pendiente' | 'activa' | 'cancelada' | 'pausada';
  plan: string;
  precio: number;
  moneda: string;
  fecha_inicio?: Date;
  fecha_vencimiento?: Date;
  auto_renovacion: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Pago {
  id: string;
  suscripcion_id?: string;
  mercadopago_payment_id?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  monto: number;
  moneda: string;
  fecha_pago?: Date;
  metodo_pago?: string;
  created_at: Date;
}

// Tipos para multer
import { Request } from 'express';

export interface MulterRequest extends Request {
  file?: any;
  files?: any;
}