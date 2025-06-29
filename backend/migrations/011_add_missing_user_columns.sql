-- Agregar columnas faltantes a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP WITH TIME ZONE;