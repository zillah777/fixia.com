-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Comentario
COMMENT ON FUNCTION update_updated_at_column() IS 'Función para trigger que actualiza automáticamente el campo updated_at';