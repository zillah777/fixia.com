-- Arreglar problema con tabla suscripciones
-- Eliminar tabla si existe sin la estructura correcta
DROP TABLE IF EXISTS suscripciones CASCADE;

-- Crear tabla suscripciones con estructura completa
CREATE TABLE suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(50) NOT NULL DEFAULT 'basico',
    estado VARCHAR(20) NOT NULL DEFAULT 'activa',
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    auto_renovacion BOOLEAN DEFAULT true,
    metodo_pago VARCHAR(50),
    precio_mensual DECIMAL(10,2),
    moneda VARCHAR(3) DEFAULT 'ARS',
    datos_pago JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_plan CHECK (plan_id IN ('basico', 'profesional', 'premium')),
    CONSTRAINT valid_estado CHECK (estado IN ('activa', 'suspendida', 'cancelada', 'expirada')),
    CONSTRAINT valid_metodo_pago CHECK (metodo_pago IN ('mercadopago', 'tarjeta', 'transferencia', 'crypto'))
);

-- Crear índices
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX idx_suscripciones_plan_id ON suscripciones(plan_id);
CREATE INDEX idx_suscripciones_fecha_vencimiento ON suscripciones(fecha_vencimiento);