/* Lugares guardados: enlaces de Google Maps, ciudad de cada lugar, sugerencias
 * y conflictos de nombre. Lógica pura (sin DOM) para poder probarla.
 *
 * Reglas acordadas:
 *  - Un enlace pegado manda: escribir el nombre nunca lo reemplaza ni lo borra.
 *  - El enlace se puede pegar antes o después del nombre (se detecta dentro del texto).
 *  - Cada lugar guardado pertenece a una o varias ciudades (según el día de su
 *    documento) y solo se sugiere en documentos de esas ciudades.
 *  - Solo se vincula solo cuando hay UNA coincidencia posible; si hay varias, se pregunta.
 *  - No puede haber dos lugares con el mismo nombre y distinto enlace en la misma ciudad.
 */

const MAPS_RE = /https?:\/\/(?:(?:[a-z0-9-]+\.)*google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.apple\.com|g\.co\/kgs)[^\s<>"']*/i;

export function isMapsUrl(v) {
  const s = String(v || "").trim();
  const m = s.match(MAPS_RE);
  return !!m && m.index === 0 && m[0].length === s.length;
}

/** Busca un enlace de Maps dentro del texto. → {url, rest} (rest = el texto sin el enlace) */
export function extractMapsUrl(text) {
  const s = String(text || "");
  const m = s.match(MAPS_RE);
  if (!m) return { url: "", rest: s };
  const url = m[0].replace(/[.,;)]+$/, "");
  const rest = (s.slice(0, m.index) + " " + s.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
  return { url, rest };
}

export function normName(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Ciudades a las que pertenece una ubicación. null = sin ciudad conocida (documento
 * de "todo el viaje"): se cruza con cualquiera.
 * ctx: {type, slot, transport, stops, sleep, legFrom, legTo, legFroms, legTos, detected, chosen}
 *  legFroms / legTos: orígenes y destinos de los tramos del día (si aún no se eligió el
 *  trayecto, la salida solo puede ser un origen y la llegada un destino).
 *  chosen: ciudad elegida a mano; solo cuenta si está entre las posibles.
 */
export function slotCities(ctx) {
  const base = baseCities(ctx);
  if (ctx.chosen && base && base.length > 1 && base.indexOf(ctx.chosen) >= 0) return [ctx.chosen];
  return base;
}

function baseCities(ctx) {
  const { type, slot, transport, stops, sleep, legFrom, legTo, legFroms, legTos, detected } = ctx;
  if (!stops || !stops.length) return detected ? [detected] : null;
  if (type === "hotel") return sleep ? [sleep] : detected ? [detected] : stops.slice();
  if (transport) {
    const leg = slot === 2 ? legTo : legFrom;
    if (leg) return [leg];
    if (detected) return [detected];
    const ends = slot === 2 ? legTos : legFroms;
    if (ends && ends.length) return ends.slice();
  }
  return detected ? [detected] : stops.slice();
}

/** ¿Hay que preguntar en qué ciudad está? (día con varias ciudades y sin pistas) */
export function needsCityChoice(ctx) {
  // se calcula sin la elección, para seguir mostrando las opciones y poder cambiarla
  const c = baseCities(ctx);
  return !!c && c.length > 1;
}

/** Ciudades entre las que se pregunta (las del día). */
export function cityChoices(ctx) {
  return baseCities(ctx) || [];
}

/** Ciudad detectada que no corresponde al día (aviso, no bloquea). */
export function cityMismatch(ctx) {
  const { detected, stops, sleep } = ctx;
  if (!detected || !stops || !stops.length) return null;
  if (stops.indexOf(detected) >= 0 || detected === sleep) return null;
  return detected;
}

export function overlaps(a, b) {
  if (!a || !b) return true;
  return a.some((x) => b.indexOf(x) >= 0);
}

/**
 * Coincidencias de nombre en las mismas ciudades.
 * index: [{name, url, cities, docId}]
 * q: {name, url, src, cities, docId, noAuto}
 *  src "link" = el usuario pegó el enlace (manda).
 * → {kind, options}
 *   kind: "none" | "same" | "auto" | "ambiguous" | "conflict"
 *   options: lugares existentes con ese nombre (uno por enlace distinto)
 */
export function resolvePlace(index, q) {
  const key = normName(q.name);
  if (!key) return { kind: "none", options: [] };
  const seen = {};
  const options = [];
  index.forEach((r) => {
    if (!r.url || r.docId === q.docId || normName(r.name) !== key || !overlaps(r.cities, q.cities)) return;
    if (seen[r.url]) {
      seen[r.url].cities = union(seen[r.url].cities, r.cities);
      return;
    }
    seen[r.url] = { name: r.name, url: r.url, cities: r.cities ? r.cities.slice() : null };
    options.push(seen[r.url]);
  });
  if (q.src === "link" && q.url) {
    if (seen[q.url]) return { kind: "same", options };
    return options.length ? { kind: "conflict", options } : { kind: "none", options };
  }
  if (q.noAuto || !options.length) return { kind: "none", options };
  return options.length === 1 ? { kind: "auto", options } : { kind: "ambiguous", options };
}

function union(a, b) {
  if (!a || !b) return null;
  const o = a.slice();
  b.forEach((x) => { if (o.indexOf(x) < 0) o.push(x); });
  return o;
}

/**
 * Direcciones guardadas para mostrarlas (Ajustes → Direcciones guardadas): una por
 * (nombre, enlace), con los documentos que la usan y la unión de sus ciudades.
 * index: [{name, url, cities, docId}] (solo las de documentos, sin las sugerencias fijas)
 * → [{name, url, cities, docIds}] en el orden en que aparecen
 */
export function savedPlaces(index) {
  const by = {};
  const out = [];
  index.forEach((r) => {
    if (!r.name) return;
    const key = normName(r.name) + "|" + (r.url || "");
    const g = by[key];
    if (!g) {
      by[key] = { name: r.name, url: r.url || "", cities: r.cities ? r.cities.slice() : null, docIds: [r.docId] };
      out.push(by[key]);
      return;
    }
    g.cities = union(g.cities, r.cities);
    if (g.docIds.indexOf(r.docId) < 0) g.docIds.push(r.docId);
  });
  return out;
}

/** "Casa" → "Casa 2" (o el primer número libre) en esas ciudades. */
export function freeName(index, name, cities, docId) {
  const base = String(name || "").trim().replace(/\s+\d+$/, "");
  for (let i = 2; i < 100; i++) {
    const cand = base + " " + i;
    const taken = index.some((r) => r.docId !== docId && normName(r.name) === normName(cand) && overlaps(r.cities, cities));
    if (!taken) return cand;
  }
  return base + " " + Date.now();
}

/**
 * Sugerencias para un campo: lugares de esas ciudades, uno por (nombre, enlace).
 * Si un nombre se repite con enlaces distintos, la etiqueta lleva la ciudad: "Casa (Madrid)".
 * cityName(id) → nombre visible.
 * → [{label, name, url, cities}]
 */
export function placeSuggestions(index, cities, docId, cityName) {
  const groups = {};
  const order = [];
  index.forEach((r) => {
    if (!r.name || r.docId === docId || !overlaps(r.cities, cities)) return;
    const key = normName(r.name);
    if (!groups[key]) { groups[key] = []; order.push(key); }
    const g = groups[key];
    const same = g.filter((x) => x.url === r.url)[0];
    if (same) { same.cities = union(same.cities, r.cities); return; }
    // un mismo nombre sin enlace no compite con uno que sí lo tiene
    if (!r.url && g.length) return;
    if (r.url) { const blank = g.findIndex((x) => !x.url); if (blank >= 0) g.splice(blank, 1); }
    g.push({ name: r.name, url: r.url || "", cities: r.cities ? r.cities.slice() : null });
  });
  const out = [];
  order.forEach((key) => {
    const g = groups[key];
    if (g.length === 1) { out.push(Object.assign({ label: g[0].name }, g[0])); return; }
    const used = {};
    g.forEach((x, i) => {
      const where = x.cities ? x.cities.map(cityName).join(" y ") : "";
      let label = x.name + " (" + (where || i + 1) + ")";
      if (used[label]) label = x.name + " (" + (where ? where + " " : "") + (i + 1) + ")";
      used[label] = 1;
      out.push(Object.assign({ label }, x));
    });
  });
  return out;
}
