# Pendientes

Lista viva. Al resolver algo, se saca de acá y se anota en `BITACORA.md`.
El viaje empieza el **27 de diciembre de 2026**.

## Fase 1 · Publicar la app (semana del 4 nov)

- [ ] Activar GitHub Pages: Settings → Pages → Source: GitHub Actions.
- [ ] Probar en el iPhone, con la app ya instalada: subir y abrir un PDF,
      copiar un código, enlaces de Maps, exportar/importar copia, abrir sin
      internet.
- [ ] Revisar que los márgenes del notch/barra inferior se vean bien en modo
      instalado (el CSS base heredado del contenedor de Claude.ai agrega
      padding de safe-area en `:root`).

## Fase 2 · Copia protegida (hasta ~20 nov)

- [ ] Exportar con contraseña opcional (cifrado en el teléfono).
- [ ] Importar "solo documentos", sin pisar el itinerario.
- [ ] Exportar "solo itinerario", sin archivos ni códigos.

## Fase 3 · Compartir con Supabase (20 nov – 15 dic, si da el tiempo)

- [ ] Esquema aparte dentro del proyecto de Supabase actual (ver cómo está
      armado en Evenly: `src/lib/supabaseClient.js`).
- [ ] Sincronizar itinerario y fichas de documentos (sin archivos, códigos
      ni precios).
- [ ] Enlaces de edición / solo ver para los otros 2, revocables.
- [ ] Cola de cambios pendientes sin internet.
- Plan B si no da el tiempo: compartir el "solo itinerario" exportado.

## Fase 4 · Contenido (en paralelo)

- [ ] Revisar lo escrito de memoria: Casa Lucio, El Brillante, Taberna
      Salinas, Los Diamantes, El Pimpi, Casa Lola, entre otros.
- [ ] Confirmar datos de 2026/27: precio de la Alhambra, horario de la
      Cabalgata de Reyes.
- [ ] Cargar las reservas reales.

## Antes de salir (15 – 26 dic)

- [ ] Pruebas con los 3 teléfonos.

## Fase 5 · Ideas para después

- Tipo de cambio, y "pagado/pendiente".
- Consejos, platos y horas de traslado editables.
- Mapa dentro de la app.
- V2: crear lugares y sugerencias con IA.
- Tests (vitest) cuando la lógica se separe en módulos; hoy todo vive en un
  solo IIFE en `src/app.js`.
