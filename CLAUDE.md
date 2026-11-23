# Instrucciones del proyecto — La era del Crepúsculo en Vaeloria

## Arranque de cada sesión

Antes de responder o tocar nada, leer en este orden:

1. **`ESTADO.md`** — fase actual, próximo paso concreto y decisiones ya cerradas.
2. **`REGLAS.md`** — reglas de oro innegociables.
3. **`docs/FASES.md`** — qué toca hacer ahora y con qué criterio se da por terminado.

Y según la tarea: `docs/ARQUITECTURA.md` (estructura y decisiones técnicas),
`docs/DISENO.md` (paleta, componentes, animaciones), `docs/DATOS.md` (modelo y tabla de PX),
`docs/APRENDIZAJE.md` (tropiezos ya conocidos, para no repetirlos).

**No proponer arquitecturas alternativas ya descartadas** (frameworks, bundlers, Firebase, APK):
las razones están escritas en `docs/APRENDIZAJE.md`. Si hay un motivo nuevo y fuerte para reabrir
una de esas decisiones, plantearlo explícitamente al usuario en vez de asumirlo.

## Convenciones

- **Todo en español**: interfaz, textos, nombres de archivo, variables, comentarios y documentación.
  Sin `ñ` ni tildes en nombres de archivo (`DISENO.md`, no `DISEÑO.md`).
- **Sin dependencias ni build.** HTML, CSS y JS planos. Nada de `npm install` para que la app corra,
  nada de recursos por CDN (rompería el offline).
- **Nada de módulos ES.** Los seis archivos de `js/` se cargan como `<script defer>` en orden de
  dependencia desde `index.html`, y comparten un único ámbito global. Los módulos se piden por red y
  el navegador los bloquea bajo `file://`, lo que dejaba la app muerta al abrirla con doble clic
  (regla de oro 8). **Al añadir un archivo nuevo:** su `<script>` va en `index.html` antes de `app.js`,
  y su nombre no puede repetir ninguno ya declarado — un `const` repetido rompe la carga entera.
- **Toda la persistencia pasa por `js/almacen.js`.** Ningún otro archivo toca `localStorage`.
- **La tabla de PX vive solo en `js/xp.js`.** No duplicarla en ningún otro sitio.
- **El nivel se calcula desde `xp`, nunca se guarda.**
- Móvil primero: diseñar y revisar a 360 px; todo lo tocable, mínimo 44×44 px.
- **El ícono `Icono app.png` manda sobre el estilo.** Ante cualquier duda visual, la respuesta es la que
  se parezca al ícono. La paleta ya está extraída de él en `docs/DISENO.md` §1.
- Comentarios escasos y solo donde el porqué no sea evidente. Nada de comentarios que repitan el código.

## Alcance

El alcance de la v1 está **congelado** en `docs/FASES.md`. Las ideas nuevas que aparezcan a mitad de
camino van a la sección "Fuera de alcance" de ese archivo; no se implementan sin que el usuario lo pida.
El plazo total es 1 día de trabajo: ante la duda, entregar algo terminado antes que algo más completo.

## Cierre de cada sesión

Ninguna sesión termina sin:

1. Actualizar **`ESTADO.md`**: fase, estado, próximo paso concreto y riesgos abiertos.
2. Agregar una entrada a **`docs/ACTUALIZACIONES.md`** (hecho / decidido / pendiente).
3. Si hubo un tropiezo, un recorte de alcance o un hallazgo no obvio, anotarlo en **`docs/APRENDIZAJE.md`**.
4. **Publicar:** si hubo cambios en la app, subir `VERSION` en `sw.js`, hacer commit, fusionar a `main` y
   `git push origin main`, para que https://vecmaw.github.io/vaeloria/ quede siempre al día (GitHub Pages
   solo publica `main`). Comprobar después con `curl` que la URL responde 200. Decisión del dueño, 2026-11-23.

El objetivo es que la siguiente sesión pueda retomar el trabajo leyendo solo `ESTADO.md`.
