-- Tabla para estadísticas del sistema
CREATE TABLE system_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor BIGINT NOT NULL DEFAULT 0,
    metadatos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices y restricciones
    CONSTRAINT unique_fecha_tipo UNIQUE (fecha, tipo)
);

-- Índices para optimización
CREATE INDEX idx_system_stats_fecha ON system_stats(fecha);
CREATE INDEX idx_system_stats_tipo ON system_stats(tipo);
CREATE INDEX idx_system_stats_fecha_tipo ON system_stats(fecha, tipo);

-- Trigger para updated_at
CREATE TRIGGER update_system_stats_updated_at
    BEFORE UPDATE ON system_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos tipos de estadísticas iniciales
INSERT INTO system_stats (fecha, tipo, valor, metadatos) VALUES
(CURRENT_DATE, 'usuarios_activos_mes', 0, '{"descripcion": "Usuarios con acceso en los últimos 30 días"}'),
(CURRENT_DATE, 'matches_mes', 0, '{"descripcion": "Matches creados en el mes actual"}'),
(CURRENT_DATE, 'servicios_publicados_mes', 0, '{"descripcion": "Servicios publicados en el mes actual"}'),
(CURRENT_DATE, 'busquedas_mes', 0, '{"descripcion": "Búsquedas realizadas en el mes actual"}'),
(CURRENT_DATE, 'pagos_aprobados_mes', 0, '{"descripcion": "Pagos aprobados en el mes actual"}'),
(CURRENT_DATE, 'notificaciones_enviadas_dia', 0, '{"descripcion": "Notificaciones enviadas hoy"}'),
(CURRENT_DATE, 'push_notifications_enviadas_dia', 0, '{"descripcion": "Push notifications enviadas hoy"}'),
(CURRENT_DATE, 'suscripciones_activas', 0, '{"descripcion": "Total de suscripciones activas"}'),
(CURRENT_DATE, 'calificaciones_mes', 0, '{"descripcion": "Calificaciones realizadas en el mes actual"}'),
(CURRENT_DATE, 'chats_activos_mes', 0, '{"descripcion": "Chats con actividad en el mes actual"}')
ON CONFLICT (fecha, tipo) DO NOTHING;

-- Comentarios
COMMENT ON TABLE system_stats IS 'Estadísticas diarias del sistema para monitoreo y análisis';
COMMENT ON COLUMN system_stats.fecha IS 'Fecha de la estadística';
COMMENT ON COLUMN system_stats.tipo IS 'Tipo de estadística (usuarios_activos_mes, matches_mes, etc.)';
COMMENT ON COLUMN system_stats.valor IS 'Valor numérico de la estadística';
COMMENT ON COLUMN system_stats.metadatos IS 'Información adicional sobre la estadística en formato JSON';