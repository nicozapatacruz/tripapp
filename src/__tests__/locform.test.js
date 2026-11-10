// @vitest-environment jsdom
/* Flujos reales del formulario de documentos, en un navegador simulado (jsdom):
   pegar enlaces, escribir nombres, quitar enlace, conflictos y "Casa 2". */
import { describe, it, expect, beforeAll, vi } from "vitest";
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
/* Va a Documentos y devuelve los enlaces guardados (desde Ajustes → Direcciones guardadas;
   las tarjetas compactas ya no llevan mapa). Si hay una hoja abierta, no la toca. */
function savedLinks() {
  location.hash = "#documentos";
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  if (!document.querySelector("#sheet").hidden) return [];
  const b = document.createElement("button");
  b.dataset.act = "places"; document.body.appendChild(b); click(b); b.remove();
  const out = [...document.querySelectorAll("#sheet-body .adrg a.map")].map((a) => a.getAttribute("href"));
  click(document.querySelector('[data-act="close"]'));
  return out;
}
function openTicket(title) {
  const tk = [...document.querySelectorAll("#v-docs .ticket")].find((x) => x.querySelector("h4").textContent === title);
  click(tk.querySelector('[data-act="view"]'));
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

  it("11) el 27 ya no es noche en el avión fija: sin billete pide hotel; con llegada +1 no", async () => {
    const D27 = "2026-12-27";
    openNew(D27, "hotel");
    expect($('.ty[data-type="hotel"]').getAttribute("aria-disabled")).toBe("false");
    expect($('.ty[aria-checked="true"]').dataset.type).toBe("hotel");
    click($('[data-act="close"]'));
    // vuelo del 27 que sale a las 18:00 y llega a las 11:00 → +1 solo
    openNew(D27, "vuelo");
    $("#f-t1").value = "18:00"; $("#f-t1").dispatchEvent(new Event("input", { bubbles: true }));
    $("#f-t2").value = "11:00"; $("#f-t2").dispatchEvent(new Event("input", { bubbles: true }));
    expect($("#f-arr").textContent).toContain("+1");
    expect($("#f-arr").textContent).toContain("lun 28 dic");
    await save();
    openNew(D27, "hotel");
    expect($('.ty[data-type="hotel"]').getAttribute("aria-disabled")).toBe("true");
    expect($('.ty[aria-checked="true"]').dataset.type).not.toBe("hotel");
    click($('.ty[data-type="hotel"]'));
    expect($("#f-tynote").textContent).toContain("es en el avión");
    click($('[data-act="close"]'));
    location.hash = "#inicio";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#d-" + D27).textContent).toContain("Noche en el avión");
    // en Madrid (28) el hotel sigue por defecto y sugiere las noches de Madrid
    openNew("2026-12-28", "hotel");
    expect($('.ty[aria-checked="true"]').dataset.type).toBe("hotel");
    expect($("#f-to").options.length).toBe(3);
    click($('[data-act="close"]'));
  });



  it("12) el ejemplo del título cambia con el tipo; en traslados hay Compañía y número en vez de Título", () => {
    openNew(DEC31, "hotel");
    expect($("#f-title").placeholder).toContain("Hotel");
    click($('.ty[data-type="tren"]'));
    expect($("#f-title")).toBeNull();
    expect($("#f-co").placeholder).toContain("Renfe");
    expect($("#f-no")).not.toBeNull();
    click($('.ty[data-type="coche"]'));
    expect($("#f-co").placeholder).toContain("Hertz");
    expect($("#f-no")).toBeNull();                                 // el coche no lleva número
    click($('.ty[data-type="entrada"]'));
    expect($("#f-title")).not.toBeNull();
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
    expect(o).toEqual(["Sin asignar", "Tenerife → Pamplona · vía Bilbao", "Tenerife → Bilbao", "Bilbao → Pamplona"]);
    expect($("#f-leg").value).toBe("0-0-1");                    // por defecto, un billete para todo
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
    click(tk.querySelector('[data-act="view"]'));
    expect($("#sh-title").textContent).toBe("Test");          // ficha de solo lectura
    expect($("#f-title")).toBeNull();
    click($('#sheet-foot [data-act="edit"]'));
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
    click(tk.querySelector('[data-act="view"]'));
    click($('[data-act="edit"]'));
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
    $("#f-co").value = "Iberia";
    await save();
    openNew(JAN6, "vuelo");
    expect($("#f-dupnote").hidden).toBe(false);
    expect($("#f-dupnote").textContent).toContain("Ya tienes el vuelo Málaga → Tenerife");
    click($('.ty[data-type="coche"]'));
    expect($("#f-dupnote").hidden).toBe(true);
    click($('.ty[data-type="vuelo"]'));
    $("#f-co").value = "Vueling";
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
    savedLinks();                                                    // el nombre con la ciudad se ve en la ficha
    openTicket("Museo");
    expect($("#sheet-body").textContent).toContain("Casa (Madrid)");
    click($('[data-act="close"]'));
    openTicket("Casa Pamplona");
    expect($("#sheet-body").textContent).toContain("Casa (Pamplona)");
    click($('[data-act="close"]'));
  });

  it("20) ficha de lectura: Editar → Cancelar vuelve a la ficha; Guardar también", async () => {
    openNew(TENERIFE, "entrada");
    $("#f-title").value = "Teide";
    $("#f-code").value = "ABC123";
    await save();
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((x) => x.textContent.includes("Teide"));
    click(tk.querySelector('[data-act="view"]'));
    expect($("#sheet-foot").hidden).toBe(false);
    expect($("#sheet-foot").textContent).toBe("Editar");
    expect($("#sheet-body").textContent).toContain("ABC123");
    click($('[data-act="edit"]'));
    const btns = [...document.querySelectorAll("#sheet-foot .btn")].map((b) => b.textContent);
    expect(btns).toEqual(["Eliminar", "Guardar"]);                   // uno al lado del otro, Eliminar primero
    expect($(".sh-head .x").textContent).toBe("Cancelar");
    click($(".sh-head .x"));
    expect($("#sh-title").textContent).toBe("Teide");                // volvió a la ficha
    click($('[data-act="edit"]'));
    $("#f-title").value = "Teide 2";
    await save();
    expect($("#sheet").hidden).toBe(false);
    expect($("#sh-title").textContent).toBe("Teide 2");
    click($('[data-act="close"]'));
    expect($("#sheet-foot").hidden).toBe(true);
  });

  it("21) calendario: hotel sin hora arriba (check-in y check-out); con hora en la línea de tiempo", async () => {
    openNew(PAMPLONA, "hotel");
    $("#f-title").value = "Hotel Pamplona";
    await save();
    location.hash = "#calendario";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const day = (d) => document.getElementById("c-" + d);
    const inTop = day(PAMPLONA).querySelector(".agtop");
    expect(inTop && inTop.textContent).toContain("Check-in · Hotel Pamplona");
    const outDay = [...document.querySelectorAll("#v-cal .day")].find((el) => el.textContent.includes("Check-out · Hotel Pamplona"));
    expect(outDay.id).not.toBe("c-" + PAMPLONA);
    expect(outDay.querySelector(".agtop").textContent).toContain("Check-out");
    // con hora de check-in: pasa a la línea de tiempo
    click(inTop.querySelector(".ag"));
    expect($("#sh-title").textContent).toBe("Hotel Pamplona");
    click($('[data-act="edit"]'));
    $("#f-t1").value = "15:00";
    await save();
    click($('[data-act="close"]'));
    const ag = [...day(PAMPLONA).querySelectorAll(".ag")].find((x) => x.textContent.includes("Check-in"));
    expect(ag.classList.contains("nt")).toBe(false);
    expect(ag.textContent).toContain("15:00");
  });

  it("22) evento: ficha de lectura y edición con Cancelar", async () => {
    const b = document.createElement("button");
    b.dataset.act = "ev-add"; b.dataset.day = MADRID;
    document.body.appendChild(b); click(b); b.remove();
    $("#e-title").value = "Museo del Prado";
    $("#e-t1").value = "10:00";
    click($('[data-act="ev-save"]')); await tick();
    expect($("#sheet").hidden).toBe(true);
    const ag = [...document.querySelectorAll("#c-" + MADRID + " .ag")].find((x) => x.textContent.includes("Prado"));
    click(ag);
    expect($("#sh-title").textContent).toBe("Museo del Prado");
    expect($("#sheet-body").textContent).toContain("10:00");
    click($('[data-act="ev-edit"]'));
    expect($("#e-title").value).toBe("Museo del Prado");
    click($(".sh-head .x"));
    expect($("#sh-title").textContent).toBe("Museo del Prado");
    click($('[data-act="close"]'));
  });

  it("23) hotel: check-out con hora y check-in sin hora el mismo día → el check-in va de primero en «Sin hora»", async () => {
    openNew(TENERIFE, "hotel");
    $("#f-title").value = "Hotel Teide";
    $("#f-t2").value = "11:00";
    await save();
    location.hash = "#calendario";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const outDay = [...document.querySelectorAll("#v-cal .day")].find((el) => el.textContent.includes("Check-out · Hotel Teide"));
    const dayId = outDay.id.slice(2);
    openNew(dayId, "hotel");
    $("#f-title").value = "Hotel Siguiente";
    await save();
    const el = document.getElementById("c-" + dayId);
    expect(el.querySelector(".agtop")).toBeNull();                    // nada arriba
    const lists = el.querySelectorAll(".aglist");
    expect(lists[0].textContent).toContain("Check-out · Hotel Teide");  // en su hora
    expect(lists[0].textContent).toContain("11:00");
    const sinHora = lists[lists.length - 1].querySelector(".ag");
    expect(sinHora.textContent).toContain("Check-in · Hotel Siguiente"); // primero en «Sin hora»
    expect(sinHora.classList.contains("nt")).toBe(true);
    expect(sinHora.querySelector(".agt")).toBeNull();                    // sin columna de hora
  });

  it("24) noches: «Noche del …» o fechas de entrada → salida", async () => {
    savedLinks();
    const t = $("#v-docs").textContent;
    expect(t).toMatch(/Noche del \w{3} \d+ \w{3}/);
    expect(t).toMatch(/→ \w{3} \d+ \w{3} · \d+ noches/);
  });

  it("25) la × borra una hora ya puesta y el documento queda sin hora", async () => {
    openNew(DEC31, "entrada");
    $("#f-title").value = "Museo con hora";
    $("#f-t1").value = "10:00";
    $("#f-t1").dispatchEvent(new Event("input", { bubbles: true }));
    const x = $('[data-act="t-clr"][data-for="f-t1"]');
    expect(x.hidden).toBe(false);
    expect($('[data-act="t-clr"][data-for="f-t2"]').hidden).toBe(true);  // sin hora, sin ×
    await save();
    savedLinks();
    let tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Museo con hora"));
    click(tk.querySelector('[data-act="view"]'));
    click($('[data-act="edit"]'));
    click($('[data-act="t-clr"][data-for="f-t1"]'));
    expect($("#f-t1").value).toBe("");
    expect($('[data-act="t-clr"][data-for="f-t1"]').hidden).toBe(true);
    await save();
    expect($("#sheet-body").textContent).not.toContain("10:00");
    click($('[data-act="close"]'));
  });

  it("26) «Ocultar del calendario»: no sale en el calendario pero sigue contando como hotel", async () => {
    const JAN3 = "2027-01-03";
    location.hash = "#documentos";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    openNew(JAN3, "hotel");
    $("#f-title").value = "Casa de un amigo";
    $("#f-calhide").checked = true;
    await save();
    location.hash = "#calendario";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#v-cal").textContent).not.toContain("Casa de un amigo");
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Casa de un amigo"));
    expect(tk).toBeTruthy();                                    // sigue en Documentos
    click(tk.querySelector('[data-act="view"]'));
    expect($("#sheet-body").textContent).toContain("Oculto del calendario");
    click($('[data-act="edit"]'));
    expect($("#f-calhide").checked).toBe(true);
    $("#f-calhide").checked = false;
    await save();
    click($('[data-act="close"]'));
    location.hash = "#calendario";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#v-cal").textContent).toContain("Check-in · Casa de un amigo");
  });

  it("27) exportar: al preparar la copia se oculta «Preparar copia»; cambiar la contraseña la descarta", async () => {
    const b = document.createElement("button");
    b.dataset.act = "export"; document.body.appendChild(b); click(b); b.remove();
    // copia completa: sin contraseña no deja
    click($('[data-act="exp-make"]'));
    for (let i = 0; i < 5; i++) await tick();
    expect($("#x-err").textContent).toContain("ponle una contraseña");
    expect($("#e-make").hidden).toBe(false);
    // solo itinerario: deja, pero avisa que sale sin cifrar
    click($('[data-act="exp-kind"][data-v="itinerary"]'));
    expect($("#x-err").textContent).toBe("");
    expect($("#e-phint").textContent).toContain("sin cifrar");
    expect($("#e-btn").textContent).toBe("Preparar copia sin cifrar");
    click($('[data-act="exp-make"]'));
    for (let i = 0; i < 10; i++) await tick();
    expect($("#e-make").hidden).toBe(true);
    expect($("#e-out .note.ok").textContent).toMatch(/^Copia lista · .+ · sin cifrar$/);   // itinerario: sin número de documentos
    const btns = [...document.querySelectorAll("#e-out .btn")].map((x) => x.textContent);
    expect(btns[0]).toBe("Descargar");                           // Compartir (si el navegador puede) va a la derecha
    $("#e-pass").value = "x";
    $("#e-pass").dispatchEvent(new Event("input", { bubbles: true }));
    expect($("#e-make").hidden).toBe(false);
    expect($("#e-out").innerHTML).toBe("");
    expect($("#e-btn").textContent).toBe("Preparar copia");      // con contraseña ya no dice «sin cifrar»
    click($('[data-act="exp-kind"][data-v="full"]'));               // dejarlo como estaba
    click($('[data-act="close"]'));
  });

  it("28) copia completa cifrada: el archivo armado por partes se vuelve a abrir con la contraseña", async () => {
    const { parseBackupText, decryptBackup } = await import("../backup.js");
    let saved = null;
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = (f) => { saved = f; return "blob:x"; };
    URL.revokeObjectURL = () => {};
    const origClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = () => {};                  // jsdom no navega a descargas
    const b = document.createElement("button");
    b.dataset.act = "export"; document.body.appendChild(b); click(b); b.remove();
    $("#e-pass").value = "clave-larga-1"; $("#e-pass2").value = "clave-larga-1";
    click($('[data-act="exp-make"]'));
    for (let i = 0; i < 200 && $("#e-btn").disabled !== false; i++) await new Promise((r) => setTimeout(r, 20));
    for (let i = 0; i < 200 && !$('[data-act="exp-dl"]'); i++) await new Promise((r) => setTimeout(r, 20));
    expect($("#e-out .note.ok").textContent).toMatch(/cifrada · \d+ documentos?$/);
    click($('[data-act="exp-dl"]'));
    URL.createObjectURL = origCreate;
    HTMLAnchorElement.prototype.click = origClick;
    const text = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsText(saved); });
    const parsed = parseBackupText(text);
    expect(parsed.encrypted).toBe(true);
    const bk = await decryptBackup(parsed.wrapper, "clave-larga-1");
    expect(bk.kind).toBe("full");
    expect(bk.docs.length).toBeGreaterThan(0);
    click($('[data-act="close"]'));
  }, 20000);

  it("29) archivo de más de 20 MB: aviso (no bloquea)", () => {
    openNew(DEC31, "entrada");
    const input = $("#f-file");
    const big = new File([new Uint8Array(1)], "escaneo.pdf", { type: "application/pdf" });
    Object.defineProperty(big, "size", { value: 150 * 1024 * 1024 });
    Object.defineProperty(input, "files", { value: [big], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect($("#f-bignote").hidden).toBe(false);
    expect($("#f-bignote").textContent).toContain("150");
    const small = new File([new Uint8Array(10)], "billete.pdf", { type: "application/pdf" });
    Object.defineProperty(input, "files", { value: [small], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect($("#f-bignote").hidden).toBe(true);
    click($('[data-act="close"]'));
  });

  it("30) vuelo: compañía y número → título automático; llegada +1 a mano con − / +", async () => {
    const JAN10 = "2027-01-10";
    openNew(JAN10, "vuelo");
    $("#f-co").value = "Iberia";
    $("#f-no").value = "IB3801";
    $("#f-t1").value = "09:00"; $("#f-t1").dispatchEvent(new Event("input", { bubbles: true }));
    $("#f-t2").value = "13:00"; $("#f-t2").dispatchEvent(new Event("input", { bubbles: true }));
    expect($("#f-arr").textContent).toContain("mismo día");
    expect($('[data-act="arr-dn"]').getAttribute("aria-disabled")).toBe("true");
    click($('[data-act="arr-up"]'));                               // a mano: +1
    expect($("#f-arr").textContent).toContain("+1");
    $("#f-t2").value = "14:00"; $("#f-t2").dispatchEvent(new Event("input", { bubbles: true }));
    expect($("#f-arr").textContent).toContain("+1");               // lo puesto a mano se respeta
    await save();
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Iberia · Tenerife → Pamplona"));
    expect(tk.textContent).toContain("IB3801");
    expect(tk.textContent).toContain("09:00–14:00 +1");
    click(tk.querySelector('[data-act="view"]'));
    expect($("#sheet-body").textContent).toContain("14:00 +1");
    expect($("#sheet-body").textContent).toContain("lun 11 ene");
    click($('[data-act="edit"]'));
    expect($("#f-arr").textContent).toContain("+1");
    click($('[data-act="arr-dn"]'));                               // vuelve al mismo día
    await save();
    click($('[data-act="close"]'));
  });

  it("31) un billete con escala: horarios por tramo, duración de la escala y cubre los dos tramos", async () => {
    const JAN15 = "2027-01-15";                                     // Pamplona → Madrid
    openNew(JAN15, "tren");
    click($('[data-act="leg-via-open"]'));
    $("#f-via").value = "Zaragoza";
    click($('[data-act="leg-via-add"]'));
    for (let i = 0; i < 5; i++) await tick();
    expect($("#f-leg").value).toBe("0-0-1");
    expect($("#f-no")).toBeNull();                                  // con escalas, el número va por tramo
    const set = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event("input", { bubbles: true })); };
    $("#f-co").value = "Renfe";
    $("#f-h0-no").value = "ALV1"; set("#f-h0-t1", "06:00"); set("#f-h0-t2", "07:05");
    $("#f-h1-no").value = "AVE2"; set("#f-h1-t1", "10:00"); set("#f-h1-t2", "11:30");
    expect($("#f-lay0").textContent).toContain("Escala en Zaragoza · 2 h 55 min");
    expect($("#f-arr").textContent).toContain("mismo día");
    await save();
    // no pide otro billete para ningún tramo
    location.hash = "#documentos";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    click($('[data-act="dtab"][data-v="pend"]'));
    expect($("#v-docs").textContent).not.toContain("Zaragoza");
    click($('[data-act="dtab"][data-v="docs"]'));
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Renfe · Pamplona → Madrid"));
    expect(tk.textContent).toContain("ALV1 · AVE2");
    expect(tk.textContent).toContain("1 escala");                    // la duración y el lugar, en la ficha
    click(tk.querySelector('[data-act="view"]'));
    expect($("#sheet-body").textContent).toContain("Escala en Zaragoza · 2 h 55 min");
    // escala nocturna larga: llega a las 22:00 y sigue a las 08:00 → +1 y «noche de escala» (hotel permitido)
    click($('[data-act="edit"]'));
    set("#f-h0-t2", "22:00"); set("#f-h1-t1", "08:00"); set("#f-h1-t2", "09:30");
    expect($("#f-lay0").textContent).toContain("10 h");
    expect($("#f-lay0").textContent).toContain("nocturna");
    expect($("#f-arr").textContent).toContain("+1");
    await save();
    expect($("#sheet-body").textContent).toContain("Escala nocturna de 10 h en Zaragoza");
    click($('[data-act="close"]'));
    location.hash = "#inicio";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#d-" + JAN15).textContent).toContain("Noche de escala en Zaragoza");
    openNew(JAN15, "hotel");
    expect($('.ty[data-type="hotel"]').getAttribute("aria-disabled")).toBe("false");
    click($('[data-act="close"]'));
  });

  it("32) quitar la parada de un billete con escala lo deja como billete de un tramo, sin perder la cobertura", async () => {
    const JAN15 = "2027-01-15";
    openNew(JAN15, "tren");
    const del = $('[data-act="leg-via-del"][data-k="0"]');
    click(del); click(del);
    for (let i = 0; i < 5; i++) await tick();
    click($('[data-act="close"]'));
    location.hash = "#documentos";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Renfe · Pamplona → Madrid"));
    expect(tk.textContent).not.toContain("escala");
    expect(tk.textContent).toContain("ALV1");                       // conserva el primer número
    click($('[data-act="dtab"][data-v="pend"]'));
    expect($("#v-docs").textContent).not.toContain("Pamplona → Madrid");
    click($('[data-act="dtab"][data-v="docs"]'));
    location.hash = "#inicio";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#d-" + JAN15).textContent).toContain("Noche en el avión"); // sigue llegando +1, ya sin escala
  });

  it("33) «Quitar archivo»: se quita al guardar; Cancelar lo deshace", async () => {
    URL.createObjectURL = URL.createObjectURL || (() => "blob:x");
    URL.revokeObjectURL = URL.revokeObjectURL || (() => {});
    openNew(DEC31, "entrada");
    expect($("#f-filedel").hidden).toBe(true);                      // sin archivo, sin botón
    $("#f-title").value = "Con archivo";
    const input = $("#f-file");
    const f = new File([new Uint8Array(10)], "entrada.pdf", { type: "application/pdf" });
    Object.defineProperty(input, "files", { value: [f], configurable: true });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect($("#f-filedel").hidden).toBe(false);
    await save();
    savedLinks();
    const find = () => [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Con archivo"));
    expect(find().querySelector(".tclip")).not.toBeNull();            // 📎: tiene archivo (el nombre, en la ficha)
    // quitar y cancelar: sigue el archivo
    click(find().querySelector('[data-act="view"]'));
    click($('[data-act="edit"]'));
    Object.defineProperty($("#f-file"), "files", { value: [], configurable: true });
    click($('[data-act="file-del"]'));
    expect($("#f-name").textContent).toBe("Elegir archivoPDF del billete, la reserva o una captura"); // vacío, como uno nuevo
    click($(".sh-head .x"));                                        // Cancelar
    expect($("#sheet-body").textContent).toContain("entrada.pdf");
    // quitar y guardar: ya no tiene archivo
    click($('[data-act="edit"]'));
    Object.defineProperty($("#f-file"), "files", { value: [], configurable: true });
    click($('[data-act="file-del"]'));
    await save();
    expect($("#sheet-body").textContent).not.toContain("entrada.pdf");
    click($('[data-act="close"]'));
    savedLinks();
    expect(find().querySelector(".tclip")).toBeNull();
  });

  it("34) llegada antes que la salida: no deja bajar de +1 (el − atenuado explica por qué)", async () => {
    openNew("2027-01-06", "vuelo");
    const set = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event("input", { bubbles: true })); };
    set("#f-t1", "18:00"); set("#f-t2", "11:00");
    expect($("#f-arr").textContent).toContain("+1");
    expect($('[data-act="arr-dn"]').getAttribute("aria-disabled")).toBe("true");
    click($('[data-act="arr-dn"]'));
    expect($("#f-arr").textContent).toContain("+1");                // sigue en +1
    expect($("#f-arrerr").textContent).toBe("La llegada (11:00) es antes que la salida (18:00), así que es al día siguiente. Si llega el mismo día, revisa las horas.");
    click($('[data-act="arr-up"]'));                                 // +2 sí se puede…
    expect($("#f-arr").textContent).toContain("+2");
    expect($("#f-arrerr").textContent).toBe("");
    click($('[data-act="arr-dn"]'));                                 // …y volver a +1
    expect($("#f-arr").textContent).toContain("+1");
    set("#f-t2", "20:00");                                           // ahora llega después de salir: el mínimo baja a 0
    expect($('[data-act="arr-dn"]').getAttribute("aria-disabled")).toBe(null);
    click($('[data-act="close"]'));
  });

  it("35) imágenes: se abren en el visor propio (desde la ficha y desde Abrir en edición); los PDF siguen como enlace", async () => {
    URL.createObjectURL = URL.createObjectURL || (() => "blob:x");
    openNew(DEC31, "entrada");
    $("#f-title").value = "Con foto";
    const f = new File([new Uint8Array(10)], "qr.png", { type: "image/png" });
    Object.defineProperty($("#f-file"), "files", { value: [f], configurable: true });
    $("#f-file").dispatchEvent(new Event("change", { bubbles: true }));
    await save();
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Con foto"));
    click(tk.querySelector('[data-act="view"]'));
    click($('.vthumb[data-act="img-view"]'));
    expect($("#viewer")).not.toBeNull();
    expect($("#vw-img").getAttribute("alt")).toBe("qr.png");
    click($('[data-act="vw-close"]'));
    expect($("#viewer")).toBeNull();
    click($('[data-act="edit"]'));
    const open = $('#f-prev [data-act="img-view"]');
    expect(open.textContent).toContain("Abrir qr.png");
    click(open);
    expect($("#viewer")).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect($("#viewer")).toBeNull();
    expect($("#sheet").hidden).toBe(false);                        // Escape cierra solo el visor
    click($(".sh-head .x"));
    click($('[data-act="close"]'));
  });

  it("36) tarjeta compacta: toda abre la ficha; sin código, precio, mapa ni nota (están en la ficha)", () => {
    savedLinks();
    const all = [...document.querySelectorAll("#v-docs .ticket")];
    expect(all.length).toBeGreaterThan(0);
    expect(all.some((t) => t.querySelector(".tcode, a.map, .price, [data-act=copy]"))).toBe(false);
    const tk = all[0];
    click(tk.querySelector(".tstub"));                              // la franja de la izquierda también abre
    expect($("#sheet").hidden).toBe(false);
    expect($("#sh-title").textContent).toBe(tk.querySelector("h4").textContent);
    click($('[data-act="close"]'));
  });

  it("37) billete guardado antes del +1 (sin día de llegada): se deduce de las horas", async () => {
    const DEC17b = "2027-01-17";
    const backup = { app: "journest", v: 2, kind: "full", kv: {}, docs: [
      { id: "old-flight", type: "vuelo", dayId: DEC17b, leg: 0, seg: 0, title: "Vuelo viejo", t1: "22:20", t2: "13:55", created: 1 } ] };
    const b = document.createElement("button");
    b.dataset.act = "settings"; document.body.appendChild(b); click(b); b.remove();
    const inp = $("#s-import");
    const f = new File([JSON.stringify(backup)], "copia.json", { type: "application/json" });
    f.text = () => Promise.resolve(JSON.stringify(backup));
    Object.defineProperty(inp, "files", { value: [f], configurable: true });
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    for (let i = 0; i < 10; i++) await tick();
    click($('[data-act="imp-apply"]'));
    for (let i = 0; i < 10; i++) await tick();
    savedLinks();
    const tk = [...document.querySelectorAll("#v-docs .ticket")].find((t) => t.textContent.includes("Vuelo viejo"));
    expect(tk.textContent).toContain("22:20–13:55 +1");
    click(tk.querySelector('[data-act="view"]'));
    click($('[data-act="edit"]'));
    expect($("#f-arr").textContent).toContain("+1");               // no «mismo día»
    expect($('[data-act="arr-dn"]').getAttribute("aria-disabled")).toBe("true");
    click($(".sh-head .x"));
    click($('[data-act="close"]'));
  });

  it("38) error al guardar: un solo mensaje encima de los botones, lleva al campo y lo marca hasta corregirlo", async () => {
    openNew(DEC31, "entrada");
    $("#f-price").value = ",";
    await save();
    expect($("#f-err").textContent).toContain("El precio no es válido");
    expect($("#f-price").classList.contains("bad")).toBe(true);
    expect(document.querySelectorAll("#sheet .err:not(:empty)").length).toBe(1);   // no duplicado
    $("#f-price").value = "12";
    $("#f-price").dispatchEvent(new Event("input", { bubbles: true }));
    expect($("#f-price").classList.contains("bad")).toBe(false);
    expect($("#f-err").textContent).toBe("");
    click($('[data-act="close"]'));
  });

  it("39) lista «Qué ver»: toda la fila abre la edición; Añadir y Eliminar | Guardar en el pie fijo", () => {
    const b = document.createElement("button");
    b.dataset.act = "list"; b.dataset.city = "madrid"; b.dataset.kind = "see";
    document.body.appendChild(b); click(b); b.remove();
    expect($("#sheet-foot").textContent).toBe("ReordenarAñadir");
    expect($('#sheet-body [data-act="item-edit"].x')).toBeNull();     // ya no hay botón «Editar»
    const row = $('#sheet-body .pl[data-act="item-edit"]');
    click(row.querySelector("b"));
    expect($("#i-n").value).toBe(row.querySelector("b").textContent);
    expect([...document.querySelectorAll("#sheet-foot .btn")].map((x) => x.textContent)).toEqual(["Eliminar", "Guardar"]);
    click($(".sh-head .x"));                                          // Cancelar: vuelve a la lista
    expect($("#sh-title").textContent).toContain("Qué ver");
    click($('[data-act="close"]'));
  });

  it("40) Reordenar: Cancelar no cambia nada; Listo guarda el orden y se ve también en el día", async () => {
    const open = () => { const b = document.createElement("button"); b.dataset.act = "list"; b.dataset.city = "madrid"; b.dataset.kind = "see"; document.body.appendChild(b); click(b); b.remove(); };
    const names = () => [...document.querySelectorAll("#pl-rows li b")].map((x) => x.textContent);
    open();
    const before = names();
    click($('[data-act="ord-start"]'));
    expect([...document.querySelectorAll("#sheet-foot .btn")].map((x) => x.textContent)).toEqual(["Cancelar", "Listo"]);
    expect(document.querySelectorAll("#pl-rows .hdl").length).toBe(before.length);
    expect($('[data-act="list-reset"]')).toBeNull();                 // en este modo no se puede restaurar
    const ul = $("#pl-rows");
    ul.insertBefore(ul.lastElementChild, ul.children[2]);             // como si se arrastrara el último al 3.er lugar
    click($('[data-act="ord-cancel"]'));
    expect(names()).toEqual(before);                                  // Cancelar: igual que antes
    click($('[data-act="ord-start"]'));
    const ul2 = $("#pl-rows");
    ul2.insertBefore(ul2.lastElementChild, ul2.children[2]);
    click($('[data-act="ord-done"]'));
    for (let i = 0; i < 5; i++) await tick();
    const after = names();
    expect(after[2]).toBe(before[before.length - 1]);
    expect($('[data-act="list-reset"]')).not.toBeNull();             // ahora hay cambios: se puede restaurar
    click($('[data-act="close"]'));
    location.hash = "#dia-" + MADRID;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const dayText = $("#v-day").textContent;
    expect(dayText.indexOf(after[2])).toBeLessThan(dayText.indexOf(after[3]));
  });

  it("41) el ‹ del día vuelve a donde estabas (Calendario, Documentos o Ruta); también en la barra compacta", () => {
    const go = (h) => { location.hash = h; window.dispatchEvent(new HashChangeEvent("hashchange")); };
    go("#calendario"); go("#dia-" + MADRID);
    expect($("#v-day .dbar .back").getAttribute("href")).toBe("#calendario");
    go("#dia-2026-12-29");                                           // pasar al día siguiente no cambia el origen
    expect($("#v-day .dbar .back").getAttribute("href")).toBe("#calendario");
    go("#documentos"); go("#dia-" + MADRID);
    expect($("#v-day .dbar .back").getAttribute("href")).toBe("#documentos");
    go("#inicio"); go("#dia-" + MADRID);
    expect($("#v-day .dbar .back").getAttribute("href")).toBe("#inicio");
    // fila fija con ‹, ciudades (aparecen al bajar) y Día X de Y; el resto del encabezado va aparte
    expect($("#v-day .dbar").textContent).toContain("Día 2 de");
    expect($("#v-day .dbar .dbt").textContent).toBe("Madrid");
    expect($("#v-day .dh .back")).toBeNull();
  });

  it("42) filas de sitios: estado a la izquierda; agendar y mapa solo con ícono a la derecha", () => {
    location.hash = "#dia-" + MADRID; window.dispatchEvent(new HashChangeEvent("hashchange"));
    const pact = $("#v-day .pact");
    const kids = [...pact.children].map((x) => x.className || x.tagName);
    expect(kids[0]).toContain("stat");
    expect(kids[1]).toBe("pgap");
    expect(pact.querySelector(".map.ico").textContent).toBe("");        // sin texto «Mapa»
    expect(pact.querySelector(".agb2").getAttribute("aria-label")).toContain("al calendario");
  });

  it("43) al abrir una hoja el foco va a la hoja, no al botón Cerrar", () => {
    const b = document.createElement("button");
    b.dataset.act = "list"; b.dataset.city = "madrid"; b.dataset.kind = "see";
    document.body.appendChild(b); click(b); b.remove();
    expect(document.activeElement).toBe($("#sheet .sheet"));
    click($('[data-act="close"]'));
  });

  it("44) la cabecera de la hoja queda fuera de lo que se desplaza", () => {
    const b = document.createElement("button");
    b.dataset.act = "list"; b.dataset.city = "madrid"; b.dataset.kind = "see";
    document.body.appendChild(b); click(b); b.remove();
    expect($("#sheet-head .sh-head #sh-title").textContent).toContain("Qué ver");
    expect($("#sheet-body .sh-head")).toBeNull();
    click($('[data-act="close"]'));
    expect($("#sheet-head").innerHTML).toBe("");
  });

  it("45) Ajustes → Direcciones guardadas: por ciudad, con sus documentos, mapa y aviso sin enlace", async () => {
    openNew(MADRID);
    typeLoc("Mercado sin enlace");
    $("#f-title").value = "Vermut";
    await save();
    expect($("#f-err")).toBeNull();                                    // guardado: el formulario se cerró
    click($("#nav-set"));
    const row = $('#sheet-body [data-act="places"]');
    expect(row.textContent).toMatch(/\d+ direcciones de tus documentos/);
    click(row);
    expect($("#sh-title").textContent).toBe("Direcciones guardadas");
    const heads = [...document.querySelectorAll("#sheet-body .adrg .lab")].map((h) => h.textContent);
    const at = (c) => heads.findIndex((h) => h.startsWith(c));
    expect(at("Medellín")).toBeLessThan(at("Madrid"));                  // orden del viaje (sale de Medellín)
    const li = [...document.querySelectorAll("#sheet-body .pl.adr")].find((x) => x.textContent.includes("Mercado sin enlace"));
    expect(li.querySelector(".adrw").textContent).toContain("Sin enlace al mapa");
    expect(li.querySelector("a.map").getAttribute("href")).toContain("Mercado%20sin%20enlace%2C%20Madrid");
    const casas = [...document.querySelectorAll("#sheet-body .pl.adr")].filter((x) => x.querySelector("b").textContent === "Casa");
    const linked = casas.find((x) => x.querySelector("a.map").getAttribute("href") === A);  // la Casa con enlace
    expect(linked.querySelector(".adrw")).toBeNull();
    expect(linked.querySelectorAll('[data-act="view"]').length).toBeGreaterThan(0);
    const fx = $("#sheet-body details.adrx");                           // las de la app: plegadas
    expect(fx.open).toBe(false);
    expect(fx.querySelector("summary").textContent).toMatch(/aeropuertos de la app/);
    expect(fx.querySelectorAll(".pl.adr").length).toBe(+fx.querySelector("summary small").textContent);
    expect(fx.textContent).toContain("Sevilla Santa Justa");
    // enlaces exactos de Google Maps (ficha del lugar), no búsquedas por texto
    expect([...fx.querySelectorAll("a.map")].every((x) => x.getAttribute("href").includes("/maps/place/"))).toBe(true);
    click(li.querySelector('[data-act="view"]'));                       // abre la ficha del documento
    expect($("#sh-title").textContent).not.toBe("Direcciones guardadas");
    click($('[data-act="close"]'));
  });

  it("46) resumen de gastos: botón en el recuadro, cobrado en otra moneda guardado e impresión", async () => {
    openNew(MADRID);
    $("#f-title").value = "Museo caro";
    $("#f-price").value = "100";
    $("#f-cur").value = "EUR";
    await save();
    openNew(MADRID);
    $("#f-title").value = "Taxi";
    $("#f-price").value = "20";
    await save();
    location.hash = "#documentos"; window.dispatchEvent(new HashChangeEvent("hashchange"));
    click($('#v-docs .sumbox [data-act="spend"]'));
    expect($("#sh-title").textContent).toBe("Resumen de gastos");
    const inp = [...document.querySelectorAll("#sheet-body [data-paid]")].find((x) => x.closest(".sprow").textContent.includes("Museo caro"));
    const id = inp.dataset.paid;
    const sel = document.querySelector('[data-paidc="' + id + '"]');
    expect(sel.value).toBe("USD");                                     // por defecto, otra moneda distinta del precio
    inp.value = "abc,";
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    expect(inp.classList.contains("bad")).toBe(true);                  // monto inválido: no se guarda
    inp.value = "109,50";
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(inp.classList.contains("bad")).toBe(false);
    expect($("#sp-tot").textContent).toContain("109,50");
    let printed = 0;
    window.print = () => { printed++; };
    click($('[data-act="spend-print"]'));
    await tick(); await tick();
    expect(printed).toBe(1);
    const row = [...document.querySelectorAll("#print tbody tr")].find((r) => r.textContent.includes("Museo caro"));
    expect(row.textContent).toContain("100,00");
    expect(row.textContent).toContain("109,50");
    expect(document.title).toContain("Gastos del viaje");
    window.dispatchEvent(new Event("afterprint"));
    expect(document.title).not.toContain("Gastos del viaje");
    click($('[data-act="close"]'));
    // desmarcar: no se imprime ni suma, y queda guardado
    click($('#v-docs .sumbox [data-act="spend"]'));
    const cb = $('[data-spinc="' + id + '"]');
    expect(cb.checked).toBe(true);
    cb.checked = false;
    cb.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(cb.closest(".sprow").classList.contains("off")).toBe(true);
    expect($("#sp-tot").textContent).not.toContain("109,50");
    click($('[data-act="spend-print"]'));
    for (let k = 0; k < 50 && printed < 2; k++) await tick();
    expect(printed).toBe(2);
    expect($("#print").textContent).not.toContain("Museo caro");
    expect($("#print").textContent).toContain("Taxi");
    window.dispatchEvent(new Event("afterprint"));
    cb.checked = true;
    cb.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    // escribir sin salir del campo y cerrar: también se guarda
    const t2 = [...document.querySelectorAll("#sheet-body [data-paid]")].find((x) => x.closest(".sprow").textContent.includes("Taxi"));
    t2.value = "22";
    click($('[data-act="close"]'));
    for (let k = 0; k < 20; k++) await tick();
    click($('#v-docs .sumbox [data-act="spend"]'));
    expect($("#pd-" + t2.dataset.paid).value).toBe("22");
    click($('[data-act="close"]'));
    // al volver a abrir, el cobro sigue ahí
    click($('#v-docs .sumbox [data-act="spend"]'));
    expect($("#pd-" + id).value).toBe("109,5");
    expect(document.querySelector('[data-paidc="' + id + '"]').value).toBe("USD");
    click($('[data-act="close"]'));
  });

  it("47) barra de gastos: una línea que se despliega con el desglose (y se recuerda)", () => {
    location.hash = "#documentos"; window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#v-docs .sumbox .sumrows")).toBeNull();                 // plegada por defecto
    expect($("#v-docs .sumbox [data-act=spend]")).not.toBeNull();      // imprimir sigue a mano
    click($("#v-docs .sumbox [data-act=sumtog]"));
    expect($("#v-docs .sumbox .sumrows")).not.toBeNull();
    expect($("#v-docs .sumbox [data-act=sumtog]").getAttribute("aria-expanded")).toBe("true");
    expect($("#v-docs .sumbox").textContent).not.toContain("+");        // varias monedas: en columna, sin «+»
    expect($("#v-docs .page-h p")).toBeNull();                          // sin subtítulo
    location.hash = "#inicio"; window.dispatchEvent(new HashChangeEvent("hashchange"));
    location.hash = "#documentos"; window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#v-docs .sumbox .sumrows")).not.toBeNull();             // sigue abierta
    click($("#v-docs .sumbox [data-act=sumtog]"));
    expect($("#v-docs .sumbox .sumrows")).toBeNull();
    click($('#v-docs [data-act=filter][data-f="entrada"]'));             // filtrado: sin imprimir, mismo margen a ambos lados
    expect($("#v-docs .sumbox").classList.contains("noprt")).toBe(true);
    // en todos los filtros la barra sigue ahí (con 0 si no hay precios): la lista no salta
    const fs = [...document.querySelectorAll("#v-docs [data-act=filter]")].map((b) => b.dataset.f);
    fs.forEach((f) => { click($('#v-docs [data-act=filter][data-f="' + f + '"]')); expect($("#v-docs .sumbox")).not.toBeNull(); });
    click($('#v-docs [data-act=filter][data-f="all"]'));
  });

  it("48) durante el viaje, los días anteriores se pliegan en una línea", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2027, 0, 9, 12));
    try {
      location.hash = "#inicio"; window.dispatchEvent(new HashChangeEvent("hashchange"));
      location.hash = "#documentos"; window.dispatchEvent(new HashChangeEvent("hashchange"));
      const bar = $("#v-docs .pastbar");
      expect(bar.textContent).toContain("Días anteriores");
      expect($('#v-docs .group-h a[href="#dia-' + MADRID + '"]')).toBeNull();
      expect($('#v-docs .group-h a[href="#dia-' + PAMPLONA + '"]')).not.toBeNull();   // 11 ene: aún no pasa
      click(bar);
      expect($('#v-docs .group-h a[href="#dia-' + MADRID + '"]')).not.toBeNull();
      click($("#v-docs .pastbar"));
      expect($('#v-docs .group-h a[href="#dia-' + MADRID + '"]')).toBeNull();
    } finally { vi.useRealTimers(); }
    location.hash = "#inicio"; window.dispatchEvent(new HashChangeEvent("hashchange"));
    location.hash = "#documentos"; window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect($("#v-docs .pastbar")).toBeNull();                         // antes del viaje: todo visible
  });
});
