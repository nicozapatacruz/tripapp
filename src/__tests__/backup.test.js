import { describe, it, expect } from "vitest";
import {
  APP_ID, buildBackup, encryptBackup, decryptBackup, parseBackupText, normalizeBackup,
  importPlan, itineraryKV, bytesToB64, b64ToBytes, WrongPasswordError, InvalidBackupError,
} from "../backup.js";

const kv = {
  theme: "dark",
  lastCur: "COP",
  events: [{ id: "e1", day: "2026-12-28", t: "Cena" }],
  "via:2026-12-27:0": ["Bogotá"],
  "pl:madrid:eat": [{ id: "0", n: "Casa Lucio", d: "", u: "" }],
  "r:madrid:0": 2,
};
const docs = [
  { id: "d1", dayId: "2026-12-27", type: "vuelo", title: "Vuelo", code: "ABC123", price: 950, cur: "USD", data: "data:application/pdf;base64,JVBERi0xLjQK" },
  { id: "d2", dayId: "2026-12-28", type: "hotel", title: "Hotel", code: "", data: "data:image/png;base64,iVBORw0KGgo=" },
];

describe("buildBackup", () => {
  it("copia completa incluye todo", () => {
    const b = buildBackup("full", kv, docs);
    expect(b).toMatchObject({ app: APP_ID, v: 2, kind: "full" });
    expect(b.kv).toEqual(kv);
    expect(b.docs).toEqual(docs);
  });

  it("solo itinerario: sin documentos ni preferencias del dispositivo", () => {
    const b = buildBackup("itinerary", kv, docs);
    expect(b.kind).toBe("itinerary");
    expect(b.docs).toEqual([]);
    expect(b.kv.theme).toBeUndefined();
    expect(b.kv.lastCur).toBeUndefined();
    expect(b.kv.events).toEqual(kv.events);
    expect(JSON.stringify(b)).not.toContain("ABC123");
  });

  it("no comparte la referencia del kv original", () => {
    const b = buildBackup("full", kv, docs);
    b.kv.theme = "light";
    expect(kv.theme).toBe("dark");
  });
});

describe("cifrado", () => {
  it("ida y vuelta con la contraseña correcta", async () => {
    const b = buildBackup("full", kv, docs);
    const enc = await encryptBackup(b, "una-clave-larga");
    expect(enc).toMatchObject({ app: APP_ID, v: 2, kind: "full" });
    expect(enc.kv).toBeUndefined();
    expect(enc.docs).toBeUndefined();
    const text = JSON.stringify(enc);
    expect(text).not.toContain("ABC123");
    expect(text).not.toContain("Casa Lucio");

    const parsed = parseBackupText(text);
    expect(parsed.encrypted).toBe(true);
    expect(await decryptBackup(parsed.wrapper, "una-clave-larga")).toEqual(b);
  });

  it("contraseña incorrecta → WrongPasswordError", async () => {
    const enc = await encryptBackup(buildBackup("full", kv, docs), "una-clave-larga");
    await expect(decryptBackup(enc, "otra-clave")).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it("archivo alterado → WrongPasswordError (AES-GCM detecta el cambio)", async () => {
    const enc = await encryptBackup(buildBackup("full", kv, docs), "una-clave-larga");
    const bytes = b64ToBytes(enc.data);
    bytes[10] ^= 1;
    await expect(decryptBackup({ ...enc, data: bytesToB64(bytes) }, "una-clave-larga")).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it("cada copia usa sal e IV distintos", async () => {
    const b = buildBackup("itinerary", kv, []);
    const [a, c] = await Promise.all([encryptBackup(b, "una-clave-larga"), encryptBackup(b, "una-clave-larga")]);
    expect(a.enc.salt).not.toBe(c.enc.salt);
    expect(a.enc.iv).not.toBe(c.enc.iv);
    expect(a.data).not.toBe(c.data);
  });

  it("formato de cifrado desconocido → InvalidBackupError", async () => {
    const enc = await encryptBackup(buildBackup("full", kv, docs), "una-clave-larga");
    await expect(decryptBackup({ ...enc, enc: { ...enc.enc, alg: "XYZ" } }, "una-clave-larga")).rejects.toBeInstanceOf(InvalidBackupError);
  });
});

describe("lectura de copias", () => {
  it("las copias v1 (prototipo, nombre anterior) se siguen pudiendo importar", () => {
    const v1 = { app: "nuestra-ruta", v: 1, kv, docs };
    const p = parseBackupText(JSON.stringify(v1));
    expect(p.encrypted).toBe(false);
    expect(p.backup).toEqual({ app: APP_ID, v: 2, kind: "full", kv, docs });
  });

  it("las copias nuevas usan el identificador journest", () => {
    expect(APP_ID).toBe("journest");
    expect(buildBackup("full", kv, docs).app).toBe("journest");
  });

  it("copia cifrada con el nombre anterior también se abre", async () => {
    const enc = await encryptBackup(buildBackup("full", kv, docs), "una-clave-larga");
    const legacy = { ...enc, app: "nuestra-ruta" };
    const p = parseBackupText(JSON.stringify(legacy));
    expect(p.encrypted).toBe(true);
    expect((await decryptBackup(p.wrapper, "una-clave-larga")).kv).toEqual(kv);
  });

  it("rechaza archivos que no son copias", () => {
    expect(() => parseBackupText("hola")).toThrow(InvalidBackupError);
    expect(() => parseBackupText(JSON.stringify({ app: "otra" }))).toThrow(InvalidBackupError);
  });

  it("tolera campos faltantes o raros", () => {
    const b = normalizeBackup({ app: APP_ID, kv: [], docs: [null, { id: 3 }, { id: "ok" }] });
    expect(b.kv).toEqual({});
    expect(b.docs).toEqual([{ id: "ok" }]);
  });

  it("base64 con archivos grandes (más de un bloque)", () => {
    const big = new Uint8Array(200000).map((_, i) => i % 251);
    expect(b64ToBytes(bytesToB64(big))).toEqual(big);
  });
});

describe("importPlan", () => {
  const b = buildBackup("full", kv, docs);
  it("todo", () => {
    expect(importPlan(b, "all")).toEqual({ docs, kv });
  });
  it("solo documentos no toca el itinerario", () => {
    expect(importPlan(b, "docs")).toEqual({ docs, kv: {} });
  });
  it("solo itinerario no trae documentos ni preferencias", () => {
    expect(importPlan(b, "itinerary")).toEqual({ docs: [], kv: itineraryKV(kv) });
  });
});
