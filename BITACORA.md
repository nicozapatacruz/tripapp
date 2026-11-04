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

- Logo de Journest: una "j" cursiva trazada como ruta punteada. El punto
  rojo es el origen; el palo baja por el eje central del ícono; tras la
  curva inferior la salida pasa por detrás del palo, y sus guiones se
  adelgazan y desvanecen hasta un avión de papel (el destino). Partió de una
  imagen de Gemini y se terminó a mano en SVG. Fuente: `design/logo_svg.py`
  → `design/journest-logo.svg`; íconos con `design/make_icons.py`.
- La app pasa a llamarse **Journest** (journey + nest: el "nido" donde se
  guarda y ordena todo el viaje). Se descartaron decenas de nombres por
  estar tomados en el rubro (Trippin, Tripster, Periplo, Voyara, Routiq…)
  o por limitar el mercado al español (Trayecta, Rutalia). En la web no
  apareció nada llamado Journest; falta búsqueda formal de marca y
  registrar dominio si se quiere publicar.
- Como todavía no había datos reales guardados, se renombró también lo
  interno: base IndexedDB `journest` (antes `nuestra-ruta`) e identificador
  de copias `journest`. Las copias con `app:"nuestra-ruta"` se siguen
  importando. El repo y la URL siguen siendo `tripapp`.
- Fase 2 (copia protegida) implementada, falta probarla en el iPhone:
  - Exportar "Copia completa" o "Solo itinerario" (sin documentos, códigos,
    precios ni preferencias del dispositivo como tema/moneda).
  - Contraseña opcional (mín. 8 caracteres): AES-GCM 256 con clave
    PBKDF2-SHA256 de 600.000 iteraciones, cifrado en el teléfono.
  - En iPhone se guarda con la hoja de compartir ("Guardar en Archivos");
    queda "Descargar" como alternativa.
  - Importar pide la contraseña si la copia está cifrada y deja elegir
    "Todo", "Solo documentos" (no toca el itinerario) o "Solo itinerario".
  - Las copias v1 (formato original) se siguen importando igual.
  - Lógica en `src/backup.js`, con tests (`npm test`, vitest).
- Orden decidido: Fase 2 (copia cifrada) antes que Supabase. Nicolas
  empieza a cargar documentos reales ya, en la app instalada; la DB tal
  como está planeada no guarda archivos, así que el respaldo de los PDFs es
  la copia. Regla nueva en CLAUDE.md: ningún cambio puede perder datos
  locales ni romper la importación de copias viejas.
- Primer commit y primer deploy OK: la app está publicada en
  https://nicozapatacruz.github.io/tripapp/ (Pages con Source: GitHub
  Actions). Probada en la Mac con `npm run dev`.
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
