/* Copias de seguridad: armado, cifrado y lectura.
 *
 * Formatos que se pueden importar (no romper ninguno: hay copias reales guardadas):
 *  - v1 (prototipo de Claude.ai): {app:"nuestra-ruta", v:1, kv, docs}   → se trata como "full"
 *  - v2 sin cifrar:               {app:"journest", v:2, kind, kv, docs}
 *  - v2 cifrada:                  {app:"journest", v:2, kind, enc:{...}, data:"<base64>"}
 * `app` puede ser "journest" o el nombre anterior "nuestra-ruta" (LEGACY_APP_IDS).
 *    `data` es el JSON de la v2 sin cifrar, cifrado con AES-GCM 256 y una clave
 *    derivada de la contraseña con PBKDF2-SHA256. `kind` va en claro solo para
 *    poder mostrar qué tipo de copia es antes de pedir la contraseña.
 *
 * kind: "full" = documentos (con archivos) + itinerario + preferencias
 *       "itinerary" = solo itinerario (sin documentos, archivos, códigos ni precios)
 *
 * En `docs`, cada archivo va como data URL en `data` (el Blob no es serializable).
 */

export const APP_ID = "journest";
// Nombre anterior de la app: sus copias se siguen aceptando al importar.
const LEGACY_APP_IDS = ["nuestra-ruta"];
function isOurBackup(j) { return !!j && (j.app === APP_ID || LEGACY_APP_IDS.indexOf(j.app) >= 0); }
export const PBKDF2_ITER = 600000;

// Preferencias de este dispositivo: no forman parte del itinerario compartible.
const DEVICE_KEYS = ["theme", "lastCur"];
export function isDeviceKey(k) { return DEVICE_KEYS.indexOf(k) >= 0; }

export function itineraryKV(kv) {
  const out = {};
  Object.keys(kv || {}).forEach((k) => { if (!isDeviceKey(k)) out[k] = kv[k]; });
  return out;
}

/** Copia sin cifrar. `docs` ya serializados (archivo en `data`, sin `blob`). */
export function buildBackup(kind, kv, docs) {
  if (kind === "itinerary") return { app: APP_ID, v: 2, kind, kv: itineraryKV(kv), docs: [] };
  return { app: APP_ID, v: 2, kind: "full", kv: Object.assign({}, kv), docs: docs || [] };
}

/* ---------- base64 sin depender de FileReader (también corre en los tests) ---------- */
export function bytesToB64(bytes) {
  // Por trozos de tamaño múltiplo de 3 (así el base64 de cada trozo se puede pegar tal cual):
  // evita armar un texto binario del tamaño de toda la copia antes de convertirlo.
  const CH = 0x7ffe; // 32766 = 3 × 10922
  const parts = [];
  for (let i = 0; i < bytes.length; i += CH) parts.push(btoa(String.fromCharCode.apply(null, bytes.subarray(i, i + CH))));
  return parts.join("");
}
export function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ---------- cifrado ---------- */
export function cryptoAvailable() {
  return typeof crypto !== "undefined" && !!crypto.subtle && typeof crypto.getRandomValues === "function";
}

async function deriveKey(password, salt, iter) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: iter },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBackup(backup, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, PBKDF2_ITER);
  let plain = new TextEncoder().encode(JSON.stringify(backup));
  let ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  plain = null; // soltarlo antes de armar el base64 (copias grandes)
  const data = bytesToB64(ct);
  ct = null;
  return {
    app: APP_ID,
    v: 2,
    kind: backup.kind,
    enc: { alg: "AES-GCM", kdf: "PBKDF2-SHA256", iter: PBKDF2_ITER, salt: bytesToB64(salt), iv: bytesToB64(iv) },
    data,
  };
}

export class WrongPasswordError extends Error {}
export class InvalidBackupError extends Error {}

export async function decryptBackup(wrapper, password) {
  const e = wrapper.enc || {};
  if (e.alg !== "AES-GCM" || e.kdf !== "PBKDF2-SHA256" || !e.iter || !e.salt || !e.iv || typeof wrapper.data !== "string") {
    throw new InvalidBackupError("formato de cifrado desconocido");
  }
  const key = await deriveKey(password, b64ToBytes(e.salt), e.iter);
  let plain;
  try {
    plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBytes(e.iv) }, key, b64ToBytes(wrapper.data));
  } catch (err) {
    // AES-GCM verifica integridad: contraseña incorrecta o archivo alterado
    throw new WrongPasswordError("contraseña incorrecta");
  }
  return normalizeBackup(JSON.parse(new TextDecoder().decode(plain)));
}

/* ---------- lectura ---------- */
export function isEncrypted(j) { return !!(j && j.enc && typeof j.data === "string"); }

/** Valida una copia sin cifrar (v1 o v2) y la deja en forma v2. */
export function normalizeBackup(j) {
  if (!isOurBackup(j) || isEncrypted(j)) throw new InvalidBackupError("no es una copia de Journest");
  const kv = j.kv && typeof j.kv === "object" && !Array.isArray(j.kv) ? j.kv : {};
  const docs = Array.isArray(j.docs) ? j.docs.filter((d) => d && typeof d.id === "string") : [];
  const kind = j.kind === "itinerary" ? "itinerary" : "full";
  return { app: APP_ID, v: 2, kind, kv, docs };
}

/** Texto del archivo → {encrypted:true, wrapper} o {encrypted:false, backup}. */
export function parseBackupText(text) {
  let j;
  try { j = JSON.parse(text); } catch (e) { throw new InvalidBackupError("no es JSON"); }
  if (!isOurBackup(j)) throw new InvalidBackupError("no es una copia de Journest");
  if (isEncrypted(j)) return { encrypted: true, wrapper: j };
  return { encrypted: false, backup: normalizeBackup(j) };
}

/** Qué se escribe al importar según el modo elegido. */
export function importPlan(backup, mode) {
  return {
    docs: mode === "all" || mode === "docs" ? backup.docs : [],
    kv: mode === "all" ? backup.kv : mode === "itinerary" ? itineraryKV(backup.kv) : {},
  };
}
