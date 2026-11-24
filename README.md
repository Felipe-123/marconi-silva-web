# Marconi Silva Arquitectos · sitio web

Sitio en vivo: https://www.marconisilva.com

Sitio estático generado con un script de Node sin dependencias (`scripts/build.mjs`)
y servido con [`serve`](https://www.npmjs.com/package/serve) en Railway.

## Estructura

| Ruta | Qué hay |
|---|---|
| `scripts/build.mjs` | Contenido y plantillas de todas las páginas, datos para Google, sitemap y configuración del servidor |
| `src/styles.css` | Estilos del sitio |
| `src/images.json` | Tamaños de cada foto (lo usa el build para el `srcset`) |
| `public/` | Archivos que se copian tal cual: fotos en WebP/JPEG, favicon e íconos |
| `dist/` | Sitio generado (no se sube al repo; Railway lo arma en cada deploy) |

Páginas: `/`, `/estudio`, `/casas`, `/casas/<casa>`, `/proyectos-a-distancia`, `/contacto` y una 404 propia.

## Trabajar en tu computadora

```bash
npm install
npm run build
npm start
```

Abrí http://localhost:3000

## Publicar

Cada push a `main` se publica solo en Railway: instala, corre `npm run build` y después `npm start`.

## Cambios frecuentes

- **Agregar o editar una casa:** sumá la foto en `public/img/` (en los tamaños que lista `src/images.json`)
  y agregá la casa al array `casas` en `scripts/build.mjs`.
- **Textos:** están en `scripts/build.mjs`, dentro de cada `page(...)`.
