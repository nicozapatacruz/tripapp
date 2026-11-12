# Pendientes

Lista viva. Al resolver algo, se saca de acá y se anota en `BITACORA.md`.
El viaje empieza el **27 de diciembre de 2026**.

## Ahora · Detalles de funcionamiento y estética

Antes de seguir con las fases 3 y 4, Nicolas quiere pulir la app.

1. [ ] Bug: al pegar un enlace corto de Google Maps (maps.app.goo.gl) en un
       evento o en Qué ver / Comer no sale el aviso de "enlace corto" que sí
       sale en los documentos.
2. [ ] Revisar las fichas de detalle de evento y de Qué ver: a Nicolas no
       le convencen del todo. Capturas del 12 nov, guardadas en Descargas
       como "Imagen X" (evento "Test") e "Imagen Y" (Museo del Prado).
       Ideas en las capturas:
       - Evento: el aviso "Sin ubicar: el enlace es corto…" es un párrafo
         largo arriba. El bloque del día ("Mar 29 dic · Madrid / Sin hora")
         queda flojo al final.
       - Qué ver: el 27 dice "8020 km de Aeropuerto José María Córdova
         (MDE)". Las distancias no deberían usar puntos de otra ciudad o
         país.
3. [ ] Ideas del mapa, sin decidir:
   - Agrupar los puntos cercanos cuando el mapa está alejado (un círculo
     con el número de sitios que se abre al acercarse). Hoy, en "Todo el
     viaje", los sitios de una ciudad quedan uno encima del otro.
   - Botón "Guardar dónde estoy": guarda la ubicación del GPS (exacta, sin
     Google Maps) y pregunta qué es: un sitio para ver, un restaurante, una
     tienda, un parking, el hotel… Hoy los sitios solo son Qué ver y Comer;
     tienda o parking pedirían un tipo nuevo (decidir si va como "Otros" o
     con tipos propios).
4. [ ] Técnico, para más adelante (de la revisión completa del 11 nov):
   - Patrón `oldVersion` en `onupgradeneeded` para futuras migraciones.
   - Cifrado: normalizar la contraseña (NFC) para que la misma escrita en
     otro teléfono siempre abra la copia.
   - Dos pestañas abiertas a la vez se pisan los cambios.

### Para acordarse

- Google Cloud (el mapa) está en **prueba gratuita** (300 USD ≈ 269 € de
  crédito): no cobra y no deja poner límites diarios. Termina hacia el
  **8 feb 2027** (90 días desde el 10 nov), después del viaje. Desde
  entonces el mapa deja de funcionar hasta activar la cuenta completa; si
  se quiere seguir usando, activarla y poner límites diarios de ~500 por
  servicio.

### Diseño del mapa (acordado con Nicolas, 10 nov)

Para planear el orden de cada día y no alejarse de los puntos de traslado.

- **Barra de abajo** solo con íconos (hecho); se añade "Mapa" (ícono del
  mapa doblado) como quinto botón. Si se aprieta, Ajustes pasaría a un
  engranaje en la cabecera de Ruta.
- **Pestaña Mapa** con modos Mapa | Lista (botón arriba a la derecha).
  - Día fuera de los filtros, con ‹ ›: Todo el viaje / Hoy (durante el
    viaje) / un día.
  - Filtros en una hoja (botón con puntito si hay algo filtrado):
    Logística (Hoteles, Traslados, Otros documentos) y Planes (Qué ver,
    Comer, Estado). Por defecto se esconde "Ya fui".
  - **Plan del día** (ver bitácora 10 nov): numerado; lo que tiene hora no
    se mueve, lo sin hora se arrastra; línea punteada en el mapa.
  - Puntos con el color e ícono de su tipo. "Todo el viaje" encuadra
    España (sin Medellín). Botones "estoy aquí" y "encuadrar".
- **Un día concreto**: sus documentos con ubicación (numerados ①②③ los
  que tienen hora, en el orden del día; el hotel sin número) + los sitios
  de Qué ver y Comer de sus ciudades (sin número, salen todos los días en
  esa ciudad).
- **Eventos vinculados a un lugar**: al crear un evento con el 📅+ de un
  sitio de Qué ver / Comer, el evento recuerda el lugar (campo nuevo
  opcional en el evento). Ese sitio sale en el mapa solo los días de sus
  eventos (con número si tiene hora), no todos los días de la ciudad; en
  "Todo el viaje" sale siempre. Los eventos creados a mano sin lugar no
  salen en el mapa.
- **Tarjeta al tocar un punto**: nombre y tipo; distancia al hotel del día
  y, si hay traslado, a la estación, con tiempo a pie de Google ("18 min a
  pie"); sin internet, estimado ("≈ 20 min a pie · estimado en línea recta,
  sin internet"). Selector de estado. Documentos: título y "Ver ficha".
  Botones "Cómo llegar" (ruta en Google Maps) y "Abrir en Maps".
- **Modo Lista**: mismos puntos y filtros, agrupados por ciudad; tocar una
  fila abre el mapa centrado con su tarjeta. Grupo "Sin ubicar" al final
  para corregir. Reemplaza "Direcciones guardadas", que sale del todo de
  Ajustes.
- **Desde cada día**: ícono de mapa en la barra fija del día (junto a "Día
  X de Y") que abre el mapa filtrado en ese día; ‹ vuelve al día.
- **Sin internet** (plan B en todo lo que dependa de la red; también se
  trata como sin internet si una petición a Google falla, p. ej. wifi de
  hotel sin acceso):
  - El mapa no carga → aviso "Sin internet: el mapa no se puede mostrar"
    con botón "Ver como lista".
  - Tiempo a pie → estimado, avisando que lo es.
  - Sitio nuevo sin coordenadas → queda "Pendiente de ubicar" y se ubica
    solo al volver la conexión.
  - "Cómo llegar" / "Abrir en Maps" → abren Google Maps (usa sus mapas
    descargados).


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
  Al crear cada trayecto, preguntar el medio (Avión, Tren, Bus, Coche o
  "Aún no lo sé"). Hoy el medio está escrito a mano en el itinerario y,
  sin él, la app propone siempre tren. Con "Aún no lo sé", el formulario
  del billete no marca ningún tipo; los tramos después de una parada
  siguen proponiendo el tipo del tramo anterior.
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
