-- ============================================
-- SCRIPT SQL COMPLETO PARA SUPABASE
-- Incluye CORS y permisos completos
-- ============================================

-- 1. CREAR TABLAS
CREATE TABLE IF NOT EXISTS wedding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner1_name TEXT NOT NULL,
    partner2_name TEXT NOT NULL,
    date TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 2. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_encrypted_id ON guests(encrypted_id);
CREATE INDEX IF NOT EXISTS idx_guests_confirmed ON guests(confirmed);

-- 3. DESHABILITAR RLS TEMPORALMENTE PARA DEBUG (luego puedes habilitarlo con políticas más restrictivas)
ALTER TABLE wedding DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS PERMISIVAS (para desarrollo)
DROP POLICY IF EXISTS "Allow all access to wedding" ON wedding;
CREATE POLICY "Allow all access to wedding" ON wedding
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to guests" ON guests;
CREATE POLICY "Allow all access to guests" ON guests
    FOR ALL USING (true) WITH CHECK (true);

-- 5. HABILITAR ANON KEY EN AUTHENTICATION
-- Ve a Authentication > Providers > Anonymous Sign-ins y habilítalo

-- 6. DATOS DE EJEMPLO (descomenta si necesitas)
-- INSERT INTO wedding (id, partner1_name, partner2_name, date, location)
-- VALUES ('test-id-123', 'Karla', 'Alex', '15 de Diciembre, 2024', 'Hacienda San Miguel');
