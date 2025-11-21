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

**Configuración de N8N**

1. Crear una prueba gratuita con algún correo que no se utilice mucho de preferencia
2. Crear un nuevo proyecto
3. Pegar esto:

{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "replenishment-webhook",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        96,
        48
      ],
      "id": "38a1b769-1e77-441c-9d6e-e394b3abb335",
      "webhookId": "93f54aa7-acc6-4a6d-a1c4-4591fb68eec4"
    },
    {
      "parameters": {
        "functionCode": "// --- FUNCIONES AUXILIARES ---\n\nfunction findPayload(items) {\n  for (const it of items) {\n    const json = it.json || {};\n\n    if (json.body && (json.body.requests || json.body.type)) return json.body;\n    if (json.requests) return json;\n\n    if (typeof json.body === 'string') {\n      try {\n        const parsed = JSON.parse(json.body);\n        if (parsed && parsed.requests) return parsed;\n      } catch (e) {}\n    }\n  }\n  return null;\n}\n\n// --- INICIO ---\n\nconst payload = findPayload(items);\n\nif (!payload) {\n  return [\n    {\n      json: {\n        error: \"No se encontró payload con requests.\"\n      }\n    }\n  ];\n}\n\nconst requests = Array.isArray(payload.requests) ? payload.requests : [];\n\nconst profile = payload.profile || {};\nconst profileName = profile.name || null;\nconst profileAddress = profile.address || null;\n\nconst products = [];\n\n// --- NORMALIZACIÓN ---\nfor (const req of requests) {\n  const product = req.product || {};\n  const supplier = req.supplier || {};\n\n  products.push({\n    request_id: req.id || null,\n    product_id: product.id || null,\n    product_name: product.name || null,\n    requested_quantity: Number(req.quantity ?? 0),\n    supplier_id: supplier.id || null,\n    supplier_name: supplier.name || null,\n    supplier_email: supplier.email || null,\n    supplier_phone: supplier.phone || null,\n    profile_name: profileName,\n    profile_address: profileAddress,\n    requested_at: req.requested_at || null\n  });\n}\n\n// --- AGRUPAR POR PROVEEDOR ---\nconst suppliers = {};\n\nfor (const p of products) {\n  const key = p.supplier_email || p.supplier_id || \"unknown\";\n\n  if (!suppliers[key]) {\n    suppliers[key] = {\n      supplier_email: p.supplier_email,\n      supplier_id: p.supplier_id,\n      supplier_name: p.supplier_name,\n      supplier_phone: p.supplier_phone,\n      profile_name: p.profile_name,\n      profile_address: p.profile_address,\n      products: []\n    };\n  }\n\n  suppliers[key].products.push({\n    product_name: p.product_name,\n    requested_quantity: p.requested_quantity,\n    product_id: p.product_id,\n    request_id: p.request_id\n  });\n}\n\nconst output = {\n  suppliers: Object.values(suppliers)\n};\n\nreturn [\n  {\n    json: output\n  }\n];\n"
      },
      "name": "GroupBySupplier",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        336,
        48
      ],
      "id": "88b4c62e-806f-4c0e-8ae7-98f31eff8b2d"
    },
    {
      "parameters": {
        "sendTo": "={{ $json.suppliers[0].supplier_email }}",
        "subject": "Buen día!",
        "message": "={{ $json.suppliers[0].profile_name }}<br><br>\nQuiero solicitar los siguientes productos para el local ubicado en {{ $json.suppliers[0].profile_address }}:<br><br>\n{{ $json.suppliers[0].products.map(p => \"• \" + p.requested_quantity + \" × \" + p.product_name).join(\"<br>\") }}<br><br>\nMuchas gracias!\n",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        544,
        48
      ],
      "id": "e3f9c132-f6cc-40b3-92b4-7acdb9a77cc1",
      "name": "Send a message",
      "webhookId": "9fd91e0a-df83-48c3-9bba-ffce08765732",
      "credentials": {
        "gmailOAuth2": {
          "id": "",
          "name": ""
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "GroupBySupplier",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "GroupBySupplier": {
      "main": [
        [
          {
            "node": "Send a message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "dc4083c2033a634bd4efaf0b814ee63908ed13f6973e3c9140141301a8fcc771"
  }
}

4. En el nodo de gmail iniciar sesión con cuenta de google developer con GMAIL API habilitado

### Variables de entorno

La aplicación usa las siguientes variables de entorno (con el prefijo VITE):

- `VITE_SUPABASE_URL` — URL pública de tu proyecto Supabase (ej. `https:<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — Anon key (clave pública) de Supabase (Project Settings → API KEYS)
- `VITE_N8N_WEBHOOK_URL` — Webhook URL de n8n para automatización

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido

```
VITE_SUPABASE_URL=https:aqui-tu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_N8N_WEBHOOK_URL=tu-webhook-url

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
