-- ============================================================
-- SCHÉMA ADMIN NEON POSTGRESQL — PONT DES DEUX RIVES
-- ============================================================
-- Ce script est idempotent et prêt à être exécuté dans
-- la console SQL Neon ou via le script de migration.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table des utilisateurs administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin', -- 'admin' ou 'editeur'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ
);

-- 2. Table des sessions actives
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des paramètres clé/valeur
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Journal d'activité (audit log)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Médiathèque
CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_name TEXT,
    mime_type TEXT,
    size_bytes BIGINT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Colonnes d'administration pour les tables existantes
ALTER TABLE realisations ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE realisations ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

ALTER TABLE circuits ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS internal_note TEXT;

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS internal_note TEXT;

-- 7. Index
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);

-- 8. Triggers
DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON admin_users;
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated_at ON settings;
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9. Paramètres initiaux
INSERT INTO settings (key, value) VALUES
('hero_title', 'Pont des Deux Rives'),
('hero_subtitle', 'Un voyage d''apprentissage et de citoyenneté interculturelle'),
('hero_intro', 'Pont des Deux Rives, un programme de volontariat international qui allie : engagement social, découverte interculturelle, famille d''accueil et visites touristiques. Un voyage d''apprentissage et d''ouverture au monde.'),
('contact_address', 'Cité Arconville, Lot 643, Parcelle K-A2, ABOMEY-CALAVI, Bénin'),
('contact_phone_primary', '+229 01 69 74 00 00'),
('contact_phone_secondary', '+229 97 52 51 68'),
('contact_email', 'progenbenin@gmail.com'),
('cta_title', 'Prêt(e) à vivre l''expérience Pont des Deux Rives ?'),
('cta_subtitle', 'Les inscriptions pour la prochaine vague sont ouvertes. Rejoignez-nous.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
