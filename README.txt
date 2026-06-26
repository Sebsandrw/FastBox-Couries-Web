# FastBox Courier

Proyecto web académico sobre envíos e importaciones por peso.

## Estructura de carpetas

```text
FastBox_Courier_Corregido/
├── index.html                 # Página de inicio
├── pages/                     # Pantallas internas
│   ├── bitacora.html
│   ├── catalogo.html
│   ├── contacto.html
│   ├── login.html
│   ├── panel-admin.html
│   ├── panel-cliente.html
│   ├── planes.html
│   ├── rastreo.html
│   ├── registrar-paquete.html
│   └── tarifas.html
└── assets/
    ├── css/style.css          # Diseño y adaptación para celular
    ├── js/data.js             # Datos simulados y localStorage
    ├── js/app.js              # Funciones del sitio
    └── img/                   # Logo e ilustraciones
```

## Cómo abrir

1. Descomprimir el archivo ZIP.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Ejecutar `index.html` con Live Server o abrirlo en el navegador.

## Credenciales de prueba

- Cliente: `cliente@fastbox.com` / `Cliente123`
- Administrador: `admin@fastbox.com` / `Admin123`

## Bitácora

La página `pages/bitacora.html` muestra las acciones registradas.

Se guardan, por ejemplo:

- Inicio de sesión.
- Búsqueda de una guía.
- Producto agregado al carrito.
- Prealerta registrada.
- Cambio de estado desde administración.

FASTBOX COURIER - GUÍA RÁPIDA

1. Abrir index.html.
2. Las páginas internas están dentro de la carpeta pages.
3. Para probar la bitácora: iniciar sesión, buscar una guía, agregar un producto o registrar una prealerta.
4. Abrir pages/bitacora.html desde el menú.
5. La bitácora no tiene botón para borrar acciones.

Cliente: cliente@fastbox.com / Cliente123
Administrador: admin@fastbox.com / Admin123


Cada acción incluye fecha y hora, nombre de la acción, descripción y usuario. La interfaz no tiene opción para borrar los registros. Se guardan en `localStorage`, por lo que permanecen al navegar o recargar normalmente. Si el navegador borra manualmente todos sus datos, una aplicación real requeriría una base de datos para conservarlos.

## Responsive

El menú se adapta a tablet y celular. Los formularios, tarjetas y columnas se acomodan en una sola columna en pantallas pequeñas. Las tablas se pueden desplazar de forma horizontal cuando no hay espacio.
