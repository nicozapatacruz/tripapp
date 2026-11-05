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

## 2026-11-05

- Tercera ronda de pruebas:
  - Bug: el 27 (día de inicio) solo tiene la pestaña Documentos y la ruta
    con "Editar paradas" vivía en General, así que una parada añadida ahí no
    se podía quitar. Ahora la ruta se ve también en Documentos ese día, y el
    formulario lista las paradas con "Quitar".
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
