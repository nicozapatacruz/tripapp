/* Cifrado de la app publicada (ver lock/plugin.js). Lo usan el build (Node) y la página de la
   contraseña en el teléfono (lock/loader.js), así que solo usa la Web Crypto estándar.

   - La clave sale de la contraseña del viaje con PBKDF2-SHA256 (600.000 vueltas, como las copias)
     y una sal FIJA: la misma contraseña da siempre la misma clave, así el teléfono la recuerda entre
     versiones y solo la vuelve a pedir si la contraseña cambia.
   - El código va cifrado con AES-GCM 256 y un IV nuevo en cada build. AES-GCM detecta una clave
     equivocada (o un archivo alterado): el descifrado falla. */
const TRIP_ITER = 600000;
const SALT = "journest-trip-v1";

async function tripKey(password, iter = TRIP_ITER) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(password.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(SALT), iterations: iter },
    base, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

async function encryptWith(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)));
  return { data, iv: Array.from(iv) };
}

async function decryptWith(key, data, iv) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, data);
  return new TextDecoder().decode(plain);
}

/* La clave en crudo (base64) para guardarla en el teléfono y no volver a pedir la contraseña */
async function exportKey(key) {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  let s = ""; raw.forEach((b) => { s += String.fromCharCode(b); });
  return btoa(s);
}
async function importKey(b64) {
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["decrypt"]);
}

/* Página de la contraseña del viaje. En la app publicada, esto reemplaza al código de la app
   (que va cifrado en un archivo aparte, ver lock/plugin.js). El build le antepone lock/core.js y
   cambia __FILE__ y __IV__ por el archivo cifrado y su IV.

   - Si el teléfono ya tiene la clave guardada, abre la app directamente (también sin internet: el
     service worker guarda el archivo cifrado).
   - Si no, pide la contraseña una vez, guarda la clave (no la contraseña) y abre la app.
   - Si la clave guardada ya no sirve (la contraseña del viaje cambió), la vuelve a pedir. */
const FILE = "/tripapp/assets/app-DyNxMhDu.enc", IV = [247,33,192,187,37,64,176,11,229,130,181,45], LS = "journest:tripKey";

async function openApp(key) {
  let r;
  try { r = await fetch(FILE); } catch (_) { r = null; }
  if (!r || !r.ok) throw new Error("fetch");
  let code;
  try { code = await decryptWith(key, new Uint8Array(await r.arrayBuffer()), IV); } catch (_) { throw new Error("key"); }
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  await import(url);
}

function whyText(x) {
  const m = x && x.message;
  return m === "key" ? "Contraseña incorrecta." : m === "fetch" ? "No se pudo cargar la app. Revisa la conexión e inténtalo otra vez." : "La app no pudo arrancar. Ciérrala y vuelve a abrirla.";
}
function lockScreen(msg) {
  const box = document.createElement("div");
  box.id = "lock";
  box.setAttribute("style", "position:fixed;inset:0;z-index:300;background:var(--bg,#F5F6F8);display:flex;align-items:center;justify-content:center;padding:24px");
  box.innerHTML = '<form style="width:100%;max-width:420px;display:flex;flex-direction:column;gap:16px">' +
    '<h1 style="margin:0;font:800 34px/1.1 var(--f,system-ui);letter-spacing:-.03em">Journest</h1>' +
    '<p style="margin:0;color:var(--muted,#667)">' + (msg || "Escribe la contraseña del viaje. Solo se pide una vez en este teléfono.") + '</p>' +
    '<div class="field"><label for="lock-pass">Contraseña del viaje</label><input id="lock-pass" type="password" autocomplete="current-password" required></div>' +
    '<p class="err" id="lock-err" role="alert" style="margin:0;color:var(--danger,#b42318)"></p>' +
    '<button type="submit" class="btn primary" style="--c1:var(--accent)">Entrar</button></form>';
  document.body.appendChild(box);
  const form = box.querySelector("form"), inp = box.querySelector("#lock-pass"), err = box.querySelector("#lock-err"), btn = box.querySelector("button");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!inp.value) return;
    btn.disabled = true; btn.textContent = "Abriendo…"; err.textContent = "";
    let key;
    try { key = await tripKey(inp.value); } catch (_) { key = null; }
    try {
      await openApp(key);
      try { localStorage.setItem(LS, await exportKey(key)); } catch (_) {}
      box.remove();
    } catch (x) {
      btn.disabled = false; btn.textContent = "Entrar";
      err.textContent = whyText(x);
      inp.select();
    }
  });
  setTimeout(() => inp.focus(), 50);
}

(async () => {
  let saved = null;
  try { saved = localStorage.getItem(LS); } catch (_) {}
  if (saved) {
    try { await openApp(await importKey(saved)); return; }
    catch (x) {
      if (!x || x.message !== "key") { lockScreen(whyText(x)); return; }
      try { localStorage.removeItem(LS); } catch (_) {}
      lockScreen("La contraseña del viaje cambió. Escribe la nueva.");
      return;
    }
  }
  lockScreen();
})();
