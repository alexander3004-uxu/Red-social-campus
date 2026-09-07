-- ==============================================================================
-- RED SOCIAL CAMPUS - SCHEMA DDL (POSTGRESQL)
-- Módulo: Comunicación e Interacción en Tiempo Real
-- ==============================================================================

-- Extensiones necesarias (UUIDs rápidos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Conversaciones (Directas o Grupales: Materias, Carreras, Market)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    name VARCHAR(150),                          -- Opcional en chats directos, obligatorio en grupos
    entity_type VARCHAR(30) CHECK (entity_type IN ('materia', 'carrera', 'club', 'market', 'general')),
    entity_id VARCHAR(100),                     -- Ej: 'calc101', 'ing_sistemas'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Participantes de Conversación
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    last_read_message_id UUID,
    unread_count INT DEFAULT 0,
    is_muted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_conversation_user UNIQUE (conversation_id, user_id)
);

-- 3. Mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'file', 'image', 'system')),
    metadata JSONB DEFAULT '{}'::jsonb,         -- Metadatos: { fileName, fileSize, mimeType, url, duration }
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Notificaciones Persistentes
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,                      -- Usuario destinatario
    actor_id UUID,                              -- Usuario que originó el evento
    type VARCHAR(50) NOT NULL,                  -- 'POST_COMMENT', 'USER_MENTION', 'COURSE_ANNOUNCEMENT', etc.
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    entity_type VARCHAR(30),                    -- 'post', 'comment', 'course', 'market'
    entity_id VARCHAR(100),
    data JSONB DEFAULT '{}'::jsonb,             -- Payload extra (deep links, avatares, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ÍNDICES ESTRATÉGICOS PARA CONSULTAS DE BAJA LATENCIA (PAGINACIÓN POR CURSOR)
-- ==============================================================================

-- Paginación por cursor de mensajes: SELECT * FROM messages WHERE conversation_id = $1 AND created_at < $cursor ORDER BY created_at DESC LIMIT $limit
CREATE INDEX IF NOT EXISTS idx_messages_cursor 
ON messages (conversation_id, created_at DESC, id DESC);

-- Búsqueda de chats activos de un usuario
CREATE INDEX IF NOT EXISTS idx_participants_user 
ON conversation_participants (user_id, conversation_id);

-- Bandeja de entrada de notificaciones no leídas con cursor temporal
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications (user_id, is_read, created_at DESC);

-- Búsqueda rápida de salas por entidad académica (ej. materia:calc101)
CREATE INDEX IF NOT EXISTS idx_conversations_entity 
ON conversations (entity_type, entity_id);
