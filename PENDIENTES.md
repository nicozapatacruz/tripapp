# Pendientes

Lista viva. Al resolver algo, se saca de acá y se anota en `BITACORA.md`.
El viaje empieza el **27 de diciembre de 2026**.

## Ahora · Detalles de funcionamiento y estética

Antes de seguir con las fases 2 y 3, Nicolas quiere pulir la app.

## Mejoras acordadas

- [ ] Vuelo / tren / bus: campos "Aerolínea" (o "Compañía") y "N.º de vuelo
      / tren". Sin campo Título: se genera solo, p. ej. "Iberia · Madrid →
      Pamplona". Hoteles, entradas y otros conservan el Título.
- [ ] Llegada con "Mismo día / Día siguiente" (horas locales, como "15:00
      +1"); se pone sola en "Día siguiente" si la llegada es antes que la
      salida. Si el vuelo cruza la noche, esa noche es en el avión y no se
      pide hotel; si llega el mismo día, se pide hotel (hoy el 27 dic está
      fijo como noche en el avión).
- [ ] Calendario: al tocar algo, abrir una ficha de solo lectura con botón
      "Editar".

## Fase 2 · Copia protegida (en pausa)

Implementada (ver bitácora). Pausada el 5 nov hasta terminar los detalles.
Falta probar en el iPhone, con la app instalada:
- [ ] Exportar copia completa con contraseña → "Guardar en Archivos" en
      iCloud Drive.
- [ ] Importarla de vuelta: contraseña incorrecta avisa; la correcta abre.
- [ ] "Solo documentos" no cambia eventos/listas/estados.
- [ ] Exportar "Solo itinerario" e importarlo en otro teléfono.
- [ ] Copia grande (varios PDFs): que no se cuelgue al cifrar.

## Fase 3 · Compartir con Supabase (en pausa; idea original: 20 nov – 15 dic)

- [ ] Esquema aparte dentro del proyecto de Supabase actual (ver cómo está
      armado en Evenly: `src/lib/supabaseClient.js`).
- [ ] Sincronizar itinerario y fichas de documentos (sin archivos, códigos
      ni precios).
- [ ] Enlaces de edición / solo ver para los otros 2, revocables.
- [ ] Cola de cambios pendientes sin internet.
- Plan B si no da el tiempo: compartir el "solo itinerario" exportado.
- Quizás: función en Supabase que "abra" los enlaces cortos de Maps
  (maps.app.goo.gl) y devuelva el enlace largo con nombre y coordenadas.
  Así la ciudad se detecta sola (casi nunca habría que preguntar "¿Dónde
  está?") y el aviso de "parece estar en otra ciudad" funcionaría con
  enlaces del iPhone. Ojo con las páginas de consentimiento de Google.

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
- Editar la ruta: excursiones de un día (Madrid → Toledo → Madrid), cambiar
  cuántas noches se queda en cada ciudad, etc. Hasta entonces, vuelo/tren/
  bus solo se pueden poner en días con traslado. Cuando exista, el aviso
  "Este día no tiene traslados" llevará al final un enlace "Editar ruta".
- V2: crear lugares y sugerencias con IA.
- Más tests a medida que la lógica salga de `src/app.js` (hoy un solo IIFE)
  a módulos como `src/backup.js`.
