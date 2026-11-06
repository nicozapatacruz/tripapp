# Pendientes

Lista viva. Al resolver algo, se saca de acá y se anota en `BITACORA.md`.
El viaje empieza el **27 de diciembre de 2026**.

## Ahora · Detalles de funcionamiento y estética

Antes de seguir con las fases 2 y 3, Nicolas quiere pulir la app.


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
- Formato de copia binario (archivos sin base64, cifrado por trozos) si
  alguna vez se cargan archivos grandes: con 250 MB, iOS cierra la app por
  memoria al exportar/importar. Hoy solo se avisa (ver bitácora 6 nov).
  Retomarlo también si algún día pasa a ser app nativa: ahí se puede leer
  y escribir por trozos desde el almacenamiento.
- Editar la ruta: excursiones de un día (Madrid → Toledo → Madrid), cambiar
  cuántas noches se queda en cada ciudad, etc. Hasta entonces, vuelo/tren/
  bus solo se pueden poner en días con traslado. Cuando exista, el aviso
  "Este día no tiene traslados" llevará al final un enlace "Editar ruta".
- Pases de Wallet (.pkpass) como archivo de un documento, de respaldo. Al
  tocarlo, iOS muestra su vista de Wallet con "Agregar" (como al abrirlo en
  WhatsApp). Tres cambios: aceptar .pkpass en el selector; guardarlo con el
  tipo `application/vnd.apple.pkpass` (iOS a veces no lo trae desde
  Archivos y sin él no sale la vista de Wallet); textos "Abrir pase" y "PDF,
  foto o pase de Wallet". Primero probar en el iPhone que esa vista sale
  desde la app web. No se puede abrir un pase concreto de Wallet con un
  enlace (Apple no lo permite).
- V2: crear lugares y sugerencias con IA.
- Más tests a medida que la lógica salga de `src/app.js` (hoy un solo IIFE)
  a módulos como `src/backup.js`.

## Si algún día es app nativa

- Notificaciones antes de un vuelo o evento, que al tocarlas abran la ficha
  con el documento. (En la app web también se podría, pero necesita un
  servidor que las mande; se decidió esperar a la app nativa.) Las
  "Actividades en vivo" de la pantalla bloqueada, como las de las
  aerolíneas, solo existen en apps nativas.
- Copias de seguridad por trozos desde el almacenamiento (ver "Formato de
  copia binario" en la Fase 5).
