-- SISTEMA DE MATCHING
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    busqueda_id UUID REFERENCES busquedas_servicios(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
    as_id UUID REFERENCES perfiles_ases(id),
    explorador_id UUID REFERENCES perfiles_exploradores(id),
    
    score_matching DECIMAL(3,2),
    distancia_km DECIMAL(5,2),
    
    estado match_status DEFAULT 'sugerido',
    
    fecha_contacto TIMESTAMP,
    metodo_contacto contact_method,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- CALIFICACIONES
CREATE TABLE calificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id),
    calificador_id UUID REFERENCES usuarios(id),
    calificado_id UUID REFERENCES usuarios(id),
    
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    
    -- Aspectos específicos
    puntualidad INTEGER CHECK (puntualidad >= 1 AND puntualidad <= 5),
    calidad INTEGER CHECK (calidad >= 1 AND calidad <= 5),
    comunicacion INTEGER CHECK (comunicacion >= 1 AND comunicacion <= 5),
    precio_justo INTEGER CHECK (precio_justo >= 1 AND precio_justo <= 5),
    
    publica BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICACIONES
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    tipo notification_type NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    
    datos_extra JSONB,
    
    leida BOOLEAN DEFAULT FALSE,
    enviada_push BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);