# Aprendizaje

> Lo que costó descubrir: tropiezos, cosas que no funcionaron, decisiones que cambiaron sobre la marcha
> y trucos que conviene recordar. **No es un changelog** (eso es `ACTUALIZACIONES.md`): aquí va el *por qué*
> y el *ojo con esto*, para no repetir el mismo trabajo en otra sesión.

**Formato de entrada:**

```
### AAAA-MM-DD — Título corto
**Situación:** qué se intentaba.
**Qué pasó:** el tropiezo o el hallazgo.
**Conclusión:** qué hacer de ahora en adelante.
```

---

## Decisiones de arranque y su razón

### 2026-08-12 — Por qué no hay framework ni build
**Situación:** la tentación normal sería React con Vite, o al menos Tailwind.
**Qué pasó:** el alcance real es una lista, un formulario y una barra que se anima. Un bundler añade
tiempo de configuración, dependencias que envejecen, y una carpeta `dist` que complica publicar en Pages.
**Conclusión:** HTML, CSS y JS planos. Publicar es copiar los archivos tal cual.
Si algún día `app.js` pasa de ~400 líneas, se parte por componente antes que meter un framework.
*(La parte de "con módulos ES" de esta decisión se revirtió; ver la entrada del 2026-08-12 más abajo.)*

### 2026-08-12 — Por qué se descartó la sincronización en la nube
**Situación:** que todos en la mesa vean lo mismo en su celular suena mejor que datos locales.
**Qué pasó:** Firebase es gratis, pero suma proyecto de Google, reglas de seguridad, manejo de conflictos
y una dependencia de red que choca de frente con "debe funcionar en modo avión". Estimado: +2 a 3 horas
sobre un presupuesto de 7.
**Conclusión:** local primero, con toda la persistencia detrás de `js/almacen.js`. El día que haga falta
la nube, se reemplaza ese módulo y nada más. Mientras tanto, exportar/importar JSON cubre pasar la partida
a otro teléfono.

### 2026-08-12 — Por qué el nivel no se guarda
**Situación:** lo intuitivo es guardar `xp` y `nivel` juntos en cada personaje.
**Qué pasó:** dos campos que describen el mismo hecho terminan contradiciéndose en cuanto uno se edita a mano,
se importa un archivo viejo o falla a mitad una escritura.
**Conclusión:** se guarda solo `xp`; el nivel siempre se deriva con `xp.js`. Una sola fuente de verdad.

### 2026-08-12 — Por qué PWA y no APK todavía
**Situación:** "quizás una aplicación de móvil" era una de las opciones sobre la mesa.
**Qué pasó:** en Windows y desde cero, un APK exige Android Studio, JDK y firmar el paquete: medio día
extra como mínimo, antes de escribir una sola línea de la app.
**Conclusión:** PWA instalable ahora, que ya da ícono propio, pantalla completa y funcionamiento sin señal.
Capacitor puede envolver esta misma carpeta más adelante si se quiere un APK de verdad.

---

### 2026-08-12 — A 360 px no caben seis monedas y un interruptor en una fila
**Situación:** el primer boceto ponía en una sola fila el interruptor − / + y los botones 25, 50, 100,
250 y ⌨, siguiendo el esquema dibujado en `DISENO.md`.
**Qué pasó:** al mirarlo a 360 px reales, el ⌨ se descolgaba solo a una segunda línea, pegado a la
derecha. Las cuentas: quedan ~312 px útiles dentro de la ficha, el interruptor se lleva 88 con su
separación, y cinco círculos de 44 px con sus huecos piden 252.
**Conclusión:** dos filas. Arriba el interruptor y el ⌨; abajo las cinco monedas en una rejilla de
cinco columnas iguales, que a 360 px salen de ~56 px — más cómodas para el pulgar que las de 44.
**Y la lección general:** el ancho de 360 px hay que *mirarlo*, no estimarlo. Un boceto en ASCII no
avisa de que algo no cabe.

### 2026-08-12 — La ventana de Chrome no baja a 360 px para probar
**Situación:** verificar el diseño móvil redimensionando la ventana del navegador.
**Qué pasó:** `resize_window` aceptaba 380×820 pero `window.innerWidth` seguía informando 1080, así
que la media query de dos columnas nunca se desactivaba y el layout móvil no se podía juzgar.
**Conclusión:** inyectar por consola un `<style>` que fije `body{width:360px;margin:0 auto}` y fuerce
la lista a una columna. No es idéntico a un móvil de verdad —los elementos `fixed` siguen midiendo
según la ventana— pero basta para juzgar cómo se empaqueta el contenido de las fichas.

**Ampliado el 2026-08-12 (cambio de nombre):** ese truco **no basta**, y engaña. Estrechar el `body`
no cambia el ancho de la ventana, así que **`@media (min-width: 700px)` sigue activa**: se ve el
contenido empaquetado a 360 px pero con los estilos de escritorio. Midiendo el banderín nuevo salía
un título de 20 px en tres líneas, y las reglas móviles que acababa de escribir ni se estaban
aplicando. La forma honesta es desactivar la media query en la hoja real desde la consola:

```js
const hoja = [...document.styleSheets].find(h => h.href?.endsWith('estilo.css'));
const mq = [...hoja.cssRules].filter(r => r.type === CSSRule.MEDIA_RULE && r.conditionText.includes('700px'));
mq.forEach(r => { r.media.mediaText = 'not all'; });   // y '(min-width: 700px)' para restaurar
```

Así se comprueba el CSS del proyecto, no un parche escrito para la prueba.
**Y la lección general:** al simular un tamaño de pantalla, verificar que las media queries que
dependen de él **también** cambiaron. Si no, se está midiendo otra cosa.

### 2026-08-12 — En español, `Intl` no separa los miles de las cifras de cuatro dígitos
**Situación:** usar `new Intl.NumberFormat('es-ES')` para mostrar los PX como "3.450".
**Qué pasó:** devolvía `"3450"`. No es un fallo: el estándar para el español solo agrupa a partir de
cinco dígitos, así que en la misma columna convivían "3450" y "14.000".
**Conclusión:** `new Intl.NumberFormat('es-ES', { useGrouping: 'always' })`. Tipográficamente el RAE
daría la razón al comportamiento por defecto, pero en una columna de números la coherencia gana.
En navegadores antiguos la opción se ignora sin lanzar error y se vuelve al comportamiento anterior.
**Y la lección general:** las funciones de formato de idioma hacen cosas que uno no espera. Verificarlas
con un caso real antes de darlas por buenas.

### 2026-08-12 — Dos textos en la misma línea descuadran la lista
**Situación:** los PX (`3.450 / 6.500 PX`) y el "Faltan… para el nivel N" iban en una línea, separados
a los extremos.
**Qué pasó:** con números de cuatro dígitos cabían; con cinco o seis, no, y esas fichas pasaban a dos
líneas. La lista quedaba con fichas de distinta altura sin motivo aparente.
**Conclusión:** siempre en dos líneas. Un diseño que depende de la longitud del contenido se rompe solo
en cuanto el contenido crece.

### 2026-08-12 — El atributo `hidden` no gana contra tu propio CSS
**Situación:** ocultar el botón de eliminar y el de quitar foto con `elemento.hidden = true`.
**Qué pasó:** seguían viéndose. El navegador aplica `hidden` como `display: none` desde su hoja de
estilos, y **cualquier** regla propia con `display` la pisa: `.boton` usa `display: grid`, y ese grid
gana. El JavaScript estaba bien; el atributo estaba puesto; simplemente no ocultaba.
**Conclusión:** poner `[hidden] { display: none !important; }` en la base de la hoja de estilos, una
vez y para siempre. Es la solución estándar y evita este fallo en todos los componentes futuros.

### 2026-08-12 — `requestAnimationFrame` no dispara en una pestaña en segundo plano
**Situación:** para que la transición de apertura de la hoja tuviera un punto de partida, se añadía la
clase `is-abierta` dentro de un `requestAnimationFrame`.
**Qué pasó:** con la pestaña en segundo plano (`document.visibilityState === 'hidden'`) el navegador
deja de emitir fotogramas, el callback nunca se ejecutaba, y la hoja se quedaba con `opacity: 0` y sin
foco en el campo de nombre. Sale una hoja invisible pero que ya intercepta los toques.
**Conclusión:** usar un reflujo forzado (`void elemento.offsetWidth`) en lugar de `rAF` para arrancar
una transición. Es síncrono y no depende de que la pestaña esté pintando.
**Y la lección general:** nada que sea imprescindible para dejar la interfaz en un estado correcto
debe ir dentro de un `requestAnimationFrame`. Ahí solo va lo puramente visual.

### 2026-08-12 — Redibujar la lista entera mata cualquier animación
**Situación:** hasta la Fase 3, cada cambio pasaba por `dibujar()`, que reemplaza todas las fichas.
Para la Fase 4 lo natural era hacer lo mismo tras sumar PX.
**Qué pasó:** un nodo recién creado con el ancho final puesto en línea no transiciona — nace ya en su
sitio. La barra saltaba de golpe. Y de paso, el interruptor − / + volvía a `+` en cada toque, porque
su estado vive en el DOM y el DOM se acababa de tirar.
**Conclusión:** los cambios de PX actualizan la ficha en su sitio (`pintarProgreso` sobre el nodo que
ya está en la lista); las altas, ediciones y bajas siguen redibujando entero. La regla general:
**redibujar entero es una simplificación excelente hasta que algo tiene que animarse o recordar un
estado que no está en los datos.**

### 2026-08-12 — Una barra de progreso que cambia de tramo miente sobre la dirección
**Situación:** al subir de nivel, el porcentaje dentro del tramo salta de ~96 % a ~3 %.
**Qué pasó:** la barra recorría todo el camino hacia atrás mientras el aviso decía "+500 PX". Se lee
como una pérdida, justo en el momento que debería ser el bueno. Restar tiene el problema simétrico:
al bajar de nivel la barra *sube*.
**Conclusión:** cuando cambia el nivel, el relleno sale primero por el borde que abandona (100 % al
subir, 0 % al bajar) y vuelve a entrar por el contrario antes de asentarse. Dos tramos encadenados
con un `setTimeout` y un reflujo forzado para reposicionar sin transición.
**Y la lección general:** una barra de progreso relativa a un tramo no puede animarse sin más cuando
el tramo cambia bajo sus pies; hay que contar el salto, no ocultarlo.

### 2026-08-12 — La duración de una animación no se escribe dos veces
**Situación:** la segunda mitad de esa animación se lanza con `setTimeout`, así que el JS necesitaba
saber cuánto dura la transición que declara el CSS (700 ms).
**Qué pasó:** con `prefers-reduced-motion` el CSS recorta *todas* las transiciones a 120 ms, pero el
`setTimeout` seguía esperando 700: la barra se quedaba parada medio segundo a mitad de camino.
**Conclusión:** leerla del propio elemento con `getComputedStyle(nodo).transitionDuration`. Una sola
fuente de verdad, y la ruta de movimiento reducido funciona sola.
**Ojo al parsear:** el navegador la devuelve en segundos (`"0.7s"`), no en milisegundos.

### 2026-08-12 — Un `aria-live` dentro de algo con `hidden` no se anuncia
**Situación:** la barra de avisos se ocultaba con `aviso.hidden = true` y se mostraba poniendo el
texto y quitando el atributo.
**Qué pasó:** un lector de pantalla solo anuncia los cambios de una región viva que ya está en el
documento. Si la región aparece y desaparece con el mensaje dentro, no hay cambio que anunciar.
**Conclusión:** el contenedor con `role="status"` se queda **siempre** en el documento y se vacía con
`replaceChildren()`; lo que aparece y desaparece es la pastilla de dentro. Se oculta visualmente con
`.aviso:empty { display: none }` — y por eso la etiqueta del HTML va sin ni un espacio dentro.

### 2026-08-12 — `normalizarPX` convierte lo enorme en cero
**Situación:** el campo de cantidad libre acepta lo que el usuario escriba.
**Qué pasó:** `normalizarPX` descarta lo que no sea finito, así que un número disparatado llega como
`Infinity` y sale como **0**. Sumar muchísimo dejaría al personaje sin nada: exactamente la peor falla
posible (regla de oro 5) con forma de detalle de validación.
**Conclusión:** tope de 999.999 PX por operación, validado antes de tocar los datos.
**Y la lección general:** una función que "sanea" entradas raras puede convertir un error del usuario
en pérdida silenciosa de datos. Validar en la entrada, no confiar solo en el saneado del final.

### 2026-08-12 — Los módulos ES no funcionan con doble clic, y eso rompía la regla de oro 8
**Situación:** el dueño del proyecto avisó de que "el botón de nuevo aventurero no sirve". No servía
nada: ni la lista, ni las monedas de PX, ni el engranaje.
**Qué pasó:** abría `index.html` con doble clic. Con `<script type="module">` el navegador **pide** el
archivo por red aunque sea local, y bajo `file://` el origen es `null`, así que CORS lo bloquea y no
se ejecuta ni una línea. Los scripts clásicos no pasan por ahí y cargan sin problema.
La decisión "módulos ES nativos" venía de la Fase 0 y **contradecía la regla de oro 8** —*"Abrir
`index.html` debe bastar"*— desde el primer día. No se notó hasta la Fase 2 porque antes no había
JavaScript que cargar, y luego no se notó porque todas las verificaciones se hicieron con un servidor
local, que es justo el entorno donde el fallo no existe.
**Conclusión:** cinco `<script defer>` en orden de dependencia y un solo ámbito global. La conversión
fue barata (quitar `import`/`export`, añadir `'use strict'`) porque ningún archivo repetía nombres y
**ningún sitio de llamada cambió**.
**Y las dos lecciones generales, que valen más que el arreglo:**
1. **Verificar en el entorno donde se usa, no solo en el cómodo.** Un servidor local esconde
   exactamente esta clase de fallo. Si la regla dice "doble clic", hay que probar con doble clic.
2. **Una regla de oro que nadie comprueba no protege de nada.** La regla 8 estaba escrita, era clara,
   y aun así se violó en la Fase 0 y sobrevivió cuatro fases.

### 2026-08-12 — Verificar con clics programáticos no es verificar
**Situación:** al dar por buena la Fase 4, todas las comprobaciones se hicieron con `elemento.click()`
desde la consola.
**Qué pasó:** `.click()` **salta el hit-testing**: dispara el manejador aunque el elemento esté tapado,
fuera de pantalla o con `pointer-events: none`. Toda una clase de fallos —el más típico, un elemento
fijo que cubre un botón— pasa la prueba sin despeinarse. Y al revés: el primer intento de reproducir
el fallo con un clic real dio un falso positivo, porque las coordenadas de las capturas van escaladas
respecto a los píxeles CSS y el clic cayó fuera de la ventana.
**Conclusión:** para dar por bueno un control, un clic real en sus coordenadas, y comprobar antes con
`document.elementFromPoint(x, y)` que quien recibiría el clic es el elemento que se cree. Los
`.click()` valen para recorrer lógica deprisa, no para certificar que algo se puede tocar.

### 2026-08-12 — Una pestaña en segundo plano no pinta, y eso invalida media verificación
**Situación:** comprobar la celebración de la Fase 5 desde la consola de una pestaña controlada.
**Qué pasó:** tres falsos fallos seguidos, todos de la misma raíz —`document.visibilityState` era
`hidden` y el navegador no emitía **ni un fotograma en 500 ms**—:

1. *"Las demás fichas no se apagan"*. La regla casaba y `filter: saturate(.5)` sí se aplicaba, pero
   `opacity` seguía en 1. La diferencia: `opacity` tenía transición. Sin fotogramas, la transición se
   queda clavada en su valor inicial. `getAnimations()` lo delató: una `CSSTransition` *running* que
   no avanzaba nunca.
2. *"La celebración dura 360 ms"*. Ruido de relojes de clics anteriores; medida limpia: 2004 ms.
3. *"El sello no aparece"*. Chrome **estrangula los `setTimeout` encadenados** en pestañas de fondo
   (mínimo ~1 s), así que los pasos internos de 200 y 240 ms se estiraban a segundos.

Y las capturas tampoco salvan: la segunda devolvió el mismo fotograma viejo, porque no hay nada que
repintar.
**Conclusión:** en una pestaña que no se ve, fiarse solo de lo que no depende de fotogramas —el DOM,
las clases, `getBoundingClientRect()`, los valores calculados sin transición—. Para juzgar cómo *se ve*
algo animado, dos técnicas que sí funcionaron:

- **Chrome headless con `--screenshot`** sobre una maqueta estática que enlaza el CSS real, con
  `animation-play-state: paused` y `animation-delay` negativo para plantar cada animación en el
  fotograma que interesa. Con `--force-prefers-reduced-motion` se comprueba de paso la ruta reducida.
- **Congelar las animaciones vivas** con `getAnimations()`, `a.currentTime = ...` y `a.pause()`.

**Y la lección general:** antes de creerse un fallo raro de CSS, comprobar `document.visibilityState`
y contar fotogramas. Tres "fallos" de esta sesión eran el mismo entorno mintiendo.

### 2026-08-12 — Una maqueta de prueba también miente
**Situación:** para ver la celebración se hizo una copia estática del marcado en el bloc de notas.
**Qué pasó:** la maqueta se desbordaba por la derecha y parecía que el rótulo *"{nombre} sube de nivel"*
no cabía en la ficha. En la app real, medido, el rótulo ocupa 305 px dentro de 344 y sobra a los dos
lados; con un nombre de 29 caracteres pasa a dos líneas y `scrollWidth` sigue siendo 360.
**Conclusión:** la maqueta sirve para *mirar* colores y formas, no para medir. Cualquier conclusión
sobre tamaños se confirma en la app real, con `getBoundingClientRect()`.

---

## Ojo con esto (avisos para el yo del futuro)

- **`localStorage` son ~5 MB en total, y las fotos se los comen.** Un token sin comprimir de la galería
  de un celular pesa varios megas. Siempre pasar por `js/imagen.js` (160 px, WebP) antes de guardar.
- **El service worker sirve la versión vieja si no se cambia el nombre de la caché.** Al publicar un cambio,
  subir la versión de la caché y borrar las anteriores al activar, o nadie verá la actualización.
- **En iPhone, la PWA solo se instala desde Compartir → Añadir a pantalla de inicio.** No aparece ningún
  botón de instalar. No es un fallo del código.
- **GitHub Pages sirve por HTTPS**, que es obligatorio para los service workers. Abrir `index.html` con
  doble clic (`file://`) sirve para el uso normal —comprobado: los scripts cargan y `localStorage`
  guarda y persiste—, pero **no** registra el service worker: para probar el modo avión de la Fase 6
  hace falta un servidor local o la URL publicada.
- **Nada de `<script type="module">`.** Bajo `file://` el navegador los bloquea por CORS y la app queda
  muerta. Los archivos de `js/` se cargan como `<script defer>` en orden desde `index.html`.
- **Restar PX puede bajar de nivel.** Es un caso real (corregir un error de la sesión anterior), no un
  caso raro: hay que manejarlo sin celebración y sin dejar la barra en un estado inconsistente.
- **Modo en línea acordado (2026-11-23): se reabren las reglas 4 y 6, solo para ese modo.** Cada quien edita solo su personaje; Firebase; identidad anónima con código de recuperación. Cambia lo descartado antes ("sin sincronización") porque el grupo quiere ver a los demás en directo y la plataforma lo hará necesario. Ojo: Cloud Functions exige tarjeta (regla 1), así que la recuperación de identidad debe resolverse solo con reglas de Firestore; validar antes de la Fase 11.
- **La plataforma del grupo choca con varias reglas de oro (1, 4, 6, 7, 8), y se decidió no reabrirlas
  todavía (2026-11-23).** La v1 standalone las conserva. Lo que sí deja la puerta abierta es que
  `almacen.js` sea la única puerta a los datos y que `xp.js`, `clases.js` y `celebracion.js` no
  dependan de la pantalla: no romper eso, porque es lo que hará barato el módulo.
