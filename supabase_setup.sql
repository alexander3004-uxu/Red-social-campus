-- ==============================================================================
-- 🚀 RED SOCIAL CAMPUS - CONFIGURACIÓN INTEGRAL DE SUPABASE
-- Copia y pega este script completo en:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. EXTENSIÓN PARA GENERAR UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLA DE PERFILES DE USUARIOS (PROFILES)
-- Vinculada directamente al sistema de autenticación de Supabase (auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    university VARCHAR(150) DEFAULT 'Universidad Central (Sede Principal)',
    faculty VARCHAR(150) DEFAULT 'Facultad de Ingeniería',
    career VARCHAR(150) DEFAULT 'Ingeniería de Software',
    semester VARCHAR(50) DEFAULT '1er Semestre',
    student_id VARCHAR(50),
    reputation NUMERIC(3, 1) DEFAULT 5.0,
    social_links JSONB DEFAULT '[]'::jsonb,
    profile_completed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para crear automáticamente el perfil cuando un usuario se registra en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, university, faculty, career, semester, profile_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Estudiante Campus'),
    COALESCE(new.raw_user_meta_data->>'university', 'Universidad Central (Sede Principal)'),
    COALESCE(new.raw_user_meta_data->>'faculty', 'Facultad de Ingeniería'),
    COALESCE(new.raw_user_meta_data->>'career', 'Ingeniería de Software'),
    COALESCE(new.raw_user_meta_data->>'semester', '1er Semestre'),
    TRUE
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 3. PUBLICACIONES (POSTS), ME GUSTA Y GUARDADOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    author_name TEXT NOT NULL,
    author_avatar TEXT DEFAULT '',
    author_tag TEXT DEFAULT 'CampusLink',
    author_tag_color TEXT DEFAULT 'bg-primary-fixed text-primary',
    time_ago TEXT DEFAULT 'Ahora',
    verified BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    pdf_attachment JSONB,
    poll JSONB,
    event JSONB,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_saves (
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- ==============================================================================
-- 4. HISTORIAS DEL CAMPUS (STORIES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    user_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    story_image TEXT NOT NULL,
    is_add BOOLEAN DEFAULT FALSE,
    time_ago TEXT DEFAULT 'Ahora',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. MERCADO UNIVERSITARIO (MARKET ITEMS & FAVORITOS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.market_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image TEXT DEFAULT '',
    faculty TEXT DEFAULT '',
    location TEXT DEFAULT '',
    rating NUMERIC(3,1) DEFAULT 5.0,
    seller TEXT NOT NULL,
    seller_avatar TEXT DEFAULT '',
    condition TEXT DEFAULT 'Excelente',
    condition_color TEXT DEFAULT 'bg-[#6ffbbe]/25 text-[#005338]',
    category TEXT DEFAULT 'General',
    is_donation BOOLEAN DEFAULT FALSE,
    is_new_today BOOLEAN DEFAULT TRUE,
    description TEXT DEFAULT '',
    seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.market_favorites (
    item_id TEXT REFERENCES public.market_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, user_id)
);

-- ==============================================================================
-- 6. COMUNIDADES Y MATERIAS (COMMUNITY GROUPS & MEMBRESÍAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category_tag TEXT DEFAULT '',
    category_color TEXT DEFAULT 'bg-primary-fixed text-primary',
    badge_tag TEXT DEFAULT '',
    description TEXT DEFAULT '',
    members_count INT DEFAULT 1,
    activity_note TEXT DEFAULT '',
    activity_icon TEXT DEFAULT 'forum',
    activity_color TEXT DEFAULT 'text-secondary',
    image TEXT DEFAULT '',
    type TEXT DEFAULT 'clubes' CHECK (type IN ('materias', 'clubes', 'carrera')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
    group_id TEXT REFERENCES public.community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- ==============================================================================
-- 7. CHATS Y MENSAJERÍA EN TIEMPO REAL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    is_online BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'general',
    badge TEXT DEFAULT '',
    badge_type TEXT DEFAULT '',
    last_message TEXT DEFAULT '',
    time TEXT DEFAULT 'Ahora',
    unread_count INT DEFAULT 0,
    product_info JSONB,
    group_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    thread_id TEXT REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('me', 'them')),
    text TEXT NOT NULL,
    time TEXT DEFAULT 'Ahora',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
DROP POLICY IF EXISTS "Perfiles públicos visibles" ON public.profiles;
CREATE POLICY "Perfiles públicos visibles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Crear o actualizar propio perfil" ON public.profiles;
CREATE POLICY "Crear o actualizar propio perfil" ON public.profiles FOR ALL USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Políticas Generales: Lectura pública y escritura para usuarios autenticados
DROP POLICY IF EXISTS "Posts lectura libre" ON public.posts;
CREATE POLICY "Posts lectura libre" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Posts escritura autenticados" ON public.posts;
CREATE POLICY "Posts escritura autenticados" ON public.posts FOR ALL USING (auth.role() = 'authenticated' OR true);

DROP POLICY IF EXISTS "Post likes libre" ON public.post_likes;
CREATE POLICY "Post likes libre" ON public.post_likes FOR ALL USING (true);

DROP POLICY IF EXISTS "Post saves libre" ON public.post_saves;
CREATE POLICY "Post saves libre" ON public.post_saves FOR ALL USING (true);

DROP POLICY IF EXISTS "Stories lectura libre" ON public.stories;
CREATE POLICY "Stories lectura libre" ON public.stories FOR ALL USING (true);

DROP POLICY IF EXISTS "Market items libre" ON public.market_items;
CREATE POLICY "Market items libre" ON public.market_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Market favs libre" ON public.market_favorites;
CREATE POLICY "Market favs libre" ON public.market_favorites FOR ALL USING (true);

DROP POLICY IF EXISTS "Community groups libre" ON public.community_groups;
CREATE POLICY "Community groups libre" ON public.community_groups FOR ALL USING (true);

DROP POLICY IF EXISTS "Group memberships libre" ON public.group_memberships;
CREATE POLICY "Group memberships libre" ON public.group_memberships FOR ALL USING (true);

DROP POLICY IF EXISTS "Chats libre" ON public.chat_threads;
CREATE POLICY "Chats libre" ON public.chat_threads FOR ALL USING (true);

DROP POLICY IF EXISTS "Messages libre" ON public.chat_messages;
CREATE POLICY "Messages libre" ON public.chat_messages FOR ALL USING (true);

-- ==============================================================================
-- 9. HABILITAR TIEMPO REAL (SUPABASE REALTIME)
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.posts,
      public.stories,
      public.market_items,
      public.community_groups,
      public.chat_threads,
      public.chat_messages;
  END IF;
END $$;
