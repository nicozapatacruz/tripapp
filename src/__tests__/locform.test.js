// @vitest-environment jsdom
/* Flujos reales del formulario de documentos, en un navegador simulado (jsdom):
   pegar enlaces, escribir nombres, quitar enlace, conflictos y "Casa 2". */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const A = "https://maps.app.goo.gl/AAAA1111";
const B = "https://maps.app.goo.gl/BBBB2222";
const C = "https://maps.app.goo.gl/CCCC3333";
const D = "https://maps.app.goo.gl/DDDD4444";
const E = "https://maps.app.goo.gl/EEEE5555";
const MADRID = "2026-12-28", DEC31 = "2026-12-31", TENERIFE = "2027-01-08";
const PAMPLONA = "2027-01-11", DEC17 = "2027-01-17";

const $ = (s) => document.querySelector(s);
const tick = () => new Promise((r) => setTimeout(r, 0));
const click = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
const status = (n = 1) => $("#ls-" + n).textContent;

function openNew(day, type = "entrada") {
  const b = document.createElement("button");
  b.dataset.act = "add"; b.dataset.day = day; b.dataset.type = type;
  document.body.appendChild(b); click(b); b.remove();
}
function typeLoc(value, n = 1) {
  const el = $("#f-loc" + n);
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
async function save() { click($('[data-act="save"]')); await tick(); }
function savedLinks() {
  location.hash = "#documentos";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  return [...document.querySelectorAll("#v-docs a.map")].map((a) => a.getAttribute("href"));
}

beforeAll(async () => {
  const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
  document.body.innerHTML = html.split("<body>")[1].split("<script")[0];
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  await import("../app.js");
  for (let i = 0; i < 5; i++) await tick();
});

describe("formulario: ubicaciones", () => {
  it("el campo Día va justo después del Título", () => {
    openNew(MADRID);
    const ids = [...document.querySelectorAll("#sheet-body input, #sheet-body select")].map((e) => e.id).filter(Boolean);
    expect(ids.indexOf("f-day")).toBe(ids.indexOf("f-title") + 1);
    click($('[data-act="close"]'));
  });

  it("1) pegar primero y luego escribir el nombre: queda vinculado", async () => {
    openNew(MADRID);
    typeLoc(A);
    expect($("#f-loc1").value).toBe("");
    typeLoc("Casa");
    expect(status()).toContain("Vinculado");
    $("#f-title").value = "Museo";
    await save();
    expect(savedLinks()).toContain(A);
  });

  it("2) otra Casa en Madrid: se vincula sola con la existente", () => {
    openNew(MADRID);
    typeLoc("Cas");
    expect(status()).not.toContain("Vinculado");
    typeLoc("Casa");
    expect(status()).toContain("Vinculado");
  });

  it("3) quitar enlace y pegar otro distinto: aviso, no deja guardar, «Casa 2» lo resuelve", async () => {
    click($('[data-act="unlink"]'));
    expect(status()).toContain("Sin enlace");
    expect(status()).not.toContain("Vinculado"); // no se vuelve a vincular solo
    typeLoc("Casa " + B);                         // pegado después del nombre
    expect($("#f-loc1").value).toBe("Casa");
    expect(status()).toContain("Vinculado");
    expect(status()).toContain("Ya tienes «Casa» en Madrid");
    expect(status()).toContain("Casa 2");
    $("#f-title").value = "Cena";
    await save();
    expect($("#f-err").textContent).toContain("Ya existe «Casa» en Madrid");
    click($('[data-act="loc-rename"]'));
    expect($("#f-loc1").value).toBe("Casa 2");
    expect(status()).not.toContain("Ya tienes");
    expect($("#f-err").textContent).toBe("");     // el error de abajo se borra al resolverlo
    await save();
    expect(savedLinks()).toContain(B);
  });

  it("4) pegar otro enlace primero y luego escribir «Casa»: el enlace pegado no se pisa", async () => {
    openNew(MADRID);
    typeLoc(C);
    typeLoc("Cas");
    expect(status()).toContain("Vinculado");
    expect(status()).not.toContain("Ya tienes");
    typeLoc("Casa");
    expect(status()).toContain("Vinculado");     // sigue con C, con aviso
    expect(status()).toContain("Ya tienes «Casa» en Madrid");
    typeLoc("Casa P");
    expect(status()).toContain("Vinculado");     // antes aquí se perdía el enlace
    typeLoc("Casa");
    click($('[data-act="loc-use"]'));            // «Usar esa» → enlace A
    expect($("#f-loc1").value).toBe("Casa");
    expect(status()).not.toContain("Ya tienes");
    $("#f-title").value = "Visita";
    await save();
    expect($("#sheet").hidden).toBe(true);       // se guardó (el formulario se cerró)
    expect(savedLinks()).not.toContain(C);
  });

  it("5) en Tenerife no sugiere ni vincula las Casas de Madrid", () => {
    openNew(TENERIFE);
    const opts = [...document.querySelectorAll("#dl-loc1 option")].map((o) => o.value);
    expect(opts).not.toContain("Casa");
    typeLoc("Casa");
    expect(status()).not.toContain("Vinculado");
    click($('[data-act="close"]'));
  });

  it("6) 31 dic (Madrid y Pamplona): sugiere la Casa de Madrid y pregunta la ciudad", () => {
    openNew(DEC31);
    typeLoc("Casa");
    expect(status()).toContain("Vinculado");
    expect(status()).toContain("¿Dónde está?");
    click($('[data-act="close"]'));
  });

  it("7) escribir el nombre y pegar el enlace después: separa nombre y enlace", () => {
    openNew(MADRID);
    typeLoc("Casa Pedro");
    expect(status()).toContain("Pegar enlace");
    typeLoc("Casa Pedro " + D);
    expect($("#f-loc1").value).toBe("Casa Pedro");
    expect(status()).toContain("Vinculado");
    click($('[data-act="close"]'));
  });

  it("8) 31 dic con «Casa» en Madrid y en Pamplona: pregunta cuál, sin repetir «¿Dónde está?»", async () => {
    openNew(PAMPLONA);
    typeLoc("Casa " + E);
    $("#f-title").value = "Casa Pamplona";
    await save();
    openNew(DEC31);
    typeLoc("Casa");
    expect(status()).toContain("¿Cuál es?");
    expect(status()).not.toContain("¿Dónde está?");
    const pam = [...document.querySelectorAll('#ls-1 [data-act="loc-use"]')].find((b) => b.textContent === "Pamplona");
    click(pam);
    expect(status()).not.toContain("¿Cuál es?");
    expect(status()).toContain("Vinculado");
    click($('[data-act="close"]'));
  });

  it("9) vuelo del 17 ene: un solo trayecto, ya puesto; Salida = Madrid y Llegada = Medellín", () => {
    openNew(DEC17, "vuelo");
    expect($("#f-leg").value).toBe("0-0");
    expect($("#f-leg").type).toBe("hidden");
    expect($("#sheet-body").textContent).toContain("Madrid → Medellín");
    const opts = (n) => [...document.querySelectorAll("#dl-loc" + n + " option")].map((o) => o.value);
    expect(opts(1)).toContain("Casa");
    expect(opts(2)).not.toContain("Casa");
    typeLoc("Casa", 1);
    expect(status(1)).toContain("Vinculado");
    expect(status(1)).not.toContain("¿Dónde está?");
    typeLoc("Casa", 2);
    expect(status(2)).not.toContain("Vinculado");
    expect(status(2)).not.toContain("¿Dónde está?");
    click($('[data-act="close"]'));
  });

  it("10) el 17 ene, elegir Medellín para «Casa» no cambia la Casa de Madrid", async () => {
    openNew(DEC17);
    typeLoc("Casa");
    expect(status()).toContain("Vinculado");     // la de Madrid, con pregunta de ciudad
    click($('#ls-1 [data-act="loc-city"][data-c="medellin"]'));
    expect(status()).not.toContain("Vinculado"); // en Medellín no hay ninguna Casa
    $("#f-title").value = "Casa Medellín";
    await save();
    openNew(MADRID);
    typeLoc("Casa");
    expect(status()).toContain("Vinculado");     // la del 28 sigue en Madrid
    click($('[data-act="close"]'));
  });

  it("11) hotel el 27 (noche en el avión): empieza el 28 y sugiere las noches de Madrid", () => {
    openNew("2026-12-27", "hotel");
    expect($("#f-day").value).toBe("2026-12-28");
    expect($("#sheet-body").textContent).toContain("es en el avión");
    expect($("#f-to").options.length).toBe(3);
    click($('[data-act="close"]'));
  });

  it("12) el ejemplo del título cambia con el tipo", () => {
    openNew(DEC31, "hotel");
    expect($("#f-title").placeholder).toContain("Hotel");
    click($('.ty[data-type="tren"]'));
    expect($("#f-title").placeholder).toContain("AVE");
    click($('[data-act="close"]'));
  });

  it("13) se puede guardar solo con tipo y día: el título es el tipo", async () => {
    openNew(TENERIFE, "seguro");
    await save();
    expect($("#sheet").hidden).toBe(true);
    savedLinks();
    expect($("#v-docs").textContent).toContain("Seguro");
  });

  it("14) 3 ene (dos tramos): Salida pregunta entre orígenes y elegir uno pone el trayecto", () => {
    openNew("2027-01-03", "tren");
    expect($("#f-leg").tagName).toBe("SELECT");
    expect($("#f-leg").value).toBe("");
    typeLoc("Estación");
    const cs = [...document.querySelectorAll('#ls-1 [data-act="loc-city"]')].map((b) => b.dataset.c);
    expect(cs).toEqual(["sevilla", "cordoba"]);
    click($('#ls-1 [data-act="loc-city"][data-c="cordoba"]'));
    expect($("#f-leg").value).toBe("1-0");       // Córdoba → Granada
    click($('[data-act="close"]'));
  });

  it("15) añadir parada desde el formulario parte el trayecto en dos", async () => {
    openNew("2027-01-10", "vuelo");
    click($('[data-act="leg-via-open"]'));
    $("#f-via").value = "Bilbao";
    click($('[data-act="leg-via-add"]'));
    for (let i = 0; i < 5; i++) await tick();
    const o = [...$("#f-leg").options].map((x) => x.textContent);
    expect(o).toEqual(["Sin asignar", "Tenerife → Bilbao", "Bilbao → Pamplona"]);
    // y se puede quitar desde el mismo formulario
    const del = $('[data-act="leg-via-del"][data-k="0"]');
    click(del);                                  // primer toque: pide confirmar
    expect(del.textContent).toBe("Confirmar");
    expect($("#f-leg").tagName).toBe("SELECT");
    click(del);                                  // segundo toque: quita
    for (let i = 0; i < 5; i++) await tick();
    expect($("#f-leg").type).toBe("hidden");
    expect($("#sheet-body").textContent).toContain("Tenerife → Pamplona");
    click($('[data-act="close"]'));
  });

  it("16) el día de inicio muestra la ruta con «Añadir parada» en Documentos", () => {
    location.hash = "#dia-2026-12-27";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($('#v-day [data-act="via"]')).not.toBeNull();
  });

  it("17) vuelo, tren o bus no se pueden poner en un día sin traslado", async () => {
    openNew(MADRID, "entrada");
    const tren = $('.ty[data-type="tren"]');
    expect(tren.getAttribute("aria-disabled")).toBe("true");
    expect($('.ty[data-type="coche"]').getAttribute("aria-disabled")).toBe("false");
    click(tren);
    expect(tren.getAttribute("aria-checked")).toBe("false");
    expect($("#f-tynote").hidden).toBe(false);
    click($('[data-act="close"]'));
    // si se cambia el día a uno sin traslado con un vuelo elegido, no deja guardar
    openNew(DEC17, "vuelo");
    const day = $("#f-day");
    day.value = MADRID;
    day.dispatchEvent(new Event("change", { bubbles: true }));
    await save();
    expect($("#sheet").hidden).toBe(false);
    expect($("#f-err").textContent).toContain("no tiene traslados");
    click($('[data-act="close"]'));
  });

  it("18) borrar el título al editar lo vuelve automático", async () => {
    openNew(TENERIFE, "otro");
    $("#f-title").value = "Test";
    await save();
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((x) => x.textContent.includes("Test"));
    click(tk.querySelector('[data-act="edit"]') || tk);
    expect($("#f-title").value).toBe("Test");
    $("#f-title").value = "";
    await save();
    savedLinks();
    expect($("#v-docs").textContent).not.toContain("Test");
    expect($("#v-docs").textContent).toContain("Otro");
  });

  it("18b) eliminar un documento: Eliminar → Confirmar → eliminado", async () => {
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((x) => x.textContent.includes("Otro"));
    click(tk.querySelector('[data-act="edit"]') || tk);
    const del = $('[data-act="delete"]');
    click(del);
    expect(del.textContent).toBe("Confirmar");
    expect($("#sheet").hidden).toBe(false);
    click(del);
    for (let i = 0; i < 5; i++) await tick();
    expect($("#sheet").hidden).toBe(true);
    savedLinks();
    expect([...document.querySelectorAll("#v-docs .ticket")].some((x) => x.textContent.includes("Otro"))).toBe(false);
  });

  it("18c) trayecto que ya tiene billete: avisa pero deja añadir otro (p. ej. de otra persona)", async () => {
    const JAN6 = "2027-01-06";
    openNew(JAN6, "vuelo");
    expect($("#f-dupnote").hidden).toBe(true);
    $("#f-title").value = "Vuelo Ana";
    await save();
    openNew(JAN6, "vuelo");
    expect($("#f-dupnote").hidden).toBe(false);
    expect($("#f-dupnote").textContent).toContain("Ya tienes el vuelo Málaga → Tenerife");
    click($('.ty[data-type="coche"]'));
    expect($("#f-dupnote").hidden).toBe(true);
    click($('.ty[data-type="vuelo"]'));
    $("#f-title").value = "Vuelo Nico";
    await save();
    expect($("#sheet").hidden).toBe(true);
  });

  it("18d) botón flotante «+»: solo en Documentos (lista) y abre un documento nuevo", () => {
    location.hash = "#inicio";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#fab").hidden).toBe(true);
    savedLinks();
    expect($("#fab").hidden).toBe(false);
    expect($("#fab").classList.contains("wide")).toBe(true); // jsdom no hace scroll: ya está «al final»
    click($("#fab"));
    expect($("#sheet").hidden).toBe(false);
    expect($("#sh-title").textContent).toBe("Nuevo documento");
    click($('[data-act="close"]'));
  });

  it("19) dos «Casa» en ciudades distintas se ven como «Casa (Madrid)» y «Casa (Pamplona)»", () => {
    savedLinks();
    const t = $("#v-docs").textContent;
    expect(t).toContain("Casa (Madrid)");
    expect(t).toContain("Casa (Pamplona)");
  });
});
