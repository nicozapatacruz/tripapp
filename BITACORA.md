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

## 2026-11-06

- Llegada: no se puede bajar de lo que dicen las horas (si llega antes de
  salir, mínimo +1; con escalas, según el orden de las horas). En el mínimo
  el − se ve atenuado y al tocarlo explica por qué; también se valida al
  guardar.
- En el formulario, las imágenes adjuntas salen como botón "Abrir …", igual
  que los PDF (la miniatura ocupaba demasiado). En la ficha (modo vista) se
  deja la miniatura, útil para ver el billete o el QR.

- Quitar el archivo de un documento: una × dentro del recuadro del archivo
  (como la de las horas, sin sumar altura; primero se probó un botón debajo
  y se descartó por eso). Antes había que borrar el documento entero. Se
  aplica al guardar (sin doble toque: Cancelar lo deshace). Al tocarla, el
  recuadro queda vacío como en uno nuevo, sin "se quitará al guardar" (era
  confuso; el formulario entero ya es un borrador hasta Guardar).

- Traslados con Compañía y número en vez de Título. Vuelo/tren/bus:
  Aerolínea (o Compañía) + N.º, título automático "Iberia · Medellín →
  Madrid"; el número va debajo del título. Coche: solo Compañía ("Hertz ·
  Málaga"). Pasajero: en la Nota (para no sumar campos). Los billetes viejos
  con título escrito a mano lo conservan hasta que se les pone compañía.
- Llegada "+1": línea "Llega el jue 28 dic · +1" con − / + bajo las horas.
  Se pone sola si la llegada es antes que la salida; lo puesto a mano (p. ej.
  +2) se respeta. Se ve como "11:00 +1" en Calendario, ficha y tarjeta.
- Escalas con el mismo billete (opción B: un solo concepto, la parada). Con
  paradas, el Trayecto ofrece primero el viaje entero ("Medellín → Madrid ·
  vía Bogotá", por defecto) y luego cada tramo. Un billete del viaje entero
  cubre todos los tramos en Pendientes y lleva horario y número por tramo;
  la escala se calcula sola ("Escala en Bogotá · 2 h 55 min"). Ubicaciones:
  solo origen y destino final. Una sola Aerolínea por billete. Los días de
  los tramos intermedios se deducen por orden (sin − / + en cada hora). Al
  quitar o añadir paradas, los horarios por tramo se juntan o parten.
- La noche en el avión se calcula: un vuelo/tren/bus con llegada +1 (o +2)
  hace que esas noches no pidan hotel ni lo dejen poner ("Noche en el
  avión"). Si es una escala nocturna de 8 h o más, es "Noche de escala en
  Bogotá": no se pide hotel, pero se puede añadir. Se quitó el 27 fijo:
  sin billete con llegada +1, el 27 pide hotel en Madrid.
- Formato: campos nuevos opcionales en los documentos (company, no, hops,
  segTo, arr). Nada cambia en la base ni en las copias viejas.

- Copias grandes: se decidió avisar en vez de cambiar el formato (opción A),
  porque solo se cargan documentos del viaje (billetes y reservas de pocos
  MB). Aviso amarillo al elegir un archivo de más de 20 MB y en Exportar si
  los documentos suman más de 100 MB; al importar una copia de más de 100 MB,
  el texto de "Leyendo la copia" dice qué hacer si la app se cierra. Si algún
  día hace falta, el arreglo de verdad es un formato binario (en PENDIENTES).

- Texto de la contraseña al exportar: en dos líneas y con "Tendrás que
  exportarla de nuevo." al final.

- Exportar: sin la línea de progreso ("Preparando…" y "Cifrando…" caben en
  el botón); la línea queda solo al importar.
- Copias grandes en el iPad (252 MB): tras exportar 2 veces e importar 1, iOS
  cerró la app; y al cerrar la pantalla de Descargar, la app se recargaba
  (la hoja "se cerraba"). Causa probable: memoria. Cada archivo va en base64
  dentro del JSON y, cifrado, otra vez en base64; en el pico había varias
  copias enteras en memoria, y la copia preparada seguía en memoria después
  de cerrar la hoja. Arreglos sin cambiar el formato: se suelta la copia al
  cerrar la hoja, el archivo cifrado se arma por partes (sin otro
  JSON.stringify gigante), el base64 se hace por trozos y al importar cada
  archivo se suelta apenas se guarda. No hay riesgo de perder datos: los
  documentos se guardan de a uno y reimportar reemplaza los mismos.

- El 27 (noche en el avión) el Hotel sale deshabilitado, como vuelo/tren/
  bus en días sin traslado; al tocarlo explica "La noche del 27 es en el
  avión: no hace falta hotel…". Antes, "Añadir documento" en el 27 abría en
  Hotel y cambiaba la fecha sola al 28, lo que confundía. Si el tipo pedido
  no se puede ese día, se elige el primero disponible.

- Fase 2 probada (iPhone → iPad): copia completa cifrada (contraseña
  incorrecta avisa, la correcta abre), "Solo documentos" no toca eventos ni
  estados, "Solo itinerario" los reemplaza, y una copia de 252 MB (con un PDF
  de 150 MB) se exporta e importa bien, aunque tarda.
- Por eso, indicador de progreso (rueda + texto) en lo que tarda: "Leyendo
  la copia…" al elegir el archivo, "Descifrando…", "Cifrando…" e
  "Importando…". El conteo ("Importando documentos · 3 de 6", "Preparando
  documentos · 2 de 6") va en una línea encima de los botones, no dentro
  del botón (no cabía). Sin barra ni modal, para no saturar. Mientras
  importa, los otros botones quedan desactivados.
- Compartir: el botón queda en "Compartiendo…" hasta que iOS termina de
  guardar o enviar (con copias grandes tarda, y esa espera es de iOS: la app
  no puede mostrar nada encima de su hoja), y luego sale el toast "Listo".
- Compartir la copia ya no crea un archivo "texto" aparte: era el título que
  se pasaba a la hoja de compartir de iOS.

- Los errores de la hoja de exportar salen en rojo (un estilo de `.kv p` los
  dejaba grises). La × de las horas, sin fondo.

- Contraseña obligatoria en la copia completa (lleva códigos, precios y
  PDFs). En "Solo itinerario" sigue opcional, pero si se deja vacía sale un
  aviso amarillo ("Sin contraseña, la copia sale sin cifrar…") y el botón
  dice "Preparar copia sin cifrar". Los errores salen en la hoja, no en un
  toast. "Este teléfono" pasó a "este dispositivo" (también se usa el iPad).
  Importar no cambia: las copias sin cifrar viejas se siguen abriendo.

- Exportar copia: al prepararla se oculta "Preparar copia" (vuelve si se
  cambia el tipo o la contraseña, porque la copia ya no vale). Aviso verde de
  éxito separado de los botones, sin la línea de iCloud. Botones: Descargar a
  la izquierda y Compartir (negro) a la derecha.

- Las horas (documentos y eventos) tienen una × para borrarlas: el selector
  de hora del iPhone no permite dejarla vacía una vez puesta.
- Interruptor "Ocultar del calendario" en el formulario de documento (todos
  los tipos). Pensado para cuando se duerme en casa de un amigo: sin
  check-in ni check-out que ver. Sigue en Documentos y en el día, y un hotel
  oculto sigue contando como hotel para esas noches en Pendientes. Es un
  campo opcional nuevo (`calHide`): las copias viejas se importan igual.

- Ajustes tras probar la ficha en el iPhone: el contenido de la hoja vuelve
  a ocupar todo el ancho (con el pie fijo se encogía al contenido). Guardar
  ocupa 2/3 y Eliminar 1/3. En vuelo/tren/bus, Salida y Llegada juntan hora
  y lugar (uno debajo del otro) y se quitó el campo "Trayecto", que repetía
  el subtítulo. El botón del mapa es solo el ícono. Si el lugar se llama
  igual que el título, no se repite el nombre.
- Noches del hotel con fechas de entrada y salida, como en la reserva:
  "Noche del jue 31 dic" o "Lun 28 dic → jue 31 dic · 3 noches" (antes
  ponía la última noche en vez del día del check-out).
- Calendario: sin el tipo en el subtítulo (ya lo dice el ícono; en las
  tarjetas de Documentos, la franja de la izquierda). Lo que no tiene hora
  va sin la columna de la hora. Hora, ícono y título alineados en la misma
  línea. Hotel sin hora: el check-out arriba del todo; el check-in también,
  salvo que ese día haya un check-out con hora, y entonces va de primero en
  "Sin hora" (se llega después de salir del otro). Las dos líneas entre
  elementos venían de reutilizar sin querer la clase `.top` de la cabecera.

- Ficha de solo lectura para documentos y eventos (desde Calendario, Días y
  Documentos): arriba Cerrar, abajo Editar a todo el ancho. Muestra tipo,
  día o noches, trayecto, horas, código para copiar, precio, Maps, el
  archivo para abrirlo y la nota. Al tocar Editar: arriba Cancelar (vuelve a
  la ficha), abajo Eliminar | Guardar uno al lado del otro (Nicolas prefirió
  esto a Eliminar al final del formulario, para ahorrar altura). Al guardar
  vuelve a la ficha. Uno nuevo va directo al formulario (Cancelar / Guardar).
- Los botones de abajo de esas hojas quedan fijos (pie de la hoja), así no
  hay que bajar hasta el final del formulario para guardar. El error de
  validación sale justo encima de los botones.
- Calendario: el hotel sale como dos entradas separadas, check-in el día de
  llegada y check-out el de salida (antes el check-out solo salía si tenía
  hora). Con hora van en la línea de tiempo; sin hora, arriba del todo y sin
  la columna de la hora (como "todo el día"). Las noches del medio no salen.
- Sin zoom con dos dedos ni con doble toque: es una app. Ojo, esto también
  quita el zoom de accesibilidad de Safari (el zoom del sistema de iOS sigue).

## 2026-11-05

- Fase 1 terminada: probado en el iPhone que la app abre sin internet (con
  la versión que activa el service worker al instante) y "Proteger datos
  del borrado" responde "Datos protegidos".
- Fase 1 probada en el iPhone: PDF, códigos, Maps y márgenes OK. Sin
  internet fallaba ("FetchEvent.respondWith… Load failed"). Encontrado: con
  `injectRegister: "script-defer"` el plugin no activa `skipWaiting` ni
  `clientsClaim` (solo lo hace con "auto"), así que cada versión nueva
  quedaba en espera. Activados a mano en `vite.config.js`; falta volver a
  probar sin internet.
- Ajustes muestra la versión instalada ("Versión a1b2c3d · 5 nov, 15:40"):
  el código es el commit publicado (`GITHUB_SHA` en Actions) y la hora del
  build. Para saber si el iPhone ya tiene la última versión.
- `npm run dev` usa el puerto fijo 5180 (y `npm run preview` el 5181) para
  no chocar con Evenly, que usa el 5173.
- Deploy trabado: el commit 6e4aa63 cayó durante una falla de GitHub
  Actions y su publicación en Pages quedó colgada. Como el ID de cada
  publicación es el SHA del commit, todos los reintentos sobre ese mismo
  commit fallaban ("Timeout reached" / "Deployment cancelled"); Evenly
  publicaba normal. Se resuelve con un commit nuevo (no solo de .md).
  Anotado en `.github/workflows/deploy.yml`.
- Fases 2 y 3 en pausa: primero se pulen detalles de funcionamiento y
  estética.
- Tercera ronda de pruebas:
  - Bug: el 27 (día de inicio) solo tiene la pestaña Documentos y la ruta
    con "Editar paradas" vivía en General, así que una parada añadida ahí no
    se podía quitar. Ahora la ruta se ve también en Documentos ese día, y el
    formulario lista las paradas con "Quitar". Quitar una parada pide un
    segundo toque para confirmar ("Quitar" → "Confirmar" en rojo).
  - Probado en el iPhone por Nicolas: todo lo de ubicaciones y el formulario
    (las tres rondas). Faltan las pruebas de Fase 1 y 2.
  - Documentos: el botón "Añadir documento" del final de la lista pasa a ser
    un "+" flotante sobre la barra de navegación (como el de Evenly). Al
    llegar al final del scroll se estira hacia la izquierda y se convierte en
    "Añadir documento"; al subir vuelve a ser "+". Solo en la lista (no en
    Pendientes ni en el día, donde el botón ya está arriba).
  - Avisos informativos en azul (`--info-bg` / `--info-ink`).
  - Vuelo/tren/bus en un día cuyos tramos ya tienen billete: aviso suave
    ("Ya tienes el vuelo Málaga → Tenerife…"), sin bloquear, porque cada
    persona puede tener su propio billete. El coche no avisa.
  - El botón "Confirmar" lleva además un fondo rojo muy claro, para que se
    note que el botón cambió.
  - Todas las acciones que borran (eliminar documento, evento o lugar,
    restaurar lista, quitar parada) piden un segundo toque igual: el botón
    pasa a "Confirmar" en rojo durante 4 s. Antes decía "Toca otra vez
    para eliminar", demasiado largo para el botón.
  - Vuelo, tren y bus solo en días con traslado (botones atenuados, aviso y
    no deja guardar). El coche sigue permitido cualquier día (alquiler).
    Excursiones como Madrid → Toledo esperan a poder editar la ruta.
  - Bug: borrar el título de un documento existente no se guardaba (volvía
    el anterior). Ahora vacío = automático también al editar; se marca con
    `titleAuto` para que se regenere y el campo se vea vacío.
  - Lugares con el mismo nombre en ciudades distintas se muestran como
    "Casa (Madrid)" / "Casa (Pamplona)" en sugerencias y tarjetas.
  - Asterisco también en el Día del formulario de eventos.
  - "Todo el viaje (sin día)" en el selector de día viene de la app
    original: es para documentos que no son de un día (seguro, etc.).
- Segunda ronda de pruebas de Nicolas en el iPhone (formulario de documentos):
  - Trayecto: si el día tiene un solo tramo, queda puesto y se muestra fijo
    (sin selector), con "Añadir parada" ahí mismo: la parada se guarda en el
    itinerario y el trayecto se parte en tramos. Con varios tramos sigue el
    selector sin valor por defecto.
  - Sin trayecto elegido, la Salida solo puede ser una ciudad de origen y la
    Llegada una de destino; elegir la ciudad en "¿Dónde está?" elige el
    trayecto. Arregla que el 17 ene "Casa" se sugiriera en Llegada (Medellín).
  - El 27 dic pasa a ser "Noche en el avión" (se ve en la ruta y en el día).
    Un hotel elegido ese día empieza el 28, con aviso. Decidido: cuando se
    haga la mejora de vuelos, la llegada tendrá "Mismo día / Día siguiente"
    (horas locales, como "15:00 +1") y eso decidirá si la noche es en el
    avión.
  - Ejemplo del Título según el tipo (vuelo, tren, comida…).
  - Obligatorios con asterisco rojo; sin "(opcional)" en ningún formulario.
    Se quitó la regla "archivo, título o código": se puede guardar solo con
    tipo y día; el título sale solo ("Comida · Casa Lucio", "Vuelo · Madrid
    → Medellín" o solo el tipo).
  - El error de nombre repetido se borra al resolverlo ("Casa 2" / "Usar
    esa").
  - Con «¿Cuál es?» (Casa en Madrid y en Pamplona) ya no se pregunta además
    «¿Dónde está?».
  - "Pegar enlace" en un toque no es posible: iOS siempre pide confirmar
    "Pegar" cuando una web lee el portapapeles. Se deja así.
  - Aclarado: cada documento guarda su propia ciudad; elegir Medellín para
    "Casa" el 17 no cambia la Casa de Madrid del 28.
- Bug: a `index.html` le faltaba el elemento `#toast` (quedó fuera al separar
  el HTML original en la Fase 1), así que cada aviso emergente lanzaba un
  error de JavaScript. Restaurado. Revisado que no falte ningún otro id.
- Ubicaciones en el formulario de documentos (encontrado por Nicolas):
  - Bug: un enlace pegado se reemplazaba por el de un lugar guardado al
    escribir un nombre que coincidía ("Casa"), y se perdía al seguir
    escribiendo ("Casa P"). Ahora un enlace pegado manda: escribir nunca lo
    pisa; solo se quita con "Quitar enlace".
  - El enlace se puede pegar antes o después del nombre (se detecta dentro
    del texto) y hay un botón "Pegar enlace" que lee el portapapeles.
  - El campo Día pasa a ir justo después del Título.
  - Cada lugar guardado pertenece a la ciudad de su día (hotel: donde se
    duerme; transporte: origen/destino del tramo; resto: ciudad detectada
    por el enlace o el nombre, o la elegida). Solo se sugiere en documentos
    de esa ciudad. En días con varias ciudades, si no se puede detectar, se
    pregunta "¿Dónde está?".
  - Solo se vincula solo si hay una única coincidencia; con varias ("Casa"
    en Madrid y en Pamplona el 31 dic) se pregunta cuál.
  - Regla: no puede haber dos lugares con el mismo nombre y distinto enlace
    en la misma ciudad. Aviso con "Usar esa" / "Llamar a esta «Casa 2»", en
    cualquier orden (pegar y escribir, o escribir, quitar y pegar), y no deja
    guardar hasta resolverlo.
  - Aviso (no bloquea) si la ubicación detectada no es de la ciudad del día.
    Solo funciona con enlaces largos o nombres con pistas: los enlaces cortos
    del iPhone (maps.app.goo.gl) no traen coordenadas.
  - Lógica en `src/places.js` con tests; flujos del formulario probados en
    jsdom (`src/__tests__/locform.test.js`).

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
