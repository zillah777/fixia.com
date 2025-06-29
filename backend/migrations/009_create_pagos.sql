-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
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

-- Tabla de logs de suscripciones para auditoría
CREATE TABLE IF NOT EXISTS logs_suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID REFERENCES suscripciones(id) ON DELETE CASCADE,
    accion VARCHAR(50) NOT NULL,
    detalles JSONB DEFAULT '{}',
    usuario_admin UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_accion CHECK (accion IN ('creacion', 'activacion', 'cancelacion', 'suspension', 'renovacion', 'upgrade', 'downgrade'))
);

-- Tabla de reembolsos
CREATE TABLE IF NOT EXISTS reembolsos (
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

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_pagos_mercadopago_id ON pagos(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion_id ON pagos(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at ON pagos(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_suscripciones_suscripcion_id ON logs_suscripciones(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_logs_suscripciones_accion ON logs_suscripciones(accion);
CREATE INDEX IF NOT EXISTS idx_reembolsos_pago_id ON reembolsos(pago_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_estado ON reembolsos(estado);

-- Trigger para actualizar updated_at en pagos
CREATE OR REPLACE FUNCTION update_pagos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pagos_updated_at
    BEFORE UPDATE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION update_pagos_updated_at();

-- Función para calcular monto neto (monto - fee de MercadoPago)
CREATE OR REPLACE FUNCTION calcular_monto_neto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fee_mercadopago IS NOT NULL THEN
        NEW.monto_neto = NEW.monto - NEW.fee_mercadopago;
    ELSE
        NEW.monto_neto = NEW.monto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_monto_neto
    BEFORE INSERT OR UPDATE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_monto_neto();

-- Función para registrar cambios en suscripciones
CREATE OR REPLACE FUNCTION log_suscripcion_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_suscripciones (suscripcion_id, accion, detalles)
        VALUES (NEW.id, 'creacion', jsonb_build_object('plan_id', NEW.plan_id));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log cambios de estado
        IF OLD.estado != NEW.estado THEN
            INSERT INTO logs_suscripciones (suscripcion_id, accion, detalles)
            VALUES (NEW.id, NEW.estado, jsonb_build_object(
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado
            ));
        END IF;
        
        -- Log cambios de plan
        IF OLD.plan_id != NEW.plan_id THEN
            INSERT INTO logs_suscripciones (suscripcion_id, accion, detalles)
            VALUES (NEW.id, 'upgrade', jsonb_build_object(
                'plan_anterior', OLD.plan_id,
                'plan_nuevo', NEW.plan_id
            ));
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_suscripcion_changes
    AFTER INSERT OR UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION log_suscripcion_changes();

-- Vista para reportes de ingresos
CREATE OR REPLACE VIEW reporte_ingresos AS
SELECT 
    DATE_TRUNC('month', p.fecha_pago) as mes,
    s.plan_id,
    COUNT(*) as total_pagos,
    SUM(p.monto) as ingresos_brutos,
    SUM(COALESCE(p.fee_mercadopago, 0)) as fees_mercadopago,
    SUM(COALESCE(p.monto_neto, p.monto)) as ingresos_netos,
    AVG(p.monto) as ticket_promedio
FROM pagos p
INNER JOIN suscripciones s ON p.suscripcion_id = s.id
WHERE p.estado = 'aprobado'
    AND p.fecha_pago IS NOT NULL
GROUP BY DATE_TRUNC('month', p.fecha_pago), s.plan_id
ORDER BY mes DESC, s.plan_id;

-- Vista para estado de suscripciones
CREATE OR REPLACE VIEW estado_suscripciones AS
SELECT 
    s.id,
    s.plan_id,
    s.estado,
    s.fecha_inicio,
    s.fecha_vencimiento,
    s.auto_renovacion,
    pa.usuario_id,
    u.email,
    pa.suscripcion_activa,
    CASE 
        WHEN s.fecha_vencimiento < NOW() THEN 'vencida'
        WHEN s.fecha_vencimiento < NOW() + INTERVAL '7 days' THEN 'por_vencer'
        ELSE 'vigente'
    END as estado_vencimiento,
    (
        SELECT SUM(p.monto) 
        FROM pagos p 
        WHERE p.suscripcion_id = s.id AND p.estado = 'aprobado'
    ) as total_pagado
FROM suscripciones s
INNER JOIN perfiles_ases pa ON s.id = pa.suscripcion_id
INNER JOIN usuarios u ON pa.usuario_id = u.id;

-- Función para obtener métricas de suscripciones
CREATE OR REPLACE FUNCTION obtener_metricas_suscripciones()
RETURNS TABLE (
    total_suscripciones BIGINT,
    suscripciones_activas BIGINT,
    suscripciones_vencidas BIGINT,
    ingresos_mes_actual DECIMAL,
    ingresos_mes_anterior DECIMAL,
    crecimiento_ingresos DECIMAL,
    plan_mas_popular TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH metricas AS (
        SELECT 
            COUNT(*) as total_subs,
            COUNT(*) FILTER (WHERE estado = 'activa') as activas,
            COUNT(*) FILTER (WHERE fecha_vencimiento < NOW()) as vencidas
        FROM suscripciones
    ),
    ingresos AS (
        SELECT 
            SUM(CASE WHEN DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', NOW()) 
                THEN monto ELSE 0 END) as mes_actual,
            SUM(CASE WHEN DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', NOW() - INTERVAL '1 month') 
                THEN monto ELSE 0 END) as mes_anterior
        FROM pagos 
        WHERE estado = 'aprobado'
    ),
    plan_popular AS (
        SELECT s.plan_id
        FROM suscripciones s
        WHERE s.estado = 'activa'
        GROUP BY s.plan_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT 
        m.total_subs,
        m.activas,
        m.vencidas,
        i.mes_actual,
        i.mes_anterior,
        CASE WHEN i.mes_anterior > 0 
            THEN ((i.mes_actual - i.mes_anterior) / i.mes_anterior * 100)
            ELSE 0 
        END,
        p.plan_id
    FROM metricas m, ingresos i, plan_popular p;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE pagos IS 'Registro de todos los pagos procesados por MercadoPago';
COMMENT ON TABLE logs_suscripciones IS 'Auditoría de cambios en suscripciones';
COMMENT ON TABLE reembolsos IS 'Gestión de reembolsos de pagos';

COMMENT ON COLUMN pagos.mercadopago_payment_id IS 'ID único del pago en MercadoPago';
COMMENT ON COLUMN pagos.datos_pago IS 'Información adicional del pago en formato JSON';
COMMENT ON COLUMN pagos.fee_mercadopago IS 'Comisión cobrada por MercadoPago';
COMMENT ON COLUMN pagos.monto_neto IS 'Monto recibido después de comisiones';

COMMENT ON VIEW reporte_ingresos IS 'Reporte mensual de ingresos por plan';
COMMENT ON VIEW estado_suscripciones IS 'Estado actual de todas las suscripciones';