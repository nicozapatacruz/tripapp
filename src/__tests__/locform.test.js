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
const MADRID = "2026-12-28", DEC31 = "2026-12-31", TENERIFE = "2027-01-08";

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
});
