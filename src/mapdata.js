/* Mapa: lógica pura (sin DOM) para poder probarla.
 *  - Coordenadas sacadas de los enlaces de Google Maps.
 *  - Distancia y tiempo a pie estimado (sin internet).
 *  - Qué días sale un sitio y numeración por hora de un día.
 */

/** Coordenadas de un enlace de Google Maps → [lat, lng] o null.
 *  Prefiere las del lugar (!3d…!4d…) a las del centro de la vista (@lat,lng). */
export function coordsOf(url) {
  if (!url) return null;
  let s = String(url);
  try { s = decodeURIComponent(s); } catch (e) { /* enlace con % sueltos: se usa tal cual */ }
  const m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/) ||
    s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    s.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (!m) return null;
  const lat = Number(m[1]), lng = Number(m[2]);
  if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
}

/** Distancia en línea recta (km) entre dos [lat, lng]. */
export function distKm(a, b) {
  const r = Math.PI / 180, x = (b[0] - a[0]) * r, y = (b[1] - a[1]) * r;
  const h = Math.sin(x / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(y / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** Minutos a pie estimados: las calles no son rectas (×1,3) a paso normal (4,8 km/h). */
export function walkMin(km) {
  return Math.max(1, Math.round((km * 1.3) / 4.8 * 60));
}

export function distText(km) {
  if (km < 1) return Math.max(10, Math.round(km * 1000 / 10) * 10) + " m";
  return (km < 10 ? km.toFixed(1) : String(Math.round(km))).replace(".", ",") + " km";
}

export function minText(min) {
  if (min < 60) return min + " min";
  const h = Math.floor(min / 60), m = min % 60;
  return h + " h" + (m ? " " + m + " min" : "");
}

/** Días en que sale un sitio de Qué ver / Comer: los de sus eventos vinculados, o si no
 *  tiene, todos los días en su ciudad. */
export function placeDays(cityDays, eventDays) {
  return eventDays && eventDays.length ? eventDays.slice() : cityDays.slice();
}

/** Numeración de un día: items [{pid, t}] (t = "HH:MM" o vacío). Solo los que tienen hora, en
 *  orden; un mismo punto toma el número de su primera hora. → {pid: número} */
export function numberDay(items) {
  const tm = (t) => (/^\d{1,2}:\d{2}$/.test(t || "") ? Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]) : null);
  const timed = items.filter((x) => tm(x.t) != null).sort((a, b) => tm(a.t) - tm(b.t));
  const out = {};
  let n = 0;
  timed.forEach((x) => { if (out[x.pid] == null) out[x.pid] = ++n; });
  return out;
}
