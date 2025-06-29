-- SUSCRIPCIONES MERCADOPAGO
CREATE TABLE suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    as_id UUID REFERENCES perfiles_ases(id) ON DELETE CASCADE,
    
    mercadopago_id VARCHAR(100) UNIQUE,
    estado subscription_status DEFAULT 'pendiente',
    
    plan VARCHAR(50) DEFAULT 'basico',
    precio DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    
    fecha_inicio TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    auto_renovacion BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PAGOS
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suscripcion_id UUID REFERENCES suscripciones(id),
    
    mercadopago_payment_id VARCHAR(100) UNIQUE,
    estado payment_status DEFAULT 'pendiente',
    
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'USD',
    
    fecha_pago TIMESTAMP,
    metodo_pago VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW()
);