-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);

CREATE INDEX idx_ases_ubicacion ON perfiles_ases(latitud, longitud);
CREATE INDEX idx_ases_verificado ON perfiles_ases(identidad_verificada);
CREATE INDEX idx_ases_suscripcion ON perfiles_ases(suscripcion_activa);

CREATE INDEX idx_exploradores_ubicacion ON perfiles_exploradores(latitud, longitud);

CREATE INDEX idx_servicios_categoria ON servicios(categoria_id);
CREATE INDEX idx_servicios_activo ON servicios(activo);
CREATE INDEX idx_servicios_destacado ON servicios(destacado);
CREATE INDEX idx_servicios_as ON servicios(as_id);

CREATE INDEX idx_busquedas_estado ON busquedas_servicios(estado);
CREATE INDEX idx_busquedas_categoria ON busquedas_servicios(categoria_id);
CREATE INDEX idx_busquedas_explorador ON busquedas_servicios(explorador_id);

CREATE INDEX idx_matches_estado ON matches(estado);
CREATE INDEX idx_matches_as ON matches(as_id);
CREATE INDEX idx_matches_explorador ON matches(explorador_id);
CREATE INDEX idx_matches_score ON matches(score_matching DESC);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);

CREATE INDEX idx_calificaciones_calificado ON calificaciones(calificado_id);
CREATE INDEX idx_calificaciones_puntuacion ON calificaciones(puntuacion DESC);

CREATE INDEX idx_suscripciones_as ON suscripciones(as_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);

CREATE INDEX idx_pagos_suscripcion ON pagos(suscripcion_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);

-- Índices espaciales para búsquedas por proximidad
CREATE INDEX idx_ases_gist_location ON perfiles_ases USING GIST(point(longitud, latitud));
CREATE INDEX idx_exploradores_gist_location ON perfiles_exploradores USING GIST(point(longitud, latitud));

-- Índices compuestos para consultas complejas
CREATE INDEX idx_servicios_activo_categoria ON servicios(activo, categoria_id) WHERE activo = true;
CREATE INDEX idx_matches_estado_score ON matches(estado, score_matching DESC) WHERE estado = 'sugerido';
CREATE INDEX idx_notificaciones_usuario_leida ON notificaciones(usuario_id, leida) WHERE leida = false;