# 🎓 CampusLink - Red Social y Plataforma Universitaria Integral

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Adapter-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

> **CampusLink** es una plataforma web y Progressive Web App (PWA) de última generación diseñada para conectar y potenciar la vida académica y social de la comunidad universitaria. Integra en un solo ecosistema: feed académico con soporte multimedia y encuestas, marketplace estudiantil seguro para compraventa y donaciones, salas de estudio colaborativo con técnica Pomodoro, mensajería instantánea en tiempo real con WebSockets y carnet estudiantil digital con código QR y validación NFC.

---

## 📑 Tabla de Contenidos

1. [Visión General y Propósito](#-visión-general-y-propósito)
2. [Características Principales](#-características-principales)
   - [1. Feed Académico & Historias](#1-feed-académico--historias)
   - [2. Marketplace Estudiantil Seguro (Campus Market)](#2-marketplace-estudiantil-seguro-campus-market)
   - [3. Salas de Estudio en Vivo y Pomodoro](#3-salas-de-estudio-en-vivo-y-pomodoro)
   - [4. Grupos y Comunidades Universitarias](#4-grupos-y-comunidades-universitarias)
   - [5. Mensajería en Tiempo Real y Presencia](#5-mensajería-en-tiempo-real-y-presencia)
   - [6. Carnet Digital NFC y QR Criptográfico](#6-carnet-digital-nfc-y-qr-criptográfico)
   - [7. Sistema de Autenticación y Modo Invitado](#7-sistema-de-autenticación-y-modo-invitado)
   - [8. Progressive Web App (PWA) y Soporte Offline](#8-progressive-web-app-pwa-y-soporte-offline)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Tecnologías Utilizadas (Tech Stack)](#-tecnologías-utilizadas-tech-stack)
6. [Instalación y Configuración](#-instalación-y-configuración)
   - [Requisitos Previos](#requisitos-previos)
   - [Paso a Paso](#paso-a-paso)
   - [Variables de Entorno](#variables-de-entorno)
7. [Scripts Disponibles](#-scripts-disponibles)
8. [Referencia de la API REST](#-referencia-de-la-api-rest)
9. [Eventos de WebSockets (Socket.io)](#-eventos-de-websockets-socketio)
10. [Modelo de Datos (Base de Datos)](#-modelo-de-datos-base-de-datos)
11. [Estrategia de Resiliencia y Fallback Local](#-estrategia-de-resiliencia-y-fallback-local)
12. [Despliegue en Producción](#-despliegue-en-producción)

---

## 🎯 Visión General y Propósito

En los entornos universitarios actuales, los estudiantes y docentes sufren por la fragmentación de canales: los grupos de WhatsApp se saturan de spam, la compra y venta de materiales académicos en redes sociales generales expone a estafas, las dudas académicas se pierden y no existe una credencial digital centralizada para servicios del campus.

**CampusLink** soluciona esta problemática proporcionando:
- **Validación Institucional**: Estudiantes, profesores y comités identificados por universidad, facultad y carrera.
- **Entorno Académico Colaborativo**: Compartición formal de apuntes en PDF, encuestas académicas y gestión de eventos de facultad.
- **Comercio Seguro y Solidario**: Intercambio de libros, batas de laboratorio, calculadoras científicas y apuntes dentro del campus con reputación visible y chat directo.
- **Productividad Integrada**: Salas de estudio con reloj Pomodoro y presencia sincrónica para evitar la procrastinación en épocas de exámenes.
- **Acceso Sin Fricción**: Capacidad de navegar como invitado (*Guest Mode*) y transformar la sesión en usuario registrado en cualquier momento sin perder contexto.

---

## 🚀 Características Principales

### 1. Feed Académico & Historias
* **Publicaciones Enriquecidas**: Compartición de apuntes, avisos de facultad, preguntas de examen y eventos universitarios.
* **Archivos PDF Integrados**: Carga y descarga de documentos de estudio con previsualizador modal en pantalla (`PdfViewerModal`) sin necesidad de lectores externos.
* **Encuestas Interactivas**: Creación y votación en tiempo real con recuento dinámico de votos y porcentajes por opción.
* **Eventos Universitarios**: Convocatorias de talleres, seminarios y conferencias con botón de confirmación de asistencia (*"Asistiré"*) y visualización de avatares de participantes.
* **Historias del Campus**: Barra superior de historias efímeras (`StoryViewerModal`) para eventos del día, anuncios del centro de estudiantes y avisos de última hora.
* **Interacciones Sociales**: Sistema de *Likes*, comentarios anidados, guardado de publicaciones y opción de compartir.

### 2. Marketplace Estudiantil Seguro (Campus Market)
* **Categorías Universitarias**: Libros y apuntes, calculadoras científicas, equipo de laboratorio (batas, guantes, instrumentos), tecnología y gadgets, mobiliario de residencia y donaciones.
* **Filtros Avanzados**: Búsqueda por facultad de procedencia, rango de precios, estado del artículo (*Nuevo*, *Como nuevo*, *Buen estado*) y categoría.
* **Donaciones & Ofertas**: Sección dedicada para estudiantes de semestres superiores que donan o traspasan materiales a compañeros recién ingresados.
* **Publicación Sencilla**: Modal para publicar artículos (`SellModal`) con carga de fotografías, selección de estado, facultad y fijación de precio o marcaje como donación.
* **Negociación Directa**: Botón para iniciar un chat instantáneo con el vendedor desde la ficha del producto (`ItemDetailModal`).

### 3. Salas de Estudio en Vivo y Pomodoro
* **Salas Sincrónicas de Estudio**: Espacios virtuales con aforo de estudiantes en línea para estudio enfocado de materias específicas.
* **Temporizador Pomodoro**: Contador regresivo sincronizado (25 minutos de enfoque / 5 minutos de descanso) con avisos de transición de ciclo.
* **Indicadores de Presencia**: Avatares y estado en vivo de los compañeros conectados en la sala.

### 4. Grupos y Comunidades Universitarias
* **Segmentación por Tipo**:
  - **Materias / Asignaturas**: Grupos de estudio dedicados a materias específicas (ej. *Cálculo Diferencial e Integral*, *Algoritmos y Estructuras de Datos*).
  - **Carreras**: Espacios para estudiantes de la misma disciplina (*Ingeniería de Software*, *Medicina*, *Derecho*).
  - **Clubes y Deportes**: Comunidades extracurriculares (*Club Devs*, *Robótica*, *Ajedrez*, *Comité Estudiantil*).
* **Membresía**: Unirse o salir de comunidades con un clic (`isJoined`), monitor de actividad reciente y conteo de miembros.

### 5. Mensajería en Tiempo Real y Presencia
* **Arquitectura WebSocket Bidireccional**: Basada en Socket.io con canalización distribuida mediante Redis Adapter.
* **Organización en Pestañas**: Canales ordenados por **Directos** (1 a 1), **Grupos** (de materias o carreras) y **Marketplace** (consultas de productos vinculadas a la ficha del ítem).
* **Estados y Presencia**:
  - Detección de conexión/desconexión multisesión.
  - Indicador de *"Escribiendo..."* en tiempo real (`typing:status`).
  - Confirmación de entrega (*Delivered*) y confirmación de lectura (*"Visto"* / *Read Receipt*).
* **Mensajes Multimedia**: Envío de texto y metadatos de archivos adjuntos.

### 6. Carnet Digital NFC y QR Criptográfico
* **Credencial Universitaria Digital (`CarnetModal`)**: Identificación oficial con fotografía del alumno, código de barras institucional y matrícula activa.
* **Código QR Criptográfico**: Para control de acceso a bibliotecas, auditorios, laboratorios de cómputo y cafetería universitaria.
* **Simulación de Llave NFC/RFID**: Token virtual para apertura de torniquetes y puertas con cerradura de proximidad.
* **Insignias y Reputación**: Reconocimiento visible de aportes a la comunidad (*Top Colaborador*, *Tutor Académico*, *100% Confiable*).

### 7. Sistema de Autenticación y Modo Invitado
* **Registro e Inicio de Sesión Tradicional**: Validación de credenciales con hashing seguro mediante `bcryptjs` (10 rondas de salt).
* **Google OAuth 2.0**: Inicio de sesión en un solo clic con vinculación automática de cuentas existentes sin duplicar registros.
* **Modo Invitado (Guest Mode)**: Permite a nuevos visitantes explorar la interfaz, consultar publicaciones, buscar productos y ver grupos sin requerir registro previo.
* **Modal de Conversión Dinámica (`GuestUpgradeModal`)**: Cuando el usuario invitado intenta realizar una acción protegida (crear un post, chatear, publicar en el mercado, votar o dar like), el sistema despliega un modal contextual para registrarse o iniciar sesión, preservando su estado.
* **Gestión de Sesiones**: Par de tokens **JWT** (Access Token de corta duración + Refresh Token con cookie HTTP-Only, `SameSite=Lax` y firma criptográfica).
* **Roles del Sistema**:
  - `guest`: Acceso de lectura pública.
  - `student`: Estudiante con acceso total a publicaciones, chat, carnet y mercado.
  - `professor`: Docente con facultades de publicación académica y tutorías.
  - `admin`: Moderación central y administración de la plataforma.

### 8. Progressive Web App (PWA) y Soporte Offline
* **Instalable como App Nativa**: Funciona en Android, iOS, Windows, macOS y ChromeOS con experiencia a pantalla completa (`display: standalone`).
* **Service Worker**: Cacheo de assets críticos para carga instantánea y disponibilidad offline básica.
* **Atajos de Aplicación (Shortcuts)**: Menú contextual desde el icono de la app para:
  - 📝 *Crear publicación* (`/?action=create_post`)
  - 💬 *Abrir mensajes* (`/?action=messages`)
  - 🛍️ *Explorar Campus Market* (`/?action=market`)
  - 🪪 *Mostrar Carnet Digital* (`/?action=carnet`)
* **Prompt de Instalación Personalizado (`PWAInstallPrompt`)**: Notificación visual animada invitando al usuario a instalar la app en su dispositivo.

---

## 🏛 Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Cliente["Cliente Frontend (PWA / Web)"]
        UI["React 19 + TypeScript + Tailwind CSS v4"]
        Ctx["AuthContext & Estado Global"]
        SockCli["SocketClient (Socket.io Client)"]
        ApiCli["ApiClient (Estrategia Network-First con Fallback)"]
        SW["Service Worker (pwaRegister)"]
        LocalStore["LocalStorage (Fallback Autónomo)"]
    end

    subgraph Servidor["Backend Express + Node.js (Puerto 4000)"]
        App["Express App (Middlewares, CORS, Cookies, Multer)"]
        AuthCtrl["Auth Controller (JWT, Bcrypt, Google OAuth)"]
        UserCtrl["Profile & User Controller"]
        NotifSvc["Notification Service"]
        SocketServer["Socket.io Server (Salas, Presencia, Mensajería)"]
    end

    subgraph Persistencia["Capa de Persistencia y Caché"]
        PG[("PostgreSQL 14+\n(schema.sql)")]
        RedisServ[("Redis Server\n(Pub/Sub Adapter & Presencia)")]
        MemDB["Almacén en Memoria / Fallback (db.js)"]
    end

    UI --> Ctx
    Ctx --> ApiCli
    Ctx --> SockCli
    ApiCli -->|HTTP REST| App
    ApiCli -.->|Si Backend no responde| LocalStore
    SockCli -->|WebSockets| SocketServer

    App --> AuthCtrl
    App --> UserCtrl
    App --> NotifSvc
    SocketServer --> NotifSvc

    AuthCtrl --> PG
    AuthCtrl -.->|Fallback| MemDB
    UserCtrl --> PG
    UserCtrl -.->|Fallback| MemDB
    SocketServer --> RedisServ
```

---

## 📁 Estructura del Proyecto

```text
Red-social-campus/
├── api/                           # Funciones Serverless para despliegues (Vercel)
│   └── index.js                   # Entry point serverless exportando app de Express
├── public/                        # Archivos estáticos y activos PWA
│   ├── favicon.svg                # Favicon en formato vectorial
│   ├── favicon.png                # Favicon 64x64
│   ├── icon-192.png / 512.png     # Iconos de aplicación PWA estándar
│   ├── maskable-icon-*.png        # Iconos adaptativos PWA para Android
│   ├── apple-touch-icon.png       # Icono de inicio para dispositivos iOS
│   ├── manifest.json              # Configuración PWA Manifest (Shortcuts, temas, colores)
│   └── sw.js                      # Service Worker para caché y soporte offline
├── server/                        # Backend Node.js / Express
│   ├── controllers/               # Controladores de lógica de negocio
│   │   ├── auth.controller.js     # Login, Registro, Google OAuth, Modo Invitado, JWT
│   │   └── profile.controller.js  # Actualización de perfil, avatares, contraseñas
│   ├── middlewares/               # Middlewares de seguridad y validación
│   │   ├── authMiddleware.js      # Verificación de JWT y roles
│   │   ├── guestMiddleware.js     # Restricción de acciones para invitados
│   │   ├── uploadMiddleware.js    # Carga de fotos de perfil mediante Multer
│   │   └── validate.js            # Validación de esquemas de datos entrantes
│   ├── models/                    # Esquemas de base de datos
│   │   └── schema.sql             # DDL relacional PostgreSQL (Tablas, índices, llaves)
│   ├── routes/                    # Enrutadores REST
│   │   ├── auth.routes.js         # Endpoints de /api/auth
│   │   └── user.routes.js         # Endpoints de /api/users
│   ├── services/                  # Servicios transversales
│   │   └── notificationService.js # Despacho híbrido de notificaciones y menciones
│   ├── app.js                     # Configuración principal de Express y CORS
│   ├── db.js                      # Capa de base de datos (PostgreSQL con fallback en memoria)
│   ├── devRunner.js               # Ejecutor simultáneo para dev (Backend + Vite)
│   ├── index.js                   # Entry point del servidor HTTP y Socket.io local
│   └── socket.js                  # Lógica de WebSockets, salas de materia y presencia
├── src/                           # Frontend React 19 + TypeScript
│   ├── components/                # Componentes de UI y Pantallas
│   │   ├── BottomNav.tsx          # Barra de navegación inferior móvil
│   │   ├── CarnetModal.tsx        # Modal del carnet estudiantil digital (QR y NFC)
│   │   ├── ChatModal.tsx          # Ventana de chat activa individual y grupal
│   │   ├── CreatePostModal.tsx    # Creador de posts (texto, encuestas, PDFs)
│   │   ├── DesktopLeftSidebar.tsx # Barra lateral izquierda para versión escritorio
│   │   ├── DesktopRightSidebar.tsx# Barra lateral derecha (salas en vivo y eventos)
│   │   ├── FeedScreen.tsx         # Pantalla principal con feed de publicaciones
│   │   ├── GruposScreen.tsx       # Pantalla de materias, carreras y clubes
│   │   ├── GuestUpgradeModal.tsx  # Modal de conversión de invitado a usuario registrado
│   │   ├── Header.tsx             # Cabecera con selector de campus, búsqueda y carnet
│   │   ├── ItemDetailModal.tsx    # Ficha detallada de artículo en venta
│   │   ├── LiveRoomModal.tsx      # Modal de sala de estudio con técnica Pomodoro
│   │   ├── LoginScreen.tsx        # Pantalla de acceso (Login, Registro, Google, Invitado)
│   │   ├── MarketScreen.tsx       # Pantalla del mercado estudiantil
│   │   ├── MensajesScreen.tsx     # Pantalla de conversaciones organizadas
│   │   ├── NotificationsModal.tsx # Panel de notificaciones recibidas
│   │   ├── PdfViewerModal.tsx     # Visor integrado de documentos PDF de apuntes
│   │   ├── PerfilScreen.tsx       # Pantalla del perfil del estudiante y edición
│   │   ├── PWAInstallPrompt.tsx   # Banner interactivo de instalación PWA
│   │   ├── SearchModal.tsx        # Buscador global en tiempo real
│   │   ├── SellModal.tsx          # Modal para publicar artículos en el marketplace
│   │   ├── StoryViewerModal.tsx   # Visor de historias del campus
│   │   └── UniversitySelectModal.tsx # Modal selector de sede / universidad
│   ├── context/                   # Contextos de React
│   │   └── AuthContext.tsx        # Estado global de usuario, token, rol y sesiones
│   ├── data/                      # Datos iniciales y mocks
│   │   └── mockData.ts            # Publicaciones, historias, salas y productos demo
│   ├── services/                  # Servicios de comunicación cliente
│   │   ├── apiClient.ts           # Cliente HTTP con fallback transparente a LocalStorage
│   │   └── socketClient.ts        # Envoltorio cliente para eventos de Socket.io
│   ├── App.tsx                    # Orquestador principal de pantallas y modales
│   ├── index.css                  # Estilos globales y directivas de Tailwind CSS
│   ├── main.tsx                   # Punto de entrada de la aplicación React
│   ├── pwaRegister.ts             # Registro y ciclo de vida del Service Worker
│   └── types.ts                   # Definición de tipos e interfaces TypeScript
├── uploads/                       # Directorio de archivos multimedia subidos localmente
├── .env.example                   # Plantilla de variables de entorno
├── index.html                     # Plantilla HTML5 con fuentes y metadatos SEO/PWA
├── package.json                   # Dependencias, scripts y configuración del proyecto
├── tsconfig.json                  # Configuración del compilador de TypeScript
├── vercel.json                    # Reglas de enrutamiento y rewrite para Vercel
└── vite.config.ts                 # Configuración del bundler Vite y plugins
```

---

## 💻 Tecnologías Utilizadas (Tech Stack)

### Frontend
| Tecnología | Versión | Propósito |
| :--- | :--- | :--- |
| **React** | 19.0.1 | Librería de interfaz de usuario reactiva y basada en componentes |
| **TypeScript** | 5.8.2 | Tipado estático estricto para alta mantenibilidad y reducción de bugs |
| **Vite** | 6.2.3 | Herramienta de compilación ultrarrápida con Hot Module Replacement (HMR) |
| **Tailwind CSS** | 4.1.14 | Framework de utilidades CSS moderno para un diseño responsivo de calidad |
| **Motion (Framer Motion)** | 12.23 | Micro-animaciones, transiciones fluidas de modales y gestos |
| **Lucide React** | 0.546 | Iconografía moderna y uniforme |
| **Socket.io Client** | 4.8.3 | Conexión WebSocket bidireccional y reactiva con el backend |
| **Google Fonts** | — | Fuentes tipográficas: *Plus Jakarta Sans* y *Material Symbols* |

### Backend
| Tecnología | Versión | Propósito |
| :--- | :--- | :--- |
| **Node.js** | 18+ | Entorno de ejecución en servidor |
| **Express** | 4.21.2 | Framework web minimalista para la API REST |
| **Socket.io** | 4.8.3 | Motor de comunicación en tiempo real para chats y salas de estudio |
| **@socket.io/redis-adapter** | 8.3.0 | Adaptador para escalabilidad horizontal de WebSockets entre múltiples instancias |
| **ioredis** | 6.0.0 | Cliente Redis de alto rendimiento para gestión de presencia y pub/sub |
| **jsonwebtoken** | 9.0.3 | Generación y verificación criptográfica de tokens JWT |
| **bcryptjs** | 3.0.3 | Hashing de contraseñas de usuarios con salting resistente a ataques |
| **cookie-parser** | 1.4.7 | Parseo y firma criptográfica de cookies HTTP-Only de sesión |
| **Multer** | 2.3.0 | Manejo multipart/form-data para subida de fotos y avatares |
| **google-auth-library** | — | Verificación de tokens de identidad de Google OAuth 2.0 |

### Persistencia y Despliegue
| Componente | Descripción |
| :--- | :--- |
| **PostgreSQL 14+** | Base de datos relacional para usuarios, sesiones, mensajes y perfiles |
| **Memoria / Local Fallback** | Mecanismo de contingencia automático cuando no hay conexión a PostgreSQL |
| **Vercel Serverless** | Despliegue listo para producción con rewrite automático vía `vercel.json` |

---

## 🛠️ Instalación y Configuración

### Requisitos Previos
1. **Node.js** v18.0.0 o superior ([Descargar Node.js](https://nodejs.org/)).
2. **npm** (incluido con Node.js), **pnpm** o **yarn**.
3. *(Opcional)* Una instancia de **PostgreSQL** y **Redis** si deseas persistencia de base de datos dedicada (el proyecto cuenta con fallback en memoria automático si no se configuran).

### Paso a Paso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/Red-social-campus.git
   cd Red-social-campus
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar el archivo de entorno**:
   Copia el archivo de ejemplo a un archivo `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Iniciar en modo desarrollo**:
   El comando `dev` ejecuta simultáneamente el servidor backend (Express + WebSockets en el puerto 4000) y el servidor cliente (Vite en el puerto 3000):
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**:
   Visita en tu navegador web:
   ```
   http://localhost:3000
   ```

---

## 🔐 Variables de Entorno

El archivo `.env` permite configurar los parámetros operativos del sistema:

| Variable | Tipo | Valor por Defecto en Ejemplo | Descripción |
| :--- | :--- | :--- | :--- |
| `PORT` | Número | `4000` | Puerto en el que escucha el servidor backend Express y Socket.io |
| `CLIENT_ORIGIN` | URL | `http://localhost:3000` | Origen permitido por la política CORS del backend |
| `JWT_SECRET` | String | *(clave secreta)* | Clave criptográfica para firmar los Access Tokens JWT |
| `JWT_REFRESH_SECRET` | String | *(clave secreta)* | Clave para firmar Refresh Tokens de sesión prolongada |
| `COOKIE_SECRET` | String | *(clave secreta)* | Clave para firmar y validar cookies seguras |
| `GOOGLE_CLIENT_ID` | String | *(client-id)* | Identificador de cliente para Google OAuth 2.0 |
| `ENABLE_REDIS` | Booleano | `false` | `true` para activar el Redis Adapter de Socket.io en alta concurrencia |
| `REDIS_URL` | URI | `redis://127.0.0.1:6379` | Cadena de conexión al servidor Redis |
| `DATABASE_URL` | URI | *(postgresql://...)* | Cadena de conexión PostgreSQL (si se omite, opera en memoria) |
| `GEMINI_API_KEY` | String | `""` | Llave de API opcional para integraciones con Google Gen AI |

---

## 📜 Scripts Disponibles

En el archivo `package.json` encontrarás los siguientes comandos:

* **`npm run dev`**: Inicia el frontend (Vite en puerto 3000) y el backend (Express en puerto 4000) de manera sincronizada mediante `server/devRunner.js`.
* **`npm run dev:client`**: Inicia exclusivamente el servidor de desarrollo de Vite en el puerto 3000 con soporte para acceso en red local (`--host=0.0.0.0`).
* **`npm run server`**: Inicia el servidor backend Node.js en modo producción.
* **`npm run server:dev`**: Inicia el servidor backend Node.js con reinicio automático al detectar cambios (`node --watch`).
* **`npm run build`**: Compila y optimiza el cliente para producción en la carpeta `dist/`.
* **`npm run preview`**: Levanta un servidor local para previsualizar la compilación de `dist/`.
* **`npm run lint`**: Ejecuta la comprobación de tipos de TypeScript sin emitir código (`tsc --noEmit`).

---

## 📡 Referencia de la API REST

Todas las rutas están disponibles bajo el prefijo `/api` (y con soporte directo `/` para compatibilidad):

### Autenticación (`/api/auth`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra una nueva cuenta estudiantil (Email, Password, Carrera, Facultad, Nombre) |
| `POST` | `/api/auth/login` | Público | Autentica a un usuario existente y devuelve el token JWT y cookie de sesión |
| `POST` | `/api/auth/google` | Público | Autenticación mediante Google ID Token con vinculación de perfil |
| `POST` | `/api/auth/guest` | Público | Crea una sesión de navegación temporal con rol `guest` |
| `POST` | `/api/auth/upgrade-guest` | Invitado | Convierte una sesión de invitado activa en una cuenta registrada formal |
| `GET` | `/api/auth/me` | Autenticado | Obtiene la información del usuario y perfil de la sesión actual |
| `POST` | `/api/auth/logout` | Autenticado | Cierra la sesión activa y revoca tokens y cookies |

### Perfiles de Usuario (`/api/users`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Autenticado | Devuelve los datos detallados del perfil propio del usuario autenticado |
| `PATCH` | `/api/users/profile` | Estudiante / Docente | Actualiza biografía, teléfono, enlaces sociales y datos académicos |
| `POST` | `/api/users/avatar` | Estudiante / Docente | Carga una imagen de perfil (`multipart/form-data`) procesada con Multer |
| `POST` | `/api/users/change-password` | Estudiante / Docente | Modificación segura de contraseña verificando la contraseña anterior |
| `GET` | `/api/users/:username` | Público / Invitado | Consulta el perfil público de cualquier estudiante por su `@username` |

### Diagnóstico del Sistema
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` o `/api/health` | Estado del servidor, versión (`2.0.0`) y marca de tiempo |

---

## ⚡ Eventos de WebSockets (Socket.io)

La comunicación en tiempo real requiere autenticación mediante token JWT en el apretón de manos inicial (`handshake.auth.token`):

### Eventos del Cliente hacia el Servidor (Emitidos)

| Evento | Parámetros (Payload) | Descripción |
| :--- | :--- | :--- |
| `room:join` | `{ roomName: string }` | Se suscribe a una sala temática o de materia (ej. `room:materia:calc101`) |
| `room:leave` | `{ roomName: string }` | Abandona la sala especificada |
| `message:send` | `{ conversationId, targetUserId, text, metadata }` | Envía un mensaje directo o a sala grupal |
| `message:ack_delivery` | `{ messageId, conversationId, senderId }` | Notifica que el mensaje fue recibido en el dispositivo del receptor |
| `message:mark_read` | `{ conversationId, lastMessageId, peerUserId }` | Confirma la lectura del mensaje (*"Visto"*) |
| `typing:start` | `{ conversationId, targetUserId, targetRoom }` | Indica que el usuario está escribiendo |
| `typing:stop` | `{ conversationId, targetUserId, targetRoom }` | Indica que el usuario dejó de escribir |

### Eventos del Servidor hacia el Cliente (Escuchados)

| Evento | Datos Recibidos | Descripción |
| :--- | :--- | :--- |
| `message:received` | `MessageData` | Notifica la llegada de un nuevo mensaje en tiempo real |
| `message:status_update` | `{ messageId, status: 'delivered' }` | Actualiza el estado de entrega del mensaje |
| `message:read_receipt` | `{ conversationId, lastMessageId, readBy }` | Actualiza el estado de lectura del mensaje |
| `typing:status` | `{ userId, userName, isTyping: boolean }` | Notificación del indicador de escritura |
| `presence:status_change`| `{ userId, status: 'online' \| 'offline' }`| Cambio del estado de conexión de un usuario |
| `notification:new` | `NotificationPayload` | Notificación emergente de mención, comentario o evento |

---

## 🗄️ Modelo de Datos (Base de Datos)

El archivo `server/models/schema.sql` define la estructura en PostgreSQL con soporte para UUIDs e integridad referencial:

1. **`users`**: Identidad central, correos únicos, hash de contraseña en bcrypt, rol institucional (`student`, `professor`, `admin`, `guest`) y estado de verificación.
2. **`auth_providers`**: Soporte federado para Google y cuentas locales, vinculando el ID único de Google (`sub`) a un usuario sin crear registros redundantes.
3. **`profiles`**: Datos del estudiante: nombre completo, `@username` único para menciones, biografía, facultad, carrera, semestre, matrícula, reputación (escala 5.0) y enlaces sociales.
4. **`user_sessions`**: Registro de tokens de larga duración (SHA256 del refresh token), identificación de sesiones de invitado (`guest_session_id`), dirección IP y fechas de expiración/revocación.
5. **`conversations` & `conversation_participants`**: Hilos directos y grupales asociados a asignaturas, clubes o productos del marketplace.
6. **`messages`**: Registro cronológico de mensajes, tipo (`text`, `file`, `image`, `system`), metadatos JSON y estado de lectura.
7. **`notifications`**: Registro persistente de notificaciones (menciones `@`, comentarios, anuncios).

---

## 🔄 Estrategia de Resiliencia y Fallback Local

**CampusLink** fue diseñado con una arquitectura **Network-First con Conmutación Local Automática** implementada en `src/services/apiClient.ts`:

1. El cliente intenta comunicarse prioritariamente con la API de Express (puerto 4000 o servidor de producción).
2. Si el servidor backend se encuentra apagado o no disponible temporalmente, el cliente intercepta la condición y **conmuta automáticamente a un almacén persistente en `LocalStorage` (`LocalAuthStore`)**.
3. Esta resiliencia garantiza que:
   - Nuevos usuarios puedan registrarse y guardar sus perfiles.
   - Las sesiones de prueba como Estudiante (`sofia.valenzuela@ucentral.edu`), Docente o Administrador funcionen de inmediato.
   - La experiencia de usuario no se rompa ni quede en blanco si se presenta una caída temporal de red.

---

## 🌐 Despliegue en Producción

### Despliegue en Vercel
El repositorio está preparado para despliegue sin configuración adicional en **Vercel**:
- El archivo `vercel.json` reescribe las rutas `/api/*` hacia la función serverless `api/index.js`, y todas las demás solicitudes estáticas hacia `index.html`.
- La función `api/index.js` importa y monta la aplicación Express modular (`server/app.js`).

### Despliegue en VPS / Servidor Linux con Node & PM2
Para desplegar la aplicación completa con WebSockets y Redis en un servidor propio:

```bash
# 1. Compilar el cliente estático
npm run build

# 2. Configurar variables de producción en .env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://usuario:password@localhost:5432/campuslink
ENABLE_REDIS=true

# 3. Iniciar el servidor backend con PM2
pm2 start server/index.js --name "campuslink-core"
```

---

## 👥 Cuentas de Demostración Disponibles

Para pruebas rápidas en entornos de desarrollo o evaluación, puedes utilizar las siguientes credenciales preconfiguradas:

| Rol | Correo Electrónico | Contraseña | Perfil Demo |
| :--- | :--- | :--- | :--- |
| **Estudiante** | `sofia.valenzuela@ucentral.edu` | `campus2026!` | Sofía Valenzuela (Ing. de Software, 6to Sem.) |
| **Docente** | `carlos.mendoza@ucentral.edu` | `campus2026!` | Dr. Carlos Mendoza (Ciencias de la Computación) |
| **Administrador** | `admin@ucentral.edu` | `campus2026!` | Administración CampusLink |
| **Invitado** | *(Botón en pantalla)* | — | Modo lectura con opción a upgrade |

---

## 📄 Licencia

Este proyecto fue desarrollado como parte de las iniciativas universitarias para la digitalización y conectividad de campus educativos. Código bajo licencia MIT. Consulte los términos para libre uso y distribución académica.
