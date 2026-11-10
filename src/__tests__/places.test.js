import { describe, it, expect } from "vitest";
import {
  isMapsUrl, extractMapsUrl, normName, slotCities, needsCityChoice, cityChoices, cityMismatch,
  resolvePlace, freeName, placeSuggestions, savedPlaces,
} from "../places.js";

const SHORT_A = "https://maps.app.goo.gl/AAAA1111";
const SHORT_B = "https://maps.app.goo.gl/BBBB2222";
const SHORT_C = "https://maps.app.goo.gl/CCCC3333";
const cityName = (id) => ({ madrid: "Madrid", pamplona: "Pamplona", sevilla: "Sevilla", tenerife: "Tenerife" })[id];

describe("detectar el enlace en el texto", () => {
  it("solo el enlace", () => {
    expect(extractMapsUrl(SHORT_A)).toEqual({ url: SHORT_A, rest: "" });
    expect(isMapsUrl(SHORT_A)).toBe(true);
  });
  it("enlace pegado después del nombre", () => {
    expect(extractMapsUrl("Casa Pedro " + SHORT_A)).toEqual({ url: SHORT_A, rest: "Casa Pedro" });
    expect(extractMapsUrl("Casa Pedro" + SHORT_A)).toEqual({ url: SHORT_A, rest: "Casa Pedro" });
  });
  it("enlace pegado antes del nombre", () => {
    expect(extractMapsUrl(SHORT_A + " Casa Pedro")).toEqual({ url: SHORT_A, rest: "Casa Pedro" });
  });
  it("enlace largo con @coordenadas", () => {
    const u = "https://www.google.com/maps/place/Casa+Lucio/@40.4123,-3.7089,17z";
    expect(extractMapsUrl("Casa Lucio " + u).url).toBe(u);
  });
  it("texto sin enlace", () => {
    expect(extractMapsUrl("Casa")).toEqual({ url: "", rest: "Casa" });
    expect(isMapsUrl("Casa " + SHORT_A)).toBe(false);
  });
  it("normaliza nombres: mayúsculas, tildes y espacios", () => {
    expect(normName("  Casá  Pedro ")).toBe("casa pedro");
  });
});

describe("ciudad de cada ubicación", () => {
  const dec31 = { stops: ["madrid", "pamplona"], sleep: "pamplona" };
  it("día de una sola ciudad: esa ciudad", () => {
    expect(slotCities({ type: "entrada", stops: ["tenerife"], sleep: "tenerife" })).toEqual(["tenerife"]);
  });
  it("hotel: la ciudad donde se duerme", () => {
    expect(slotCities({ type: "hotel", ...dec31 })).toEqual(["pamplona"]);
  });
  it("transporte: salida = origen del tramo, llegada = destino", () => {
    const t = { type: "tren", transport: true, ...dec31, legFrom: "madrid", legTo: "pamplona" };
    expect(slotCities({ ...t, slot: 1 })).toEqual(["madrid"]);
    expect(slotCities({ ...t, slot: 2 })).toEqual(["pamplona"]);
  });
  it("entrada en día de dos ciudades, sin pistas: ambas, y se pregunta", () => {
    const c = { type: "entrada", ...dec31, detected: null };
    expect(slotCities(c)).toEqual(["madrid", "pamplona"]);
    expect(needsCityChoice(c)).toBe(true);
    expect(cityChoices(c)).toEqual(["madrid", "pamplona"]);
  });
  it("con ciudad detectada por el enlace o el nombre: esa, sin preguntar", () => {
    const c = { type: "entrada", ...dec31, detected: "pamplona" };
    expect(slotCities(c)).toEqual(["pamplona"]);
    expect(needsCityChoice(c)).toBe(false);
  });
  it("la ciudad elegida manda, y las opciones se siguen mostrando", () => {
    const c = { type: "entrada", ...dec31, chosen: "madrid" };
    expect(slotCities(c)).toEqual(["madrid"]);
    expect(needsCityChoice(c)).toBe(true);
  });
  it("una ciudad elegida que ya no es posible (otro día o trayecto) no cuenta", () => {
    const c = { type: "entrada", stops: ["tenerife"], sleep: "tenerife", chosen: "madrid" };
    expect(slotCities(c)).toEqual(["tenerife"]);
    const t = { type: "tren", transport: true, ...dec31, legFrom: "madrid", legTo: "pamplona", chosen: "pamplona" };
    expect(slotCities({ ...t, slot: 1 })).toEqual(["madrid"]);
  });
  it("transporte sin trayecto elegido: salida entre orígenes, llegada entre destinos", () => {
    const jan3 = { type: "tren", transport: true, stops: ["sevilla", "cordoba", "granada"], sleep: "granada",
      legFroms: ["sevilla", "cordoba"], legTos: ["cordoba", "granada"] };
    expect(cityChoices({ ...jan3, slot: 1 })).toEqual(["sevilla", "cordoba"]);
    expect(cityChoices({ ...jan3, slot: 2 })).toEqual(["cordoba", "granada"]);
  });
  it("documento de todo el viaje: sin ciudad (se cruza con todas)", () => {
    expect(slotCities({ type: "seguro", stops: null })).toBeNull();
  });
  it("aviso si la ubicación detectada no es de ese día", () => {
    expect(cityMismatch({ detected: "pamplona", stops: ["tenerife"], sleep: "tenerife" })).toBe("pamplona");
    expect(cityMismatch({ detected: "tenerife", stops: ["tenerife"], sleep: "tenerife" })).toBeNull();
    expect(cityMismatch({ detected: null, stops: ["tenerife"] })).toBeNull();
  });
});

describe("coincidencias y conflictos", () => {
  const index = [
    { name: "Casa", url: SHORT_A, cities: ["sevilla"], docId: "d1" },
    { name: "Casa", url: SHORT_B, cities: ["madrid"], docId: "d2" },
  ];

  it("escribir un nombre guardado en la misma ciudad lo vincula solo", () => {
    const r = resolvePlace(index, { name: "casa", src: "", cities: ["sevilla"] });
    expect(r.kind).toBe("auto");
    expect(r.options[0].url).toBe(SHORT_A);
  });

  it("en otra ciudad no sugiere ni vincula nada (Tenerife)", () => {
    expect(resolvePlace(index, { name: "Casa", src: "", cities: ["tenerife"] }).kind).toBe("none");
    expect(placeSuggestions(index, ["tenerife"], null, cityName)).toEqual([]);
  });

  it("un enlace pegado manda: escribir un nombre guardado NO lo reemplaza", () => {
    // pego el enlace C y escribo "Casa" en Sevilla, donde ya hay una Casa con el enlace A
    const r = resolvePlace(index, { name: "Casa", url: SHORT_C, src: "link", cities: ["sevilla"] });
    expect(r.kind).toBe("conflict"); // aviso, pero el enlace C se conserva (lo decide la app)
    expect(r.options.map((o) => o.url)).toEqual([SHORT_A]);
  });

  it("conflicto también en el otro orden: escribo Casa, quito el enlace y pego otro", () => {
    const typed = resolvePlace(index, { name: "Casa", src: "", cities: ["sevilla"] });
    expect(typed.kind).toBe("auto");
    const afterUnlink = resolvePlace(index, { name: "Casa", src: "", noAuto: true, cities: ["sevilla"] });
    expect(afterUnlink.kind).toBe("none"); // al quitar el enlace no se vuelve a vincular solo
    const pasted = resolvePlace(index, { name: "Casa", url: SHORT_C, src: "link", cities: ["sevilla"] });
    expect(pasted.kind).toBe("conflict");
  });

  it("mismo nombre y mismo enlace pegado: es el mismo lugar, sin conflicto", () => {
    expect(resolvePlace(index, { name: "Casa", url: SHORT_A, src: "link", cities: ["sevilla"] }).kind).toBe("same");
  });

  it("nombre parcial (\"Cas\") no coincide", () => {
    expect(resolvePlace(index, { name: "Cas", src: "", cities: ["sevilla"] }).kind).toBe("none");
  });

  it("al editar un documento no se compara consigo mismo", () => {
    const r = resolvePlace(index, { name: "Casa", url: SHORT_C, src: "link", cities: ["sevilla"], docId: "d1" });
    expect(r.kind).toBe("none");
  });

  it("31 dic (Madrid y Pamplona) con Casa en Madrid y en Pamplona: pregunta cuál", () => {
    const idx = index.concat([{ name: "Casa", url: SHORT_C, cities: ["pamplona"], docId: "d3" }]);
    const r = resolvePlace(idx, { name: "Casa", src: "", cities: ["madrid", "pamplona"] });
    expect(r.kind).toBe("ambiguous");
    expect(r.options.map((o) => o.url).sort()).toEqual([SHORT_B, SHORT_C].sort());
    const sug = placeSuggestions(idx, ["madrid", "pamplona"], null, cityName).map((s) => s.label);
    expect(sug.sort()).toEqual(["Casa (Madrid)", "Casa (Pamplona)"]);
  });

  it("31 dic con Casa solo en Madrid: la sugiere y la vincula", () => {
    const r = resolvePlace(index, { name: "Casa", src: "", cities: ["madrid", "pamplona"] });
    expect(r.kind).toBe("auto");
    expect(r.options[0].url).toBe(SHORT_B);
  });

  it("Casa 2: primer nombre libre en esa ciudad", () => {
    expect(freeName(index, "Casa", ["sevilla"])).toBe("Casa 2");
    const idx = index.concat([{ name: "Casa 2", url: SHORT_C, cities: ["sevilla"], docId: "d4" }]);
    expect(freeName(idx, "Casa", ["sevilla"])).toBe("Casa 3");
    expect(freeName(idx, "Casa 2", ["sevilla"])).toBe("Casa 3");
  });

  it("las sugerencias no repiten un lugar usado en varios documentos", () => {
    const idx = index.concat([{ name: "casa", url: SHORT_A, cities: ["sevilla"], docId: "d9" }]);
    const sug = placeSuggestions(idx, ["sevilla"], null, cityName);
    expect(sug).toHaveLength(1);
    expect(sug[0]).toMatchObject({ label: "Casa", url: SHORT_A });
  });
});

describe("direcciones guardadas (lista para ver)", () => {
  it("une por nombre y enlace, junta documentos y ciudades", () => {
    const ix = [
      { name: "Hotel Sol", url: SHORT_A, cities: ["madrid"], docId: "d1" },
      { name: "hotel sol", url: SHORT_A, cities: ["madrid"], docId: "d2" },   // mismo lugar, otra mayúscula
      { name: "Hotel Sol", url: SHORT_B, cities: ["sevilla"], docId: "d3" },  // mismo nombre, otro enlace
      { name: "Casa", url: "", cities: ["madrid", "pamplona"], docId: "d4" }, // sin enlace, ciudad dudosa
      { name: "Atocha", url: SHORT_C, cities: ["madrid"], docId: "d5" },
      { name: "Atocha", url: SHORT_C, cities: ["madrid"], docId: "d5" },      // salida y llegada del mismo doc
    ];
    const r = savedPlaces(ix);
    expect(r.map((x) => x.name + ":" + x.docIds.join(","))).toEqual(["Hotel Sol:d1,d2", "Hotel Sol:d3", "Casa:d4", "Atocha:d5"]);
    expect(r[2].url).toBe("");
    expect(r[2].cities).toEqual(["madrid", "pamplona"]);
  });
  it("un documento de todo el viaje deja la ciudad sin definir", () => {
    const r = savedPlaces([
      { name: "Seguro", url: "", cities: ["madrid"], docId: "a" },
      { name: "Seguro", url: "", cities: null, docId: "b" },
    ]);
    expect(r[0].cities).toBeNull();
  });
});
