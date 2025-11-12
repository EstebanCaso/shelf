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

- Node.js v18 o superior
- Git
- Una cuenta en Supabase (https://app.supabase.com)

---

### Instalación y ejecución (PowerShell)

Abre PowerShell en la carpeta del proyecto y ejecuta el siguiente comando para instalar las dependencias:

```powershell
npm install
```

---

### Configurar Supabase y aplicar la migración

El proyecto incluye una migración SQL en `supabase/migrations/20250624152120_twilight_canyon.sql`.

**Pasos para aplicar la migración:**

1. Inicia sesión o crea una cuenta en https://app.supabase.com y crea un nuevo proyecto.
2. Una vez dentro de tu proyecto, abre la pestaña "SQL Editor".
3. Abre el archivo `supabase/migrations/20250624152120_twilight_canyon.sql` localmente, copia su contenido y pégalo en el editor SQL de Supabase.
4. Ejecuta la consulta para crear las tablas y el esquema.

Después de aplicar la migración, podrás ver las tablas creadas (products, suppliers, sales, etc.) en la consola de Supabase.

### Variables de entorno

La aplicación usa las siguientes variables de entorno (con el prefijo VITE):

- `VITE_SUPABASE_URL` — URL pública de tu proyecto Supabase (ej. `https:<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — Anon key (clave pública) de Supabase (Project Settings → API KEYS)

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido

```
VITE_SUPABASE_URL=https:aqui-tu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```
 --- 

### Ejecutar la aplicación

Una vez configuradas las variables, ejecuta:

```powershell
npm run dev
```

Luego, abre el navegador y visita la URL mostrada en la consola (por defecto http://localhost:5173).

### Problemas comunes

- **Missing Supabase environment variables**:
  Verifica que las variables del archivo `.env` estén escritas correctamente y que el archivo está en la raíz del proyecto. Vite sólo injecta variables que empiezan por `VITE_`.
- **Errores al aplicar la migración:**
  Revisa la versión de Postgres del proyecto y el SQL, usa la consola SQL de Supabase para detectar mensajes detallados.

---

## Tecnologías utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React
