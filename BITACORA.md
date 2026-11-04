# Bitácora

Registro corto de lo que se fue haciendo/decidiendo, para no depender de que
la conversación con Claude se acuerde sola. No es la lista de pendientes —
eso vive en `PENDIENTES.md`. Acá solo entra lo YA hecho/decidido.

Reglas:
- Una entrada corta por cosa (fecha + qué + por qué, si no es obvio). El
  detalle técnico vive en los comentarios del código.
- Más reciente arriba de todo.
- No se borra nada — si algo cambia, se anota una entrada nueva.

---

## 2026-11-04

- Repo `nicozapatacruz/tripapp` creado y hecho **público**, para poder usar
  GitHub Pages gratis. Ciudades y fechas del viaje quedan visibles en el
  código; documentos, códigos y precios no (viven solo en el teléfono).
- El artifact de Claude.ai (`Nuestra Ruta.html`, un solo archivo) se pasó a
  proyecto Node con Vite, igual que Evenly: `index.html` + `src/app.js` +
  `src/styles.css`. El código de la app no cambió.
- PWA con `vite-plugin-pwa` (`autoUpdate`): instalable en iPhone y abre sin
  internet. Fuente Onest empaquetada con `@fontsource-variable/onest` en vez
  de Google Fonts (solo se precargan los subconjuntos latinos).
- Íconos nuevos: ruta punteada con los colores de las ciudades
  (`public/icons/`).
- Publicación automática en GitHub Pages con
  `.github/workflows/deploy.yml` (copiado de Evenly, sin variables de
  Supabase por ahora).
- `Nuestra Ruta.html` original se borra (no se versiona): todo su contenido
  ya vive en `index.html` + `src/`.
- Hosting: se descartó Cloudflare Pages (era para tener repo privado) al
  hacer el repo público.
