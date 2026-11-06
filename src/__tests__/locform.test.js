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
    savedLinks();
    const t = $("#v-docs").textContent;
    expect(t).toContain("Casa (Madrid)");
    expect(t).toContain("Casa (Pamplona)");
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
    expect(tk.textContent).toContain("escala 2 h 55 min en Zaragoza");
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
    expect(find().textContent).toContain("entrada.pdf");
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
    expect(find().textContent).not.toContain("entrada.pdf");
  });

  it("34) llegada antes que la salida: no deja bajar de +1 (el − atenuado explica por qué)", async () => {
    openNew("2027-01-06", "vuelo");
    const set = (id, v) => { $(id).value = v; $(id).dispatchEvent(new Event("input", { bubbles: true })); };
    set("#f-t1", "18:00"); set("#f-t2", "11:00");
    expect($("#f-arr").textContent).toContain("+1");
    expect($('[data-act="arr-dn"]').getAttribute("aria-disabled")).toBe("true");
    click($('[data-act="arr-dn"]'));
    expect($("#f-arr").textContent).toContain("+1");                // sigue en +1
    expect($("#f-arrerr").textContent).toContain("tiene que ser al día siguiente");
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

  it("36) toda la tarjeta de Documentos abre la ficha, salvo copiar el código y el mapa", () => {
    savedLinks();
    const all = [...document.querySelectorAll("#v-docs .ticket")];
    const tk = all.find((t) => t.querySelector(".tcode")), tm = all.find((t) => t.querySelector("a.map"));
    click(tk.querySelector(".tstub"));                              // la franja de la izquierda
    expect($("#sheet").hidden).toBe(false);
    click($('[data-act="close"]'));
    navigator.clipboard = { writeText: () => Promise.resolve() };
    click(tk.querySelector('[data-act="copy"]'));                   // copiar: no abre
    expect($("#sheet").hidden).toBe(true);
    const map = tm.querySelector("a.map");
    map.addEventListener("click", (e) => e.preventDefault(), { once: true });   // jsdom no navega
    click(map);                                                     // mapa: no abre
    expect($("#sheet").hidden).toBe(true);
  });
});
