-- Insertar categorías principales
INSERT INTO categorias (nombre, descripcion, icono, color, orden) VALUES
('Limpieza', 'Servicios de limpieza para hogar y oficina', '🧹', '#10b981', 1),
('Plomería', 'Reparaciones y instalaciones de plomería', '🔧', '#3b82f6', 2),
('Electricidad', 'Instalaciones y reparaciones eléctricas', '⚡', '#f59e0b', 3),
('Jardinería', 'Cuidado de jardines y espacios verdes', '🌱', '#22c55e', 4),
('Pintura', 'Servicios de pintura interior y exterior', '🎨', '#8b5cf6', 5),
('Carpintería', 'Trabajos en madera y muebles', '🪚', '#a3a3a3', 6),
('Albañilería', 'Construcción y reparaciones de albañilería', '🧱', '#dc2626', 7),
('Tecnología', 'Reparación de computadoras y dispositivos', '💻', '#06b6d4', 8),
('Cuidado Personal', 'Servicios de belleza y cuidado personal', '💅', '#ec4899', 9),
('Mascotas', 'Cuidado y servicios para mascotas', '🐕', '#f97316', 10),
('Transporte', 'Servicios de transporte y mudanzas', '🚚', '#6b7280', 11),
('Educación', 'Clases particulares y tutoría', '📚', '#7c3aed', 12),
('Salud', 'Servicios de salud y bienestar', '🏥', '#ef4444', 13),
('Eventos', 'Organización de eventos y celebraciones', '🎉', '#f59e0b', 14),
('Fotografía', 'Servicios fotográficos profesionales', '📸', '#1f2937', 15);
('Niñera', 'Cuidado profesional de niños en el hogar', '👶', '#f472b6', 16),
('Cuidado de personas mayores', 'Atención domiciliaria y compañía', '🧓', '#d97706', 17),
('Cuidado de enfermos', 'Asistencia para personas convalecientes', '🩺', '#dc2626', 18),
('Plancha y Lavado', 'Planchar ropa, lavado a mano y en lavarropas', '🧺', '#60a5fa', 19),
('Limpieza por horas', 'Servicio de limpieza puntual por hora', '🧼', '#34d399', 20),
('Mecánica', 'Mecánica automotriz a domicilio o en taller', '🚗', '#eab308', 21),
('Cerrajería', 'Apertura, reparación e instalación de cerraduras', '🔑', '#9ca3af', 22),
('Mudanzas', 'Servicios de mudanza local y nacional', '📦', '#4b5563', 23),
('Gásista', 'Instalaciones y reparaciones de gas domiciliario', '🔥', '#f97316', 24),
('Tecnología móvil', 'Reparación de celulares, tablets y accesorios', '📱', '#0ea5e9', 25),
('Costura y arreglos', 'Arreglos de ropa y confección personalizada', '🪡', '#6366f1', 26),
('Belleza a domicilio', 'Manicura, peluquería y maquillaje en casa', '💄', '#ec4899', 27),
('Cocina y pastelería', 'Servicios de chef, cocineros y tortas a pedido', '🍰', '#f87171', 28),
('Personal trainer', 'Entrenamiento físico personalizado', '🏋️', '#22d3ee', 29),
('Clases de arte y música', 'Clases de pintura, canto, guitarra y más', '🎶', '#818cf8', 30),
('Marketing y diseño', 'Diseño gráfico, redes y publicidad digital', '🎯', '#3b82f6', 31),
('Soporte técnico', 'Ayuda con software, hardware y redes', '🛠️', '#0f766e', 32),
('Asistente virtual', 'Gestión de tareas personales y administrativas', '🧠', '#14b8a6', 33),
('Redacción y traducción', 'Correcciones, artículos y traducciones', '📝', '#10b981', 34),
('Mascotas - Paseo', 'Paseadores de perros y gatos', '🐾', '#facc15', 35),
('Mascotas - Cuidado en casa', 'Hospedaje y cuidado a domicilio de mascotas', '🏠', '#fbbf24', 36);
-- Servicios domésticos y familiares
('Cocina casera', 'Personas que cocinan por encargo o por día', '🍲', '#f87171', 37),
('Lavado de autos', 'Lavado interior y exterior, a domicilio o en local', '🧽', '#0284c7', 38),
('Acompañamiento escolar', 'Ayuda para tareas y estudios en casa', '✏️', '#6366f1', 39),
('Decoración de interiores', 'Asesoramiento y montaje de espacios', '🛋️', '#a855f7', 40),
('Desinfección', 'Eliminación de bacterias y virus en espacios', '🦠', '#ef4444', 41),
('Desinfección de colchones', 'Servicio especializado de limpieza profunda', '🛏️', '#7c3aed', 42),
('Control de plagas', 'Fumigación y prevención de insectos o roedores', '🐜', '#b91c1c', 43),
('Reparación de electrodomésticos', 'Servicio técnico para heladeras, lavarropas, etc.', '🔌', '#0ea5e9', 44),
('Instalación de aires acondicionados', 'Colocación, mantenimiento y limpieza', '❄️', '#60a5fa', 45),
('Mudanza de oficinas', 'Traslado de oficinas y escritorios', '🏢', '#6b7280', 46),
('Reciclaje y desecho', 'Retiro de chatarra, electrónicos o muebles', '♻️', '#16a34a', 47),
('Montaje de muebles', 'Armado de muebles nuevos o reacondicionados', '🪑', '#fbbf24', 48),
('Electricidad automotriz', 'Revisión de batería, luces, arranque, etc.', '🔋', '#c2410c', 49),

-- Belleza, salud y bienestar
('Masajes', 'Masajes terapéuticos y de relajación', '💆', '#10b981', 50),
('Depilación', 'Servicios de depilación con cera, láser, etc.', '🧖', '#e879f9', 51),
('Peluquería', 'Cortes, tinturas y peinados', '💇', '#d946ef', 52),
('Maquillaje profesional', 'Makeup para eventos y sesiones', '💋', '#be185d', 53),
('Entrenador personal', 'Entrenamiento físico en casa o al aire libre', '🏃', '#22c55e', 54),
('Nutricionista', 'Consultas de alimentación y planes dietarios', '🥗', '#84cc16', 55),
('Psicología', 'Terapias individuales o familiares', '🧠', '#8b5cf6', 56),
('Clases de yoga', 'Sesiones particulares o grupales', '🧘', '#a3e635', 57),

-- Servicios creativos y profesionales
('Diseño gráfico', 'Identidad visual, flyers, redes sociales', '🎨', '#6366f1', 58),
('Fotografía y video', 'Producción audiovisual profesional', '📷', '#1e293b', 59),
('Gestión de redes sociales', 'Manejo de Instagram, Facebook, TikTok, etc.', '📱', '#0ea5e9', 60),
('Asesoría legal', 'Consultoría jurídica y trámites legales', '⚖️', '#9ca3af', 61),
('Contabilidad y finanzas', 'Impuestos, balances y auditorías', '📊', '#facc15', 62),
('Marketing digital', 'Campañas online, SEO y publicidad', '📈', '#22d3ee', 63),
('Creación de páginas web', 'Landing pages, e-commerce, etc.', '🌐', '#3b82f6', 64),
('Clases de informática', 'Capacitación en software, redes, ofimática', '🖥️', '#2563eb', 65),

-- Educación y formación
('Clases particulares', 'Primaria, secundaria, ingreso universitario', '📚', '#4f46e5', 66),
('Clases de idiomas', 'Inglés, francés, portugués y más', '🗣️', '#06b6d4', 67),
('Clases de música', 'Guitarra, piano, canto, batería', '🎸', '#7c3aed', 68),
('Clases de arte', 'Dibujo, pintura, cerámica, manualidades', '🎨', '#f43f5e', 69),
('Capacitación laboral', 'Cursos técnicos y habilidades para el trabajo', '🏫', '#14b8a6', 70),

-- Eventos y recreación
('Animación infantil', 'Payasos, magos y juegos para chicos', '🎈', '#f59e0b', 71),
('Decoración de eventos', 'Ambientación y diseño de espacios', '🪅', '#eab308', 72),
('Sonido e iluminación', 'Equipos para eventos, DJ y técnica', '🔊', '#6d28d9', 73),
('Catering', 'Comida y bebida para eventos', '🍽️', '#f87171', 74),
('Bartenders', 'Barras móviles y coctelería para fiestas', '🍹', '#fbbf24', 75),
('Alquiler de mobiliario', 'Mesas, sillas, livings y más', '🪑', '#f97316', 76),
('Fotocabinas', 'Cabinas de fotos para eventos sociales', '📸', '#475569', 77),

-- Otros servicios útiles
('Trámites y gestoría', 'DNI, licencias, registros y más', '📝', '#60a5fa', 78),
('Mensajería urbana', 'Envíos rápidos en moto o bici', '📦', '#4ade80', 79),
('Delivery privado', 'Repartos personalizados de productos', '🚴', '#06b6d4', 80),
('Albañilería ligera', 'Pequeños arreglos y refacciones', '🧱', '#ef4444', 81),
('Mantenimiento general', 'Revisión y reparación de instalaciones', '🛠️', '#64748b', 82),
('Clases para adultos mayores', 'Tecnología, memoria, actividad cognitiva', '👴', '#fcd34d', 83);

-- Insertar tags comunes
INSERT INTO tags (nombre, categoria_id, sugerido) VALUES
-- Limpieza
('Limpieza profunda', (SELECT id FROM categorias WHERE nombre = 'Limpieza'), true),
('Limpieza de oficinas', (SELECT id FROM categorias WHERE nombre = 'Limpieza'), true),
('Limpieza de hogar', (SELECT id FROM categorias WHERE nombre = 'Limpieza'), true),
('Limpieza de alfombras', (SELECT id FROM categorias WHERE nombre = 'Limpieza'), true),

-- Plomería
('Destapación', (SELECT id FROM categorias WHERE nombre = 'Plomería'), true),
('Instalación de grifos', (SELECT id FROM categorias WHERE nombre = 'Plomería'), true),
('Reparación de cañerías', (SELECT id FROM categorias WHERE nombre = 'Plomería'), true),
('Instalación de inodoros', (SELECT id FROM categorias WHERE nombre = 'Plomería'), true),

-- Electricidad
('Instalación de luces', (SELECT id FROM categorias WHERE nombre = 'Electricidad'), true),
('Reparación de enchufes', (SELECT id FROM categorias WHERE nombre = 'Electricidad'), true),
('Instalación de ventiladores', (SELECT id FROM categorias WHERE nombre = 'Electricidad'), true),
('Revisión eléctrica', (SELECT id FROM categorias WHERE nombre = 'Electricidad'), true),

-- Jardinería
('Corte de césped', (SELECT id FROM categorias WHERE nombre = 'Jardinería'), true),
('Poda de árboles', (SELECT id FROM categorias WHERE nombre = 'Jardinería'), true),
('Diseño de jardines', (SELECT id FROM categorias WHERE nombre = 'Jardinería'), true),
('Riego automático', (SELECT id FROM categorias WHERE nombre = 'Jardinería'), true);

('Cuidado de bebés', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true),
('Niñera nocturna', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true),
('Niñera de emergencia', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true),
('Cuidado post escuela', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true),

-- Plancha y lavado
('Planchado de camisas', (SELECT id FROM categorias WHERE nombre = 'Plancha y Lavado'), true),
('Lavado de ropa blanca', (SELECT id FROM categorias WHERE nombre = 'Plancha y Lavado'), true),
('Servicio semanal de ropa', (SELECT id FROM categorias WHERE nombre = 'Plancha y Lavado'), true),

-- Cuidado de mayores
('Compañía diurna', (SELECT id FROM categorias WHERE nombre = 'Cuidado de personas mayores'), true),
('Asistencia para movilidad', (SELECT id FROM categorias WHERE nombre = 'Cuidado de personas mayores'), true),

-- Mecánica
('Cambio de aceite', (SELECT id FROM categorias WHERE nombre = 'Mecánica'), true),
('Diagnóstico a domicilio', (SELECT id FROM categorias WHERE nombre = 'Mecánica'), true),
('Alineación y balanceo', (SELECT id FROM categorias WHERE nombre = 'Mecánica'), true),

-- Cerrajería
('Apertura de puertas', (SELECT id FROM categorias WHERE nombre = 'Cerrajería'), true),
('Cambio de cerraduras', (SELECT id FROM categorias WHERE nombre = 'Cerrajería'), true),

-- Cocina
('Chef en casa', (SELECT id FROM categorias WHERE nombre = 'Cocina y pastelería'), true),
('Tortas para eventos', (SELECT id FROM categorias WHERE nombre = 'Cocina y pastelería'), true),
('Comidas semanales', (SELECT id FROM categorias WHERE nombre = 'Cocina y pastelería'), true);

-- Personal trainer
('Entrenamiento personalizado', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true),
('Programas de fitness', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true),
('Entrenamiento de fuerza', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true),
('Entrenamiento de resistencia', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true);

-- Clases de arte y música
('Clases de pintura', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true),
('Clases de canto', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true),
('Clases de guitarra', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true),
('Clases de piano', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true);

-- Marketing y diseño
('Diseño gráfico', (SELECT id FROM categorias WHERE nombre = 'Marketing y diseño'), true),
('Redes sociales', (SELECT id FROM categorias WHERE nombre = 'Marketing y diseño'), true),
('Publicidad digital', (SELECT id FROM categorias WHERE nombre = 'Marketing y diseño'), true),
('Marketing de contenidos', (SELECT id FROM categorias WHERE nombre = 'Marketing y diseño'), true);

-- Soporte técnico
('Ayuda con software', (SELECT id FROM categorias WHERE nombre = 'Soporte técnico'), true),
('Ayuda con hardware', (SELECT id FROM categorias WHERE nombre = 'Soporte técnico'), true),
('Ayuda con redes', (SELECT id FROM categorias WHERE nombre = 'Soporte técnico'), true);

-- Asistente virtual
('Gestión de tareas personales', (SELECT id FROM categorias WHERE nombre = 'Asistente virtual'), true),
('Gestión de tareas administrativas', (SELECT id FROM categorias WHERE nombre = 'Asistente virtual'), true),
('Gestión de tareas de oficina', (SELECT id FROM categorias WHERE nombre = 'Asistente virtual'), true);

-- Redacción y traducción
('Redacción de artículos', (SELECT id FROM categorias WHERE nombre = 'Redacción y traducción'), true),
('Traducción de documentos', (SELECT id FROM categorias WHERE nombre = 'Redacción y traducción'), true),
('Redacción de correcciones', (SELECT id FROM categorias WHERE nombre = 'Redacción y traducción'), true);

-- Mascotas - Paseo
('Paseo de perros', (SELECT id FROM categorias WHERE nombre = 'Mascotas - Paseo'), true),
('Paseo de gatos', (SELECT id FROM categorias WHERE nombre = 'Mascotas - Paseo'), true),
('Paseo de mascotas', (SELECT id FROM categorias WHERE nombre = 'Mascotas - Paseo'), true);

-- Mascotas - Cuidado en casa
('Cuidado de mascotas', (SELECT id FROM categorias WHERE nombre = 'Mascotas - Cuidado en casa'), true),
('Cuidado de mascotas', (SELECT id FROM categorias WHERE nombre = 'Mascotas - Cuidado en casa'), true),
('Cuidado de mascotas', (SELECT id FROM categorias WHERE nombre = 'Mascotas - Cuidado en casa'), true); 

-- Transporte
('Transporte', (SELECT id FROM categorias WHERE nombre = 'Transporte'), true),
('Mudanzas', (SELECT id FROM categorias WHERE nombre = 'Transporte'), true),
('Mudanzas', (SELECT id FROM categorias WHERE nombre = 'Transporte'), true);

-- Educacion
('Clases particulares', (SELECT id FROM categorias WHERE nombre = 'Educación'), true),
('Tutoría', (SELECT id FROM categorias WHERE nombre = 'Educación'), true),
('Tutoría', (SELECT id FROM categorias WHERE nombre = 'Educación'), true);

-- Salud
('Salud', (SELECT id FROM categorias WHERE nombre = 'Salud'), true),
('Salud', (SELECT id FROM categorias WHERE nombre = 'Salud'), true),
('Salud', (SELECT id FROM categorias WHERE nombre = 'Salud'), true);

-- Eventos
('Eventos', (SELECT id FROM categorias WHERE nombre = 'Eventos'), true),
('Eventos', (SELECT id FROM categorias WHERE nombre = 'Eventos'), true),
('Eventos', (SELECT id FROM categorias WHERE nombre = 'Eventos'), true);

-- Fotografia
('Fotografia', (SELECT id FROM categorias WHERE nombre = 'Fotografía'), true),
('Fotografia', (SELECT id FROM categorias WHERE nombre = 'Fotografía'), true),
('Fotografia', (SELECT id FROM categorias WHERE nombre = 'Fotografía'), true);

-- Niñera
('Niñera', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true),
('Niñera', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true),
('Niñera', (SELECT id FROM categorias WHERE nombre = 'Niñera'), true);

-- Cuidado de enfermos
('Cuidado de enfermos', (SELECT id FROM categorias WHERE nombre = 'Cuidado de enfermos'), true),
('Cuidado de enfermos', (SELECT id FROM categorias WHERE nombre = 'Cuidado de enfermos'), true),
('Cuidado de enfermos', (SELECT id FROM categorias WHERE nombre = 'Cuidado de enfermos'), true);

-- Servicios domésticos y familiares
('Cocina casera', (SELECT id FROM categorias WHERE nombre = 'Servicios domésticos y familiares'), true),
('Lavado de autos', (SELECT id FROM categorias WHERE nombre = 'Servicios domésticos y familiares'), true),
('Acompañamiento escolar', (SELECT id FROM categorias WHERE nombre = 'Servicios domésticos y familiares'), true);

-- Belleza, salud y bienestar
('Masajes', (SELECT id FROM categorias WHERE nombre = 'Belleza, salud y bienestar'), true),
('Depilación', (SELECT id FROM categorias WHERE nombre = 'Belleza, salud y bienestar'), true),
('Peluquería', (SELECT id FROM categorias WHERE nombre = 'Belleza, salud y bienestar'), true);

-- Servicios creativos y profesionales
('Diseño gráfico', (SELECT id FROM categorias WHERE nombre = 'Servicios creativos y profesionales'), true),
('Fotografía y video', (SELECT id FROM categorias WHERE nombre = 'Servicios creativos y profesionales'), true),
('Gestión de redes sociales', (SELECT id FROM categorias WHERE nombre = 'Servicios creativos y profesionales'), true);

-- Educación y formación
('Clases particulares', (SELECT id FROM categorias WHERE nombre = 'Educación y formación'), true),
('Clases de idiomas', (SELECT id FROM categorias WHERE nombre = 'Educación y formación'), true),
('Clases de música', (SELECT id FROM categorias WHERE nombre = 'Educación y formación'), true);

-- Eventos y recreación
('Animación infantil', (SELECT id FROM categorias WHERE nombre = 'Eventos y recreación'), true),
('Decoración de eventos', (SELECT id FROM categorias WHERE nombre = 'Eventos y recreación'), true),
('Sonido e iluminación', (SELECT id FROM categorias WHERE nombre = 'Eventos y recreación'), true);

-- Otros servicios útiles
('Trámites y gestoría', (SELECT id FROM categorias WHERE nombre = 'Otros servicios útiles'), true),
('Mensajería urbana', (SELECT id FROM categorias WHERE nombre = 'Otros servicios útiles'), true),
('Delivery privado', (SELECT id FROM categorias WHERE nombre = 'Otros servicios útiles'), true);

-- Albañilería ligera
('Albañilería ligera', (SELECT id FROM categorias WHERE nombre = 'Albañilería ligera'), true),
('Albañilería ligera', (SELECT id FROM categorias WHERE nombre = 'Albañilería ligera'), true),
('Albañilería ligera', (SELECT id FROM categorias WHERE nombre = 'Albañilería ligera'), true);

-- Mantenimiento general
('Mantenimiento general', (SELECT id FROM categorias WHERE nombre = 'Mantenimiento general'), true),
('Mantenimiento general', (SELECT id FROM categorias WHERE nombre = 'Mantenimiento general'), true),
('Mantenimiento general', (SELECT id FROM categorias WHERE nombre = 'Mantenimiento general'), true);

-- Clases para adultos mayores
('Clases para adultos mayores', (SELECT id FROM categorias WHERE nombre = 'Clases para adultos mayores'), true),
('Clases para adultos mayores', (SELECT id FROM categorias WHERE nombre = 'Clases para adultos mayores'), true),
('Clases para adultos mayores', (SELECT id FROM categorias WHERE nombre = 'Clases para adultos mayores'), true);

-- Servicios de cuidado de personas mayores
('Servicios de cuidado de personas mayores', (SELECT id FROM categorias WHERE nombre = 'Servicios de cuidado de personas mayores'), true),
('Servicios de cuidado de personas mayores', (SELECT id FROM categorias WHERE nombre = 'Servicios de cuidado de personas mayores'), true),
('Servicios de cuidado de personas mayores', (SELECT id FROM categorias WHERE nombre = 'Servicios de cuidado de personas mayores'), true);

-- Cocina y pastelería
('Cocina y pastelería', (SELECT id FROM categorias WHERE nombre = 'Cocina y pastelería'), true),
('Cocina y pastelería', (SELECT id FROM categorias WHERE nombre = 'Cocina y pastelería'), true),
('Cocina y pastelería', (SELECT id FROM categorias WHERE nombre = 'Cocina y pastelería'), true);

-- Personal trainer
('Personal trainer', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true),
('Personal trainer', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true),
('Personal trainer', (SELECT id FROM categorias WHERE nombre = 'Personal trainer'), true);

-- Clases de arte y música
('Clases de arte y música', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true),
('Clases de arte y música', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true),
('Clases de arte y música', (SELECT id FROM categorias WHERE nombre = 'Clases de arte y música'), true);





