# Shelf - Sistema de Inventario

Un sistema de gestión de inventario desarrollado con React, TypeScript y Supabase.
Esta guía describe cómo ejecutar la aplicación localmente (incluyendo la configuración de Supabase) y cómo desplegarla.

## Estructura del proyecto

- `src/components/` - Componentes de React
- `src/contexts/` - Contextos de React
- `src/hooks/` - Hooks personalizados
- `src/lib/` - Configuración de librerías (cliente de Supabase)
- `src/types/` - Definiciones de tipos TypeScript

---

## Ejecutar localmente (guía completa)

Estos pasos asumen que trabajas en Windows con PowerShell.

### Requisitos

- Node.js v18+ y npm
- Git
- Una cuenta en Supabase (https://app.supabase.com)

### Instalación y ejecución (PowerShell)

Abre PowerShell en la carpeta del proyecto y ejecuta para descargar las librerias necesarias:

```powershell
npm install
```

### Configurar Supabase y aplicar la migración

El proyecto incluye una migración SQL en `supabase/migrations/20250624152120_twilight_canyon.sql`.

Opciones para aplicar la migración:

- Método rápido (recomendado para empezar):
	1. Inicia sesión o crea una cuenta en https://app.supabase.com y crea un nuevo proyecto.
	2. Ve a tu nuevo proyecto y de ahí selecciona "SQL Editor".
	3. Abre el archivo `supabase/migrations/20250624152120_twilight_canyon.sql` localmente, copia su contenido y pégalo en el editor SQL de Supabase.
	4. Ejecuta la consulta para crear las tablas/esquema.

Después de aplicar la migración, en la consola de Supabase podrás ver las tablas creadas (products, suppliers, sales, etc.).

### Variables de entorno

La aplicación usa las siguientes variables de entorno (con el prefijo VITE):

- `VITE_SUPABASE_URL` — URL pública de tu proyecto Supabase (ej. `https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — Anon key (clave pública) de Supabase (Project Settings → API KEYS)

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido

```env
VITE_SUPABASE_URL=https:(tu-project-ref).supabase.co

(sin los parentesis)

VITE_SUPABASE_ANON_KEY=tu-anon-key

### Problemas comunes

- `Missing Supabase environment variables`: verifica nombres y que `.env` esté cargado. Vite sólo injecta variables que empiezan por `VITE_`.
- Errores al aplicar la migración: revisa la versión de Postgres del proyecto y el SQL, usa la consola SQL de Supabase para detectar mensajes detallados.

---

## Tecnologías utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React
