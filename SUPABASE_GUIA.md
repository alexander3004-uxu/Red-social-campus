# 🚀 Guía de Configuración de Supabase - Red Social Campus

Este proyecto ya está 100% preparado para conectarse a **Supabase** tanto desde el **Frontend (React)** como desde el **Backend (Express / PostgreSQL)**.

---

## 📂 Archivos creados y configurados

1. **Frontend Client**: [`src/lib/supabase.ts`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/src/lib/supabase.ts)
   - Cliente oficial `@supabase/supabase-js` para React/Vite.
   - Incluye helpers para autenticación, verificación de configuración y subida de archivos/imágenes a Supabase Storage.

2. **Backend Service**: [`server/services/supabase.js`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/server/services/supabase.js)
   - Cliente de Supabase para el servidor Node.js/Express con soporte para `service_role` o `anon_key`.

3. **Esquema de Tablas SQL**: [`server/models/schema.sql`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/server/models/schema.sql)
   - Script SQL completo para crear todas las tablas (`users`, `profiles`, `auth_providers`, `user_sessions`).

4. **Variables de Entorno**: [`.env`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/.env) y [`.env.example`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/.env.example)

---

## 🔑 Dónde pegar tus credenciales en el archivo `.env`

Abre el archivo [`.env`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/.env) y sustituye los valores en esta sección:

```env
# ==============================================================================
# SUPABASE CONFIGURATION
# ==============================================================================
# 1. URL del Proyecto (Supabase -> Project Settings -> API -> Project URL)
VITE_SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"

# 2. Anon Public Key (Supabase -> Project Settings -> API -> Project API keys -> anon public)
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Service Role Key (Opcional para backend: Supabase -> Project Settings -> API -> service_role)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Cadena de conexión PostgreSQL (Supabase -> Project Settings -> Database -> Connection String -> URI)
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
ENABLE_POSTGRES="true"
```

---

## ⚡ Pasos rápidos para inicializar en Supabase

1. **Crear las tablas**:
   - Entra al dashboard de tu proyecto en Supabase.
   - Ve a **SQL Editor** -> **New query**.
   - Pega el contenido de [`server/models/schema.sql`](file:///c:/Users/QUANT_CHELSEA/Documents/TRABAJOS%20DE%20UNIVERSIDAD%202026/Red-social-campus/server/models/schema.sql) y haz clic en **Run**.

2. **Pegar las claves**:
   - Pega tu URL, Anon Key y Connection String en el archivo `.env`.

3. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```
