-- CATEGORÍAS DE SERVICIOS
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(7),
    activa BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0
);

-- SERVICIOS OFRECIDOS
CREATE TABLE servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    as_id UUID REFERENCES perfiles_ases(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id),
    
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    
    -- Precios
    tipo_precio price_type NOT NULL,
    precio_desde DECIMAL(10,2) NOT NULL,
    precio_hasta DECIMAL(10,2),
    moneda VARCHAR(3) DEFAULT 'ARS',
    
    -- Disponibilidad específica del servicio
    disponible BOOLEAN DEFAULT TRUE,
    urgente BOOLEAN DEFAULT FALSE,
    
    -- Profesional (si requiere matrícula/título)
    requiere_matricula BOOLEAN DEFAULT FALSE,
    matricula_numero VARCHAR(100),
    titulo_profesional VARCHAR(200),
    documento_respaldo VARCHAR(500),
    
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TAGS/PALABRAS CLAVE
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    uso_count INTEGER DEFAULT 0,
    sugerido BOOLEAN DEFAULT FALSE
);

-- RELACIÓN SERVICIOS-TAGS
CREATE TABLE servicio_tags (
    servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (servicio_id, tag_id)
);

-- BÚSQUEDAS/DEMANDAS DE SERVICIOS
CREATE TABLE busquedas_servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    explorador_id UUID REFERENCES perfiles_exploradores(id) ON DELETE CASCADE,
    
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    
    -- Ubicación del trabajo
    direccion_trabajo TEXT,
    latitud_trabajo DECIMAL(10, 7),
    longitud_trabajo DECIMAL(10, 7),
    radio_busqueda INTEGER DEFAULT 10,
    
    -- Presupuesto
    presupuesto_minimo DECIMAL(10,2),
    presupuesto_maximo DECIMAL(10,2),
    tipo_precio price_type,
    
    -- Timing
    fecha_necesaria DATE,
    hora_necesaria TIME,
    urgente BOOLEAN DEFAULT FALSE,
    
    estado search_status DEFAULT 'activa',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);