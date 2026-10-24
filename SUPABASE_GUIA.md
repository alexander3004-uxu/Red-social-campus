# 🚀 Guía Oficial: Autenticación y Cuentas con Supabase

Esta guía te explica cómo tener las **cuentas, correos y contraseñas guardadas en Supabase** y validar las sesiones de cada usuario en tiempo real desde Supabase.

---

## 📋 ¿Cómo funciona la arquitectura?

1. **Cuentas y Contraseñas**: Se guardan y cifran de forma nativa en el módulo **Supabase Auth** (`auth.users`).
2. **Validación de Sesiones**: Cada vez que el usuario ingresa o recarga la aplicación, **Supabase valida la sesión directamente** y refresca los tokens JWT automáticamente.
3. **Perfiles**: La información académica (nombre, carrera, universidad, semestre) se sincroniza en la tabla `public.profiles`.

---

## ⚡ Paso 1: Ejecutar el Script de Tablas en Supabase

1. Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. En el menú lateral izquierdo, haz clic en **SQL Editor**.
3. Haz clic en **New query** (o botón verde `+`).
4. Abre y copia el contenido completo del archivo [`supabase_setup.sql`](file:///c:/Users/Personal/Documents/Red-social-campus-1/supabase_setup.sql).
5. Pégalo en el editor de Supabase y haz clic en **Run** (o presiona `Ctrl + Enter`).

> Este script creará automáticamente las tablas (`profiles`, `posts`, `stories`, `market_items`, etc.), las políticas de seguridad (RLS) y el disparador automático (`handle_new_user`) que vincula cada registro de Supabase Auth con su perfil.

---

## 🔑 Paso 2: Copiar tus Credenciales de Supabase en `.env`

1. En tu proyecto de Supabase, ve a **Project Settings** (el icono de engranaje ⚙️ abajo a la izquierda).
2. Haz clic en **API** (dentro de Configuration).
3. Copia los siguientes dos valores:
   - **Project URL** (ejemplo: `https://abcdefghijklm.supabase.co`)
   - **Project API keys -> `anon` `public`** (clave larga que empieza con `eyJh...`)
4. Abre tu archivo [`.env`](file:///c:/Users/Personal/Documents/Red-social-campus-1/.env) en este proyecto y sustitúyelos:

```env
# 1. URL de tu proyecto
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_URL="https://tu-proyecto.supabase.co"

# 2. Clave anónima pública
VITE_SUPABASE_ANON_KEY="tu-anon-key-larga-aqui"
SUPABASE_ANON_KEY="tu-anon-key-larga-aqui"
```

---

## ⚙️ Paso 3: Configurar Confirmación de Correo (Recomendado para desarrollo)

Por defecto, Supabase requiere que el usuario haga clic en un enlace de correo para activar su cuenta. Para que el registro sea **inmediato**:

1. En Supabase, ve a **Authentication** (icono de candado 🔐 en el menú lateral).
2. Ve a **Providers** -> **Email**.
3. Desactiva la opción **"Confirm email"**.
4. Haz clic en **Save**.

*(De esta forma, cuando un estudiante cree una cuenta, podrá ingresar de inmediato sin esperar confirmación por correo).*

---

## 🚀 Paso 4: Iniciar la Aplicación

En tu terminal:

```bash
npm run dev
```

¡Listo! A partir de ese momento:
- Cualquier cuenta nueva se registrará en **Supabase Auth**.
- Al iniciar sesión, Supabase verificará las contraseñas.
- Si recargas la página o abres la app en otro navegador, Supabase validará la sesión activa automáticamente.
