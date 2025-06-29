-- Tabla de logs de seguridad
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_security_logs_usuario_id ON security_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

-- Agregar campos de seguridad a la tabla usuarios si no existen
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS ultima_ip INET,
ADD COLUMN IF NOT EXISTS ultimo_user_agent TEXT,
ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP WITH TIME ZONE;

-- Comentarios
COMMENT ON TABLE security_logs IS 'Registro de eventos de seguridad del sistema';
COMMENT ON COLUMN security_logs.event_type IS 'Tipo de evento: login, logout, suspicious_device, failed_login, etc.';
COMMENT ON COLUMN security_logs.details IS 'Detalles adicionales del evento en formato JSON';
COMMENT ON COLUMN usuarios.ultima_ip IS 'Última dirección IP desde la que se conectó el usuario';
COMMENT ON COLUMN usuarios.ultimo_user_agent IS 'Último User-Agent utilizado por el usuario';
COMMENT ON COLUMN usuarios.intentos_fallidos IS 'Número de intentos de login fallidos consecutivos';
COMMENT ON COLUMN usuarios.bloqueado_hasta IS 'Fecha hasta la que el usuario está bloqueado por intentos fallidos';