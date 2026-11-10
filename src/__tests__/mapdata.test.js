import { describe, it, expect } from "vitest";
import { coordsOf, distKm, walkMin, distText, minText, placeDays, numberDay } from "../mapdata.js";

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
  it("numera solo lo que tiene hora, en orden; un punto toma su primera hora", () => {
    const n = numberDay([
      { pid: "cena", t: "21:00" }, { pid: "hotel", t: "" }, { pid: "tren", t: "08:08" },
      { pid: "museo", t: "11:00" }, { pid: "tren", t: "12:00" },
    ]);
    expect(n).toEqual({ tren: 1, museo: 2, cena: 3 });
  });
});
