import { describe, it, expect } from "vitest";
import { coordsOf, distKm, walkMin, distText, minText, placeDays, planOrder, planNumbers } from "../mapdata.js";

const ATOCHA = "https://www.google.com/maps/place/Estaci%C3%B3n+de+Madrid+Puerta+de+Atocha/@40.4069141,-3.6923449,17z/data=!3m1!4m6!3m5!1s0x0:0x1!8m2!3d40.4064905!4d-3.6909091!16zL20vMDFyYmxx";

describe("coordenadas del enlace", () => {
  it("prefiere las del lugar (!3d!4d) a las del centro de la vista (@)", () => {
    expect(coordsOf(ATOCHA)).toEqual([40.4064905, -3.6909091]);
  });
  it("solo @ o ?q=", () => {
    expect(coordsOf("https://www.google.com/maps/@40.41,-3.70,15z")).toEqual([40.41, -3.7]);
    expect(coordsOf("https://maps.google.com/?q=37.39,-5.98")).toEqual([37.39, -5.98]);
  });
  it("enlaces cortos o búsquedas por nombre: sin coordenadas", () => {
    expect(coordsOf("https://maps.app.goo.gl/AAAA1111")).toBeNull();
    expect(coordsOf("https://www.google.com/maps/search/?api=1&query=Casa%20Lucio%2C%20Madrid")).toBeNull();
    expect(coordsOf("")).toBeNull();
  });
});

describe("distancia y tiempo a pie estimado", () => {
  it("Atocha → Puerta del Sol ≈ 1,6 km, ≈ 26 min", () => {
    const km = distKm([40.4065, -3.6909], [40.4169, -3.7035]);
    expect(km).toBeGreaterThan(1.4);
    expect(km).toBeLessThan(1.8);
    expect(distText(km)).toMatch(/^1,[5-7] km$/);
    expect(walkMin(km)).toBeGreaterThan(20);
    expect(walkMin(km)).toBeLessThan(30);
  });
  it("textos", () => {
    expect(distText(0.34)).toBe("340 m");
    expect(distText(12.4)).toBe("12 km");
    expect(minText(45)).toBe("45 min");
    expect(minText(70)).toBe("1 h 10 min");
    expect(minText(120)).toBe("2 h");
    expect(walkMin(0)).toBe(1);
  });
});

describe("qué días sale un sitio y numeración", () => {
  it("con eventos vinculados, solo esos días; si no, todos los de la ciudad", () => {
    const madrid = ["2026-12-28", "2026-12-29", "2026-12-30"];
    expect(placeDays(madrid, [])).toEqual(madrid);
    expect(placeDays(madrid, ["2026-12-29"])).toEqual(["2026-12-29"]);
  });
  it("sin orden guardado: lo que tiene hora por hora, lo que no, al final", () => {
    const o = planOrder([
      { k: "cena", t: "21:00" }, { k: "sol", t: "" }, { k: "tren", t: "08:08" }, { k: "museo", t: "11:00" },
    ], null);
    expect(o.map((x) => x.k)).toEqual(["tren", "museo", "cena", "sol"]);
  });
  it("lo sin hora queda donde lo dejó el usuario, entre los que tienen hora", () => {
    const items = [
      { k: "tren", t: "08:08" }, { k: "museo", t: "11:00" }, { k: "cena", t: "21:00" },
      { k: "sol", t: "" }, { k: "granvia", t: "" }, { k: "pza", t: "" },
    ];
    const saved = ["pza", "tren", "sol", "granvia", "museo", "cena"];
    expect(planOrder(items, saved).map((x) => x.k)).toEqual(["pza", "tren", "sol", "granvia", "museo", "cena"]);
  });
  it("lo que tiene hora no se mueve aunque el orden guardado diga otra cosa; lo nuevo va al final", () => {
    const items = [{ k: "a", t: "10:00" }, { k: "b", t: "09:00" }, { k: "x", t: "" }, { k: "nuevo", t: "" }];
    // "a" pasó a tener hora 10:00 (antes iba primero): x sigue detrás de "a"
    expect(planOrder(items, ["a", "x", "b"]).map((i) => i.k)).toEqual(["b", "a", "x", "nuevo"]);
    // si el de hora al que seguía ya no existe, se queda detrás del anterior que sí exista
    expect(planOrder([{ k: "b", t: "09:00" }, { k: "x", t: "" }], ["b", "borrado", "x"]).map((i) => i.k)).toEqual(["b", "x"]);
  });
  it("numeración: un mismo punto toma el número de su primera aparición", () => {
    expect(planNumbers([{ pid: "tren" }, { pid: "sol" }, { pid: "tren" }, { pid: "cena" }])).toEqual({ tren: 1, sol: 2, cena: 3 });
    // sin lugar en el mapa (pid vacío): también numerado, por su clave
    expect(planNumbers([{ pid: "sol", k: "e:1" }, { pid: "", k: "e:2" }, { pid: "cena", k: "e:3" }])).toEqual({ sol: 1, "e:2": 2, cena: 3 });
  });
});
