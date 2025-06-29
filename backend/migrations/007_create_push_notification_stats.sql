-- Tabla para estadísticas de push notifications
CREATE TABLE push_notification_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    enviadas INTEGER NOT NULL DEFAULT 0,
    exitosas INTEGER NOT NULL DEFAULT 0,
    fallidas INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT unique_user_date UNIQUE (usuario_id, fecha)
);

-- Índices para optimización
CREATE INDEX idx_push_stats_usuario_fecha ON push_notification_stats(usuario_id, fecha);
CREATE INDEX idx_push_stats_fecha ON push_notification_stats(fecha);

-- Trigger para updated_at
CREATE TRIGGER update_push_notification_stats_updated_at
    BEFORE UPDATE ON push_notification_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE push_notification_stats IS 'Estadísticas diarias de envío de push notifications por usuario';
COMMENT ON COLUMN push_notification_stats.usuario_id IS 'ID del usuario que recibió las notificaciones';
COMMENT ON COLUMN push_notification_stats.fecha IS 'Fecha de las estadísticas';
COMMENT ON COLUMN push_notification_stats.enviadas IS 'Total de notificaciones enviadas';
COMMENT ON COLUMN push_notification_stats.exitosas IS 'Notificaciones entregadas exitosamente';
COMMENT ON COLUMN push_notification_stats.fallidas IS 'Notificaciones que fallaron';