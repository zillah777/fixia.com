-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_type AS ENUM ('as', 'explorador', 'ambos');
CREATE TYPE user_status AS ENUM ('pendiente', 'verificado', 'suspendido');
CREATE TYPE education_level AS ENUM ('primario', 'secundario', 'terciario', 'universitario', 'posgrado');
CREATE TYPE price_type AS ENUM ('por_hora', 'por_trabajo', 'por_semana', 'por_mes');
CREATE TYPE search_status AS ENUM ('activa', 'pausada', 'completada', 'cancelada');
CREATE TYPE match_status AS ENUM ('sugerido', 'contactado', 'rechazado', 'completado');
CREATE TYPE contact_method AS ENUM ('whatsapp', 'chat_interno', 'telefono');
CREATE TYPE notification_type AS ENUM ('match', 'mensaje', 'calificacion', 'sistema', 'pago');
CREATE TYPE subscription_status AS ENUM ('pendiente', 'activa', 'cancelada', 'pausada');
CREATE TYPE payment_status AS ENUM ('pendiente', 'aprobado', 'rechazado', 'cancelado');

-- USUARIOS BASE
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario user_type NOT NULL,
    estado user_status DEFAULT 'pendiente',
    fecha_registro TIMESTAMP DEFAULT NOW(),
    ultimo_acceso TIMESTAMP,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PERFILES ASES
CREATE TABLE perfiles_ases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    foto_perfil VARCHAR(500),
    
    -- Documentación identidad
    foto_dni_frente VARCHAR(500),
    foto_dni_dorso VARCHAR(500),
    foto_servicio_propio VARCHAR(500),
    
    -- Ubicación
    direccion TEXT NOT NULL,
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    
    -- Información adicional
    nivel_educativo education_level,
    referencias_laborales TEXT,
    tiene_movilidad BOOLEAN DEFAULT FALSE,
    
    -- Disponibilidad
    disponibilidad_horaria JSONB,
    dias_disponibles INTEGER[],
    
    -- Notificaciones preferences
    radio_notificaciones INTEGER DEFAULT 10,
    servicios_notificaciones UUID[],
    monto_minimo_notificacion DECIMAL(10,2),
    horas_minimas_notificacion INTEGER,
    
    -- Verificación
    identidad_verificada BOOLEAN DEFAULT FALSE,
    profesional_verificado BOOLEAN DEFAULT FALSE,
    fecha_verificacion TIMESTAMP,
    
    suscripcion_activa BOOLEAN DEFAULT FALSE,
    fecha_vencimiento_suscripcion TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PERFILES EXPLORADORES  
CREATE TABLE perfiles_exploradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    foto_perfil VARCHAR(500),
    
    -- Ubicación
    direccion TEXT NOT NULL,
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);