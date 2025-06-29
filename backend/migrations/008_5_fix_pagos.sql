-- Arreglar tabla pagos si existe sin columnas correctas
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS logs_suscripciones CASCADE;  
DROP TABLE IF EXISTS reembolsos CASCADE;

-- Recrear tabla pagos
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