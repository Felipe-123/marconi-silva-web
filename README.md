# Marconi Silva Arquitectos · sitio web

Sitio estático de una sola página (`index.html`) con navegación por secciones:
Inicio, El estudio, Casas, Proyectos a distancia y Contacto. Las fotos están en `img/`.

## Ver en tu computadora

```bash
npm install
npm start
```

Abrí http://localhost:3000

## Publicar en Railway

1. En Railway: **New Project → Deploy from GitHub repo** y elegí este repositorio.
2. Railway detecta Node, instala `serve` y corre `npm start`, que escucha en el puerto que Railway asigna (`PORT`).
3. En el servicio: **Settings → Networking → Generate Domain** para tener una URL pública, o agregá el dominio propio.

## Para completar

Los textos entre corchetes `[ ]` son datos que faltan: WhatsApp, correo, dirección,
y ubicación, año y m² de cada casa. Las casas están en el array `casas` dentro de `index.html`.
