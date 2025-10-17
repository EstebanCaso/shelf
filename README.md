# Shelf - Sistema de Inventario

Un sistema de gestión de inventario desarrollado con React, TypeScript y Supabase.
Es capaz de mandar de manera automatica las solicitudes de rebastecimiento que solicitas a tus proveedores mediante su correo electronico, no es necesario que tu mandes algún correo ni levantar un dedo, la aplicación lo hace todo por ti.

## Estructura del proyecto

- `src/components/` - Componentes de React
- `src/contexts/` - Contextos de React
- `src/hooks/` - Hooks personalizados
- `src/lib/` - Configuración de librerías
- `src/types/` - Definiciones de tipos TypeScript
## EJECUCION

El programa no se puede ejecutar simplemente clonando el repositorio y corriendo npm install seguido de npm start, ya que depende de APIs externas para la base de datos y, en el futuro, también de n8n.

Para acceder al programa se puede utilizar este [Link](https://shelf-sooty.vercel.app/) disponible, el proyecto fue desplegado con vercel conectado a Github.

## Tecnologías utilizadas

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React
