-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS suscripciones (
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

-- Tabla de promociones
CREATE TABLE IF NOT EXISTS promociones (
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

-- Tabla de uso de promociones
CREATE TABLE IF NOT EXISTS uso_promociones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promocion_id UUID REFERENCES promociones(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    descuento_aplicado DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(promocion_id, usuario_id)
);

-- Tabla de historial de facturación
CREATE TABLE IF NOT EXISTS facturas (
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

-- Actualizar tabla perfiles_ases para incluir referencia a suscripción
ALTER TABLE perfiles_ases 
ADD COLUMN IF NOT EXISTS suscripcion_id UUID REFERENCES suscripciones(id),
ADD COLUMN IF NOT EXISTS plan_actual VARCHAR(50) DEFAULT 'basico',
ADD COLUMN IF NOT EXISTS fecha_vencimiento_suscripcion TIMESTAMP WITH TIME ZONE;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_plan_id ON suscripciones(plan_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_fecha_vencimiento ON suscripciones(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_promociones_codigo ON promociones(codigo);
CREATE INDEX IF NOT EXISTS idx_promociones_activo ON promociones(activo);
CREATE INDEX IF NOT EXISTS idx_facturas_suscripcion_id ON facturas(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_perfiles_ases_suscripcion_id ON perfiles_ases(suscripcion_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_suscripciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_suscripciones_updated_at
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION update_suscripciones_updated_at();

-- Trigger para actualizar uso de promociones
CREATE OR REPLACE FUNCTION update_promocion_usos()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE promociones 
        SET usos_actuales = usos_actuales + 1 
        WHERE id = NEW.promocion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE promociones 
        SET usos_actuales = usos_actuales - 1 
        WHERE id = OLD.promocion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promocion_usos
    AFTER INSERT OR DELETE ON uso_promociones
    FOR EACH ROW
    EXECUTE FUNCTION update_promocion_usos();

-- Función para verificar límites de suscripción
CREATE OR REPLACE FUNCTION verificar_limite_servicios(p_usuario_id UUID, p_plan_id VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    limite_servicios INTEGER;
    servicios_actuales INTEGER;
BEGIN
    -- Obtener límite según el plan
    CASE p_plan_id
        WHEN 'basico' THEN limite_servicios := 3;
        WHEN 'profesional' THEN limite_servicios := -1; -- Ilimitado
        WHEN 'premium' THEN limite_servicios := -1; -- Ilimitado
        ELSE limite_servicios := 1; -- Por defecto
    END CASE;
    
    -- Si es ilimitado
    IF limite_servicios = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- Contar servicios actuales
    SELECT COUNT(*) INTO servicios_actuales
    FROM servicios s
    INNER JOIN perfiles_ases pa ON s.as_id = pa.id
    WHERE pa.usuario_id = p_usuario_id AND s.activo = true;
    
    RETURN servicios_actuales < limite_servicios;
END;
$$ LANGUAGE plpgsql;

-- Insertar planes básicos
INSERT INTO suscripciones (id, plan_id, estado, precio_mensual, fecha_vencimiento) VALUES 
(gen_random_uuid(), 'basico', 'activa', 0.00, NULL),
(gen_random_uuid(), 'profesional', 'activa', 2999.00, NOW() + INTERVAL '1 month'),
(gen_random_uuid(), 'premium', 'activa', 4999.00, NOW() + INTERVAL '1 month')
ON CONFLICT DO NOTHING;

-- Promociones de ejemplo
INSERT INTO promociones (codigo, descripcion, descuento_porcentaje, fecha_vencimiento, plan_aplicable) VALUES 
('BIENVENIDO20', 'Descuento de bienvenida 20%', 20, NOW() + INTERVAL '6 months', 'todos'),
('PROFESIONAL50', '50% de descuento en plan profesional', 50, NOW() + INTERVAL '3 months', 'profesional'),
('PREMIUM30', '30% de descuento en plan premium', 30, NOW() + INTERVAL '1 month', 'premium')
ON CONFLICT (codigo) DO NOTHING;

-- Comentarios
COMMENT ON TABLE suscripciones IS 'Gestión de suscripciones de los Ases';
COMMENT ON TABLE promociones IS 'Códigos promocionales y descuentos';
COMMENT ON TABLE uso_promociones IS 'Registro de uso de promociones por usuario';
COMMENT ON TABLE facturas IS 'Historial de facturación y pagos';

COMMENT ON COLUMN suscripciones.plan_id IS 'Tipo de plan: basico, profesional, premium';
COMMENT ON COLUMN suscripciones.estado IS 'Estado: activa, suspendida, cancelada, expirada';
COMMENT ON COLUMN suscripciones.auto_renovacion IS 'Si la suscripción se renueva automáticamente';
COMMENT ON COLUMN promociones.usos_maximos IS 'NULL significa usos ilimitados';
COMMENT ON COLUMN facturas.numero_factura IS 'Número único de factura para contabilidad';