# Estado del Proyecto

> **Este archivo es el punto de entrada.** Léelo primero en cualquier sesión nueva.
> Se actualiza al final de cada sesión de trabajo. Última actualización: **2026-11-23**.

---

## Resumen en 30 segundos

**Qué es:** "La era del Crepúsculo en Vaeloria", una app web de una sola pantalla para llevar la
experiencia (PX) de los personajes de una mesa de D&D 5e. Sumar y restar PX, ver cuánto falta para el
siguiente nivel con una barra que se llena, y una celebración cuando alguien sube de nivel.
La dirección visual sale del ícono ya existente, `Icono app.png`; el nombre lo puso el dueño del
proyecto el 2026-08-12, en sustitución de "D&D Camp" (regla de oro 12: nada en inglés).

**Cómo está construida:** PWA sin build (HTML + CSS + JS planos), datos en `localStorage` del propio
teléfono, se publica gratis en GitHub Pages y se instala en la pantalla de inicio. Funciona sin internet.

**Restricciones que mandan:** ver `REGLAS.md`. Las dos más citadas: costo cero y funciona offline.

---

## Fase actual

| | |
|---|---|
| **Fase** | 6 — PWA instalable y offline |
| **Estado** | 🟡 Código escrito en la rama `fase-6-pwa`; falta fusionar a `main` y probar en el celular |
| **Siguiente** | Fase 7 — Exportar/importar y README (ver `docs/FASES.md`) |
| **Código escrito** | `index.html`, `css/estilo.css` y `js/` (siete archivos, incl. `pwa.js`), `manifest.webmanifest`, `sw.js` |
| **Recursos listos** | `recursos/iconos/`: `icono-original.png` (1024, arte fuente) + 512 (comprimido, 125 KB) · 192 · 64 · maskable-512 |

**Estado real de la app: la v1 está funcionalmente completa.** Se crean, editan y eliminan aventureros
con foto o con el emoji de su clase, se les suma y resta experiencia con las monedas o con una cantidad
libre, la barra y el nivel se actualizan solos, hay un deshacer de un paso, subir de nivel se celebra
con sello y esporas, y todo sobrevive a la recarga. Se abre con doble clic en `index.html`.
Lo que falta es entrega: instalarla y publicarla.

## Contexto nuevo (2026-11-23): posible plataforma web del grupo

El grupo valora una plataforma de D&D (subir sesiones, diseños…) y esta app podría entrar como módulo.
**Decidido:** terminar primero la v1 (Fases 6-7) y publicarla como demo; **ninguna regla de oro se
reabre todavía**; trabajo con GitHub desde ya (flujo en `docs/FASES.md`, repo en cuenta personal por
ahora). La Fase 8 (preparar el módulo) queda condicionada a que el grupo defina stack y alcance.
Repo en https://github.com/vecmaw/vaeloria (público), Pages desde `main` en https://vecmaw.github.io/vaeloria/.

## Próximo paso concreto

1. **Fusionar `fase-6-pwa` a `main`** (PR en GitHub) y esperar a que Pages se actualice.
2. **Probar en el celular, contra la URL publicada:** instalar, abrir a pantalla completa, poner modo avión, cerrar del todo y reabrir. Hasta que eso pase, la Fase 6 no está terminada.
3. **Rehacer el banderín "D&D CAMP"** del arte y regenerar los iconos (los actuales son provisionales).
4. Fase 7: exportar/importar JSON.

**Al publicar cambios futuros:** subir `VERSION` en `sw.js`, o nadie verá la actualización.

---

## Decisiones ya tomadas (no volver a discutir)

1. **Datos solo locales**, uno por dispositivo. Sin nube, sin sincronización, sin cuentas.
   Se compensa con exportar/importar un archivo JSON.
2. **PWA publicada en GitHub Pages**, instalable en la pantalla de inicio. No se hace APK por ahora
   (Android Studio + JDK + firma no caben en el día); la PWA se puede envolver con Capacitor más adelante
   sin reescribir nada.
3. **Sin framework y sin build.** JavaScript plano, cargado con seis `<script defer>` en orden.
   **Sin módulos ES:** se probaron y rompían la regla de oro 8 — bajo `file://` el navegador los
   bloquea por CORS y abrir `index.html` con doble clic no ejecutaba nada (revertido el 2026-08-12).
4. **Progresión por tabla oficial de D&D 5e** (`docs/DATOS.md`), con corrección manual de nivel disponible
   por si la mesa juega por hitos.
5. **Toda la persistencia pasa por un único módulo** (`js/almacen.js`), de modo que cambiar a la nube
   en el futuro sea reemplazar ese archivo y nada más.
6. **El ícono define la identidad visual**: paleta de verde bosque, cobre, pergamino, musgo y naranja
   de champiñón, con contorno oscuro ilustrado (`docs/DISENO.md`). **El nombre ya no sale del ícono:**
   la app se llama "La era del Crepúsculo en Vaeloria" y el banderín del arte todavía dice "D&D CAMP".
7. **La clave de `localStorage` sigue siendo `dnd-camp-v1`** pese al cambio de nombre. Renombrarla
   dejaría huérfanos los personajes ya guardados, que es la peor falla posible (regla de oro 5).
   Es un identificador interno: no se ve en ninguna pantalla.

## Deuda pendiente

- **`app.js` va por 613 líneas**, pasada la marca de ~400 que `docs/ARQUITECTURA.md` §3 fija para
  partirlo. El corte natural: sacar la hoja de alta/edición a `js/formulario.js` (~180 líneas, apenas
  se roza con el reparto de PX). La Fase 5 no lo empeoró —se fue a su propio archivo—, así que ya no
  corre prisa; hacerlo cuando haya un hueco.
- **El arte del ícono todavía dice "D&D CAMP".** El banderín pintado en `Icono app.png` quedó en
  inglés y con el nombre viejo. Hay que rehacer ese texto en el arte **antes** de generar los iconos
  definitivos de la Fase 6, o la pantalla de inicio contradirá a la app. Es trabajo de ilustración,
  no de código.
- **Tipografías.** El bloque `@font-face` está escrito y comentado al inicio de `css/estilo.css`.
  Falta poner `cinzel.woff2` y `garamond.woff2` en `recursos/fuentes/` y descomentarlo.
  Mientras tanto se usa la serif del sistema (Georgia), que mantiene el tono sin coste ni red.
- **`icono-512.png` pesa 501 KB.** Hay que comprimirlo antes de que entre en la caché offline (Fase 6).

## Riesgos abiertos

- ~~**Tamaño de los tokens.**~~ Cerrado en la Fase 3: una foto de 1600×1000 sale como WebP de 4 KB.
  El aviso de espacio salta igualmente al acercarse a los 4 MB.
- **Compatibilidad de WebP en iOS antiguo.** Plan B ya escrito en `js/imagen.js`: cae a JPEG con la
  misma rutina. Sin verificar en un iPhone de verdad.
- **Instalación de PWA en iPhone.** Safari solo instala desde "Compartir → Añadir a pantalla de inicio".
  Documentarlo en el README; no es un fallo, es una limitación de Apple.

---

## Mapa de la documentación

| Archivo | Para qué sirve |
|---|---|
| `ESTADO.md` | **(estás aquí)** Fase actual, próximo paso, decisiones vigentes |
| `REGLAS.md` | Reglas de oro innegociables del proyecto |
| `README.md` | Qué es, cómo probarlo, cómo publicarlo, cómo instalarlo en el celular |
| `CLAUDE.md` | Instrucciones de arranque y convenciones para el asistente |
| `docs/ARQUITECTURA.md` | Stack, estructura de archivos, capas y por qué de cada decisión |
| `docs/FASES.md` | Plan de trabajo por fases con estimados y criterios de terminado |
| `docs/DISENO.md` | Paleta, tipografías, componentes, animación de subida de nivel |
| `docs/DATOS.md` | Modelo de datos, tabla de PX de 5e, migraciones, exportar/importar |
| `docs/ACTUALIZACIONES.md` | Bitácora cronológica de cambios (se agrega al final, nunca se reescribe) |
| `docs/APRENDIZAJE.md` | Lecciones, tropiezos y decisiones que cambiaron sobre la marcha |
