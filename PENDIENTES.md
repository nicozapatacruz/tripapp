# Pendientes

Lista viva. Al resolver algo, se saca de acá y se anota en `BITACORA.md`.
El viaje empieza el **27 de diciembre de 2026**.

## Fase 1 · Publicar la app (semana del 4 nov)

- [ ] Probar en el iPhone, con la app ya instalada: subir y abrir un PDF,
      copiar un código, enlaces de Maps, exportar/importar copia, abrir sin
      internet.
- [ ] Revisar que los márgenes del notch/barra inferior se vean bien en modo
      instalado (el CSS base heredado del contenedor de Claude.ai agrega
      padding de safe-area en `:root`).

## Fase 2 · Copia protegida (hasta ~20 nov)

Implementada (ver bitácora). Falta probar en el iPhone, con la app instalada:
- [ ] Exportar copia completa con contraseña → "Guardar en Archivos" en
      iCloud Drive.
- [ ] Importarla de vuelta: contraseña incorrecta avisa; la correcta abre.
- [ ] "Solo documentos" no cambia eventos/listas/estados.
- [ ] Exportar "Solo itinerario" e importarlo en otro teléfono.
- [ ] Copia grande (varios PDFs): que no se cuelgue al cifrar.

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
- Más tests a medida que la lógica salga de `src/app.js` (hoy un solo IIFE)
  a módulos como `src/backup.js`.
