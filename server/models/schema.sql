-- ==============================================================================
-- RED SOCIAL CAMPUS - SCHEMA DDL (POSTGRESQL / SUPABASE)
-- Módulos: Autenticación, Sesiones, Gestión de Perfiles y Comunicación en Tiempo Real
-- ==============================================================================

-- Extensiones recomendadas para UUIDs y criptografía (compatibles con Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLA DE USUARIOS (USERS)
-- Identidad central del sistema, credenciales y roles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),                  -- Nullable para usuarios federados exclusivamente con Google/Microsoft
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('guest', 'student', 'professor', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,          -- Verificación de correo institucional o Google OAuth
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. TABLA DE PROVEEDORES DE AUTENTICACIÓN (AUTH_PROVIDERS)
-- Vinculación de cuentas federadas (Google, Microsoft, Local) sin duplicar usuarios
-- ==============================================================================
CREATE TABLE IF NOT EXISTS auth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'local', 'microsoft')),
    provider_user_id VARCHAR(255) NOT NULL,     -- Google 'sub' o ID federado único
    email VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,         -- Metadatos del perfil de OAuth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_provider_user UNIQUE (provider, provider_user_id)
);

-- ==============================================================================
-- 3. TABLA DE PERFILES DE USUARIO (PROFILES)
-- Información académica, biografía y personalización del campus
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,       -- @username único para menciones
    full_name VARCHAR(150) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    university VARCHAR(150) DEFAULT 'Universidad Central (Sede Principal)',
    faculty VARCHAR(150) DEFAULT 'Facultad de Ingeniería',
    career VARCHAR(150) DEFAULT 'Ingeniería de Software',
    semester VARCHAR(50) DEFAULT '1er Semestre',
    student_id VARCHAR(50),                     -- Matrícula o carnet estudiantil
    reputation NUMERIC(3, 1) DEFAULT 5.0,
    social_links JSONB DEFAULT '[]'::jsonb,     -- [{ platform: 'github', url: '...' }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. TABLA DE SESIONES Y REFRESH TOKENS (USER_SESSIONS)
-- Manejo de tokens de larga duración, invitados y revocación de acceso
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Puede asociarse a un usuario registrado o ser null para invitado
    token_hash VARCHAR(255) NOT NULL,           -- Hash SHA256 del refresh token emitido
    is_guest BOOLEAN DEFAULT FALSE,
    guest_session_id VARCHAR(100),              -- Identificador único de navegación temporal
    user_agent TEXT,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 5. MÓDULO DE COMUNICACIÓN EN TIEMPO REAL (CHATS Y MENSAJES)
-- ==============================================================================

-- Conversaciones
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    name VARCHAR(150),
    entity_type VARCHAR(30) CHECK (entity_type IN ('materia', 'carrera', 'club', 'market', 'general')),
    entity_id VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participantes de Conversación
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    last_read_message_id UUID,
    unread_count INT DEFAULT 0,
    is_muted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_conversation_user UNIQUE (conversation_id, user_id)
);

-- Mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'file', 'image', 'system')),
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notificaciones Persistentes
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    entity_type VARCHAR(30),
    entity_id VARCHAR(100),
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ÍNDICES ESTRATÉGICOS PARA CONSULTAS DE ALTA CONCURRENCIA
-- ==============================================================================

-- Búsqueda de usuarios y autenticación rápida
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Búsqueda de proveedores federados
CREATE INDEX IF NOT EXISTS idx_auth_providers_lookup ON auth_providers(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_providers_user ON auth_providers(user_id);

-- Búsqueda de perfiles y menciones
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Sesiones activas y validación de tokens
CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup ON user_sessions(token_hash, revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_guest ON user_sessions(guest_session_id);

-- Mensajería y cursor pagination
CREATE INDEX IF NOT EXISTS idx_messages_cursor ON messages (conversation_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants (user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_entity ON conversations (entity_type, entity_id);

-- ==============================================================================
-- DATOS SEMILLA INICIALES (Cuentas de demostración del Campus)
-- Contraseña por defecto: campus2026!
-- ==============================================================================
INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
VALUES 
  ('e9f4c3a2-7104-4e2b-a81f-490326071001', 'sofia.valenzuela@ucentral.edu', '$2b$10$mJ0Y8iBZP76HXZ8daZEGAuNTh7eUK.R/Yy3VEpnS/46ABK7eyIu5e', 'student', TRUE, TRUE),
  ('b1c2d3e4-5678-4901-a234-56789abcdef0', 'carlos.mendoza@ucentral.edu', '$2b$10$mJ0Y8iBZP76HXZ8daZEGAuNTh7eUK.R/Yy3VEpnS/46ABK7eyIu5e', 'professor', TRUE, TRUE),
  ('c3d4e5f6-7890-4123-b456-789012abcdef', 'admin@ucentral.edu', '$2b$10$mJ0Y8iBZP76HXZ8daZEGAuNTh7eUK.R/Yy3VEpnS/46ABK7eyIu5e', 'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, username, full_name, bio, avatar_url, university, faculty, career, semester, student_id, reputation)
VALUES 
  ('e9f4c3a2-7104-4e2b-a81f-490326071001', 'sofia.valenzuela', 'Sofía Valenzuela', 'Amante del código limpio, el café y los apuntes organizados ☕💻. Siempre dispuesta a ayudar con Algoritmos y Estructuras de Datos.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuABkwfwZU2h4Xj7V32v3SMsfEW4_188-UR3Plpr5gPSKKYyy3PxDdS6dvkKsupv2P9_3vKRAVgHHZMbvDlo2Wr8trHJBjAP_3HiTRAmgCuA48zYUMWWvbUZjqRZ_FxIDAFRClApQwpYwpSEN2VZq9dVD2jFNDolT0uIVdCFSCgGni-kZMcCDkvuT5HL8LYFwLR8j3e0PaHidohM5TN5NiTZvApORtmLLPNkXvcBu8q3HK0y8pr9okRq', 'Universidad Central (Sede Principal)', 'Facultad de Ingeniería', 'Ingeniería de Software', '6to Semestre', 'UC-2022-84912', 4.9),
  ('b1c2d3e4-5678-4901-a234-56789abcdef0', 'carlos.mendoza', 'Prof. Carlos Mendoza', 'Docente titular de Algoritmos y Estructuras de Datos. Horarios de consulta: Martes y Jueves 14:00 - 16:00.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMPCtTazJmP77sH_t1dVYaF7l3m3NGBSAJcAMUV_p1TOTfEsYkWaEDtdEHGFnY1ugXgjBrrXuUKzm3O7Q74ZKk4EDYiXjPXjijzXmd4URhNl6P18KWBVoi7rnf26lKcGO2Ov03reyFRp3JIYJT67svx1ndoZgiGzwFZu2kpPTx7BvZtoXigNOr61gV2Dr7cyOxh7YNECV_b7rCBX21EzWPbz7X8ZfavbT9B_37TV9CvMgRxPPJCe_T', 'Universidad Central (Sede Principal)', 'Facultad de Ingeniería', 'Ciencias de la Computación', 'Docente Titular', 'DOC-88319', 5.0)
ON CONFLICT (user_id) DO NOTHING;
