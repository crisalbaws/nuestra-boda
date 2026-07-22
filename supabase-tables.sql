-- ============================================
-- SCRIPT SQL PARA CREAR TABLAS EN SUPABASE
-- Boda Confirmación - Karla & Alex
-- ============================================

-- 1. TABLA: wedding (Configuración de la boda)
CREATE TABLE IF NOT EXISTS wedding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner1_name TEXT NOT NULL,
    partner2_name TEXT NOT NULL,
    date TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: guests (Invitados)
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    encrypted_id TEXT NOT NULL UNIQUE,
    confirmed BOOLEAN DEFAULT FALSE,
    plus_ones INTEGER DEFAULT 0,
    dietary_restrictions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_encrypted_id ON guests(encrypted_id);
CREATE INDEX IF NOT EXISTS idx_guests_confirmed ON guests(confirmed);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE wedding ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Política para wedding: permitir lectura y escritura a todos (para admin)
CREATE POLICY "Allow all access to wedding" ON wedding
    FOR ALL USING (true) WITH CHECK (true);

-- Política para guests: permitir lectura y escritura a todos (para admin)
CREATE POLICY "Allow all access to guests" ON guests
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DATOS DE EJEMPLO (Opcional - descomenta si necesitas)
-- ============================================

-- Insertar configuración de boda
-- INSERT INTO wedding (partner1_name, partner2_name, date, location)
-- VALUES ('Karla', 'Alex', '15 de Diciembre, 2024', 'Hacienda San Miguel');

-- Insertar invitados de ejemplo
-- INSERT INTO guests (name, phone, plus_ones) VALUES
-- ('María García', '5512345678', 2),
-- ('Juan Pérez', '5523456789', 1),
-- ('Ana López', '5534567890', 0);
