-- LIMPIEZA COMPLETA Y RECREACIÓN DE TABLAS CON CONFLICTOS
-- Esta migración elimina y recrea todas las tablas que tienen conflictos

-- 1. ELIMINAR TODAS LAS TABLAS CONFLICTIVAS EN ORDEN INVERSO (por foreign keys)
DROP TABLE IF EXISTS reembolsos CASCADE;
DROP TABLE IF EXISTS logs_suscripciones CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS uso_promociones CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS suscripciones CASCADE;

-- 2. RECREAR TABLA SUSCRIPCIONES (única y definitiva)
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

-- 3. RECREAR TABLA PAGOS (única y definitiva)
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE SET NULL,
    mercadopago_payment_id VARCHAR(255) UNIQUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'ARS',
    fecha_pago TIMESTAMP WITH TIME ZONE,
    metodo_pago VARCHAR(50),
    datos_pago JSONB DEFAULT '{}',
    fee_mercadopago DECIMAL(10,2),
    monto_neto DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_estado_pago CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado', 'reembolsado')),
    CONSTRAINT valid_moneda CHECK (moneda IN ('ARS', 'USD', 'EUR', 'BRL')),
    CONSTRAINT positive_monto CHECK (monto > 0)
);

-- 4. TABLA DE PROMOCIONES
CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    descuento_porcentaje INTEGER,
    descuento_fijo DECIMAL(10,2),
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    usos_maximos INTEGER,
    usos_actuales INTEGER DEFAULT 0,
    plan_aplicable VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_descuento CHECK (
        (descuento_porcentaje IS NOT NULL AND descuento_porcentaje BETWEEN 1 AND 100) OR
        (descuento_fijo IS NOT NULL AND descuento_fijo > 0)
    ),
    CONSTRAINT valid_plan_aplicable CHECK (plan_aplicable IN ('basico', 'profesional', 'premium', 'todos'))
);

-- 5. TABLA DE USO DE PROMOCIONES
CREATE TABLE uso_promociones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promocion_id UUID REFERENCES promociones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    descuento_aplicado DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(promocion_id, usuario_id)
);

-- 6. TABLA DE FACTURAS
CREATE TABLE facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0,
    impuestos DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_vencimiento DATE,
    fecha_pago TIMESTAMP WITH TIME ZONE,
    metodo_pago VARCHAR(50),
    datos_pago JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_estado_factura CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'cancelada'))
);

-- 7. TABLA DE LOGS DE SUSCRIPCIONES
CREATE TABLE logs_suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    detalles JSONB DEFAULT '{}',
    usuario_admin UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_accion CHECK (accion IN ('creacion', 'activacion', 'cancelacion', 'suspension', 'renovacion', 'upgrade', 'downgrade'))
);

-- 8. TABLA DE REEMBOLSOS
CREATE TABLE reembolsos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id UUID REFERENCES pagos(id) ON DELETE CASCADE,
    monto_reembolso DECIMAL(10,2) NOT NULL,
    motivo TEXT,
    estado VARCHAR(20) DEFAULT 'solicitado',
    mercadopago_refund_id VARCHAR(255),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_procesado TIMESTAMP WITH TIME ZONE,
    procesado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_estado_reembolso CHECK (estado IN ('solicitado', 'aprobado', 'rechazado', 'procesado')),
    CONSTRAINT positive_monto_reembolso CHECK (monto_reembolso > 0)
);

-- 9. ACTUALIZAR TABLA PERFILES_ASES para conectar con suscripciones
ALTER TABLE perfiles_ases 
ADD COLUMN IF NOT EXISTS suscripcion_id UUID REFERENCES suscripciones(id),
ADD COLUMN IF NOT EXISTS plan_actual VARCHAR(50) DEFAULT 'basico',
ADD COLUMN IF NOT EXISTS fecha_vencimiento_suscripcion TIMESTAMP WITH TIME ZONE;

-- 10. CREAR TODOS LOS ÍNDICES
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_plan_id ON suscripciones(plan_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_fecha_vencimiento ON suscripciones(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_pagos_mercadopago_id ON pagos(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion_id ON pagos(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago);

CREATE INDEX IF NOT EXISTS idx_promociones_codigo ON promociones(codigo);
CREATE INDEX IF NOT EXISTS idx_promociones_activo ON promociones(activo);

CREATE INDEX IF NOT EXISTS idx_facturas_suscripcion_id ON facturas(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);

CREATE INDEX IF NOT EXISTS idx_logs_suscripciones_suscripcion_id ON logs_suscripciones(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_pago_id ON reembolsos(pago_id);

CREATE INDEX IF NOT EXISTS idx_perfiles_ases_suscripcion_id ON perfiles_ases(suscripcion_id);

-- 11. TRIGGERS PARA UPDATED_AT
CREATE TRIGGER trigger_update_suscripciones_updated_at
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_pagos_updated_at
    BEFORE UPDATE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. FUNCIÓN PARA CALCULAR MONTO NETO
CREATE OR REPLACE FUNCTION calcular_monto_neto()
RETURNS TRIGGER AS $$
BEGIN
    NEW.monto_neto = NEW.monto - COALESCE(NEW.fee_mercadopago, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_monto_neto
    BEFORE INSERT OR UPDATE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_monto_neto();

-- 13. DATOS INICIALES
INSERT INTO suscripciones (plan_id, estado, precio_mensual, fecha_vencimiento) VALUES 
('basico', 'activa', 0.00, NULL),
('profesional', 'activa', 2999.00, NOW() + INTERVAL '1 month'),
('premium', 'activa', 4999.00, NOW() + INTERVAL '1 month')
ON CONFLICT DO NOTHING;

INSERT INTO promociones (codigo, descripcion, descuento_porcentaje, fecha_vencimiento, plan_aplicable) VALUES 
('BIENVENIDO20', 'Descuento de bienvenida 20%', 20, NOW() + INTERVAL '6 months', 'todos'),
('PROFESIONAL50', '50% de descuento en plan profesional', 50, NOW() + INTERVAL '3 months', 'profesional'),
('PREMIUM30', '30% de descuento en plan premium', 30, NOW() + INTERVAL '1 month', 'premium')
ON CONFLICT (codigo) DO NOTHING;

-- COMENTARIOS
COMMENT ON TABLE suscripciones IS 'Gestión de suscripciones de los Ases';
COMMENT ON TABLE pagos IS 'Registro de todos los pagos procesados';
COMMENT ON TABLE promociones IS 'Códigos promocionales y descuentos';
COMMENT ON TABLE facturas IS 'Historial de facturación';
COMMENT ON TABLE logs_suscripciones IS 'Auditoría de cambios en suscripciones';
COMMENT ON TABLE reembolsos IS 'Gestión de reembolsos de pagos';