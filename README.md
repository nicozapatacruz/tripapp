# Journest

Organizador de viajes: ruta por etapas, detalle de cada día, calendario y documentos.
App web instalable en el iPhone que funciona sin internet. Hoy tiene cargado el viaje del 27 dic 2026 al 17 ene 2027.
Empezó como un artifact de Claude.ai de un solo archivo, con el nombre "Nuestra Ruta".

Todo lo que se guarda (documentos, códigos, estados) vive **solo en el teléfono**, en IndexedDB.
En este repositorio (público) solo están el código y el itinerario.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (normalmente http://localhost:5173/tripapp/).

Tests:

```bash
npm test
```

Build de producción:

```bash
npm run build
npm run preview
```

## Estructura

```
index.html               Página principal (markup base)
src/app.js               Lógica, datos del itinerario y almacenamiento local
src/backup.js            Copias de seguridad: formato, cifrado e importación
src/__tests__/           Tests (vitest)
src/styles.css           Estilos
public/icons/            Íconos de la app
vite.config.js           Vite + vite-plugin-pwa (manifest y service worker)
.github/workflows/       Publicación automática en GitHub Pages
```

## Publicación

Cada push a `main` (salvo cambios solo en `.md`) se compila y se publica en GitHub Pages con el workflow `deploy.yml`:
**https://nicozapatacruz.github.io/tripapp/**

Configuración inicial (una sola vez): en GitHub, **Settings → Pages → Source: GitHub Actions**.

Los teléfonos con la app instalada descargan la versión nueva solos, al abrir la app con internet.

## Instalar en el iPhone

1. Abre la URL en **Safari**.
2. Compartir → **Añadir a pantalla de inicio**.
3. Usa siempre la app instalada. En iPhone, sus datos están separados de Safari.
4. En Ajustes de la app: **Proteger datos del borrado**, y haz una **copia de seguridad** cada vez que añadas algo importante.
