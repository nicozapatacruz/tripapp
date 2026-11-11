import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

// app.js es un solo archivo grande: dos funciones con el mismo nombre no dan error, la segunda
// reemplaza a la primera en todo el archivo (así se rompieron los hoteles de Pendientes).
describe("app.js", () => {
  it("no repite nombres de función", () => {
    const src = readFileSync(new URL("../app.js", import.meta.url), "utf8");
    const seen = {}, dup = [];
    for (const m of src.matchAll(/(?:^|[;\s}])(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
      if (seen[m[1]]) dup.push(m[1]); seen[m[1]] = 1;
    }
    expect(dup).toEqual([]);
  });
});
