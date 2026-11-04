# Journest

(Antes "Nuestra Ruta". El repo y la URL siguen siendo `tripapp`.)

- `PENDIENTES.md` — lista viva de pendientes (fases, bugs, decisiones
  diferidas). Fuente de verdad, no depende de la memoria de Claude.
- `BITACORA.md` — registro de lo YA hecho/decidido (no pendientes). Agregar
  ahí una entrada corta cada vez que se resuelva o decida algo en la
  conversación, aunque nunca haya pasado por `PENDIENTES.md` primero.
- **Nunca perder datos del usuario.** Nicolas carga documentos reales en
  la app instalada. No cambiar el nombre de la base IndexedDB
  (`journest`), ni sus stores, ni el formato de las copias exportadas
  sin una migración que conserve lo existente (subir la versión de
  `indexedDB.open` con `onupgradeneeded` que migre, nunca recrear). Las
  copias viejas tienen que seguir pudiendo importarse (incluidas las que
  tienen `app:"nuestra-ruta"`).
- Al terminar un cambio: `npm test` y `npm run build` y, si pasan, dejarlo en stage
  (`git add`) junto con su entrada en la bitácora. Los commits y el push los
  hace Nicolas.
