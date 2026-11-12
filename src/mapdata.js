/* Mapa: lógica pura (sin DOM) para poder probarla.
 *  - Coordenadas sacadas de los enlaces de Google Maps.
 *  - Distancia y tiempo a pie estimado (sin internet).
 *  - Qué días sale un sitio y orden/numeración del plan de un día.
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

const tmOf = (t) => (/^\d{1,2}:\d{2}$/.test(t || "") ? Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]) : null);

/** Plan de un día: items [{k, t, ...}] (k = clave estable, t = "HH:MM" o vacío) y `saved`, las
 *  claves en el último orden que dejó el usuario.
 *  - Lo que tiene hora va siempre en orden de hora: no se puede mover.
 *  - Lo que no tiene hora va detrás del elemento con hora que tenía antes en `saved` (o al
 *    principio si no tenía ninguno delante), en el orden de `saved`.
 *  - Lo que no está en `saved` (nuevo), al final. */
export function planOrder(items, saved) {
  const sv = Array.isArray(saved) ? saved : [];
  const timed = items.map((x, i) => ({ x, i })).filter((o) => tmOf(o.x.t) != null)
    .sort((a, b) => tmOf(a.x.t) - tmOf(b.x.t) || a.i - b.i).map((o) => o.x);
  const isTimed = {};
  timed.forEach((x) => { isTimed[x.k] = 1; });
  const anchor = {}, pos = {};
  let last = "";
  sv.forEach((k, i) => {
    if (isTimed[k]) last = k;
    else if (!(k in anchor)) { anchor[k] = last; pos[k] = i; }
  });
  const groups = {}, tail = [];
  items.forEach((x) => {
    if (isTimed[x.k]) return;
    if (x.k in anchor) (groups[anchor[x.k]] = groups[anchor[x.k]] || []).push(x);
    else tail.push(x);
  });
  Object.keys(groups).forEach((a) => groups[a].sort((p, q) => pos[p.k] - pos[q.k]));
  const out = (groups[""] || []).slice();
  timed.forEach((t) => { out.push(t); (groups[t.k] || []).forEach((x) => out.push(x)); });
  return out.concat(tail);
}

/** Números del plan ordenado: un mismo punto (pid) toma el de su primera aparición; lo que no
 *  tiene lugar en el mapa, el suyo (por su clave k). → {pid o k: número} */
export function planNumbers(order) {
  const out = {};
  let n = 0;
  // lo que no tiene lugar (pid vacío) también lleva número, por su clave
  // cada paso del plan lleva su número; un sitio al que se vuelve (Atocha al llegar y al salir) se queda con el primero
  order.forEach((x) => { const id = x.pid || x.k; n++; if (out[id] == null) out[id] = n; });
  return out;
}
/* Pasos del plan en el mismo lugar (a menos de sameKm: Atocha de un billete y de un evento, o dos eventos con el
   mismo enlace) van en un solo pin: el del primer paso, con los demás números en el circulito. Los otros pines de
   ese lugar no se dibujan (quedarían debajo). Devuelve { id del pin: [números] } y "skip" para los que sobran. */
export function pinGroups(plan, shown, sameKm = 0.03) {
  const gs = [], out = {};
  plan.forEach((x, i) => {
    if (!x.p || !x.p.ll || !shown(x.p)) return;
    let g = gs.find((g) => distKm(g.ll, x.p.ll) < sameKm);
    if (!g) { g = { ll: x.p.ll, nums: [], ids: [] }; gs.push(g); }
    g.nums.push(i + 1);
    if (g.ids.indexOf(x.p.id) < 0) g.ids.push(x.p.id);
  });
  gs.forEach((g) => { out[g.ids[0]] = g.nums; g.ids.slice(1).forEach((id) => { out[id] = "skip"; }); });
  return out;
}
