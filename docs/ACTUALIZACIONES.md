# Bitácora de Actualizaciones

> Registro cronológico, **de lo más nuevo a lo más viejo**. Se agregan entradas, no se reescriben las anteriores.
> Toda sesión de trabajo termina con una entrada aquí y con `ESTADO.md` actualizado (regla de oro 11).

**Formato de entrada:**

```
## AAAA-MM-DD — Fase N: título
**Hecho:** qué quedó funcionando.
**Decidido:** decisiones tomadas y por qué (las grandes también van a ESTADO.md).
**Pendiente:** lo que quedó a medias y con qué continuar.
```

---

## 2026-11-23 — Selector de clase y tokens de la mesa

**Hecho:**
- Las 13 clases se eligen ahora con tablillas de pergamino (emoji + nombre) en vez del `<select>`; la elegida se enciende en cobre. Valor en un `<input hidden>`, validación igual que antes.
- `js/tokens-base.js` (archivo nuevo): 4 tokens de la mesa (desde `DND/TOKENS`) a 160 px WebP, incrustados como `data:` URL. En la hoja, bajo "Elegir foto", aparecen para elegir con un toque; otro toque los suelta.
- `sw.js` pasa a `vaeloria-v2` y cachea el archivo nuevo.
- `DND/` (material de trabajo con PDFs) va al `.gitignore`.
- Verificado en Chrome: 13 fichas de clase, 4 tokens, elegir/soltar, guardar y la ficha muestra el token; sin errores en consola.

**Decidido:** los tokens van incrustados y **no** como archivos `.png`: bajo `file://` un `<canvas>` no puede leer imágenes sueltas, y así el valor guardado es idéntico al de una foto propia (sin cambio de modelo de datos ni migración).

**Pendiente:** ampliar el pool (convertir a 160 px y sumar entrada en `tokens-base.js`); revisar el selector en un celular real. Alcance nuevo pedido por el usuario, fuera del plan original de la v1.

---

## 2026-11-23 — Fase 6: PWA instalable y offline (código)

**Hecho:**
- `manifest.webmanifest`, `sw.js` (caché `vaeloria-v1`, cache-first, borra cachés viejas al activar) y `js/pwa.js` (registro del SW y `storage.persist()`; no registra bajo `file://`).
- `icono-maskable-512.png` nuevo (arte al 66 % sobre verde) e `icono-512.png` comprimido de 501 a 125 KB con ffmpeg (paleta de 128 colores).
- Comprobado por script: todos los archivos de la caché existen, el manifest es JSON válido y no hay nombres globales repetidos.

**Decidido:** `pwa.js` va aparte y no en `app.js`, que ya pasa de 600 líneas.

**Pendiente:** probar instalación y modo avión en el celular contra la URL publicada; rehacer el banderín "D&D CAMP" y regenerar iconos.

---

## 2026-11-23 — Retomar el proyecto y planificar GitHub y plataforma

**Hecho:**
- Revisión del estado: v1 funcionalmente completa (Fases 0-5); faltan 6 y 7 y la deuda conocida.
- `FASES.md`: Fase 7 ampliada con GitHub, nueva Fase 8 condicionada y sección "Flujo de trabajo con GitHub".
- `.gitignore` creado y `git init` local. README corregido (decía que la Fase 5 faltaba).

**Decidido:**
- Terminar la v1 primero y publicarla en Pages como demo del módulo.
- No reabrir ninguna regla de oro todavía; se revisarán cuando el grupo defina la plataforma.
- Repo en cuenta personal por ahora, transferible al grupo.

**Pendiente:**
- Crear el repo remoto en GitHub y hacer el primer commit (no hay `gh`; se hace desde la web o instalándolo).
- Fase 6. Deuda: banderín "D&D CAMP", tipografías, `icono-512.png`, partir `app.js`.

---

## 2026-08-12 — Fase 5: Celebración de subida de nivel

**Hecho:**
- `js/celebracion.js` (archivo nuevo) con la secuencia de `DISENO.md` §5: fogonazo en la barra,
  velo con viñeteado verde-cálido, ficha elevada y enderezada con halo de fuego, sello de lacre que
  cae y rebota, 14 esporas doradas, y el número nuevo entrando desde escala 1.6 con rebote.
  Duración medida: **2,0 s**. `navigator.vibrate(60)` si el navegador lo permite.
- Saltable: un toque en el velo o en la propia ficha —o Escape— la corta en seco y deja todo limpio.
- Ruta corta de `prefers-reduced-motion`: solo el fundido del sello y el texto, sin esporas, sin
  caída, sin fogonazo y sin ampliación.
- Verificado: cruzar un umbral la dispara una sola vez; un salto de siete niveles de golpe produce
  **una** celebración; sumar sin cruzar umbral no la dispara; bajar de nivel tampoco; el rótulo con
  un nombre de 29 caracteres pasa a dos líneas sin desbordar a 360 px; y la ruta reducida se comprobó
  con `--force-prefers-reduced-motion`.

**Decidido:**
- **Va en un archivo aparte y no en `app.js`**, que ya estaba pasado de tamaño. `celebracion.js` solo
  pinta: recibe la ficha ya actualizada y no toca datos ni almacenamiento.
- **El instante 0 es cuando la barra acaba de llenarse**, no cuando se toca la moneda. Se cuelga del
  mismo lote de relojes que la barra, así un toque nuevo cancela la celebración pendiente junto con
  la animación que la iba a acompañar.
- **Deshacer no celebra**, ni cuando devuelve un nivel recién perdido: es una corrección, no un logro,
  y convertía el botón *Deshacer* en una fiesta.
- **El número va dentro del sello grande y no hay línea "¡NIVEL 6!" aparte.** En una tarjeta de 348 px
  era decir dos veces lo mismo. Desvío consciente respecto a `DISENO.md` §5, anotado allí.
- **La lista entera sube por encima del velo** y se apagan las demás fichas una a una: `.campamento`
  crea su propio contexto de apilamiento, así que elevar solo la ficha que sube no funcionaba.

**Pendiente:**
- Fase 6 — PWA instalable y offline. Ojo: el service worker tendrá que cachear también
  `js/celebracion.js`.
- Sigue pendiente partir `app.js` (613 líneas), rehacer el banderín del ícono y las dos tipografías.

---

## 2026-08-12 — Fuera los módulos ES: la app volvía a no abrirse con doble clic

**Corregido:**
- **La app no funcionaba al abrir `index.html` con doble clic.** No fallaba el botón de alta: no se
  ejecutaba ni una línea de JavaScript. `<script type="module">` hace que el navegador pida el archivo
  por red, y bajo `file://` CORS lo bloquea. Era una violación de la **regla de oro 8** presente desde
  la Fase 0 y oculta hasta ahora porque todas las verificaciones se hicieron con un servidor local.
- Los cinco archivos de `js/` pasan a `<script defer>` en orden de dependencia
  (`xp → clases → almacen → imagen → app`), con un único ámbito global y `'use strict'` en cada uno.
  Se quitaron los `import`/`export`; **ningún sitio de llamada cambió**, porque los nombres siguen
  siendo visibles entre archivos.
- Verificado bajo `file://` con Chrome headless: los cinco scripts cargan, `app.js` llega hasta el
  final (las 13 clases aparecen inyectadas en el selector) y `localStorage` **escribe y persiste**
  entre visitas. Verificado también por `http://` que el alta, los PX y el deshacer siguen igual.

**Decidido:**
- **Ningún archivo de `js/` puede repetir un nombre de nivel superior.** Sin módulos, un `const`
  repetido en dos archivos no es un aviso: es un `SyntaxError` que tumba la carga entera. Hay 93
  nombres globales y ninguno repetido; el `grep` que lo comprueba está en `ARQUITECTURA.md` §2.
- **Se acepta el ámbito global compartido** como precio. En cinco archivos sin dependencias sale
  barato; la alternativa (un objeto de espacio de nombres) obligaba a tocar todos los sitios de llamada
  sin arreglar nada más.

**Detectado, no arreglado:**
- **`app.js` va por 613 líneas**, pasada la marca de ~400 que `ARQUITECTURA.md` fija para partirlo.
  El corte natural es sacar la hoja de alta/edición a `js/formulario.js`. Conviene hacerlo antes de
  que la Fase 5 le sume la celebración.

---

## 2026-08-12 — La app pasa a llamarse "La era del Crepúsculo en Vaeloria"

**Hecho:**
- Cambiado el nombre en el `<title>`, en el banderín de la cabecera y en la documentación viva
  (`ESTADO.md`, `README.md`, `REGLAS.md`, `CLAUDE.md`, `ARQUITECTURA.md`, `DISENO.md`, `FASES.md`).
  Las entradas viejas de esta bitácora se dejan como estaban: son un registro de lo que pasó.
- El banderín ya no cabía en una línea a 360 px. Ahora se parte siempre por el mismo sitio
  (*La era del Crepúsculo* / *en Vaeloria*) con un `<span>` que pasa a `display: block`, y vuelve a
  una línea desde 700 px. El ícono de la cabecera baja de 44 a 38 px para dar los píxeles que faltaban.
- Verificado a 360 px y en escritorio: dos líneas y una línea respectivamente, sin desborde, y la
  app sigue funcionando igual (alta, PX, deshacer).

**Decidido:**
- **La clave de `localStorage` se queda en `dnd-camp-v1`.** Renombrarla al nombre nuevo dejaría
  huérfanos todos los personajes guardados — la peor falla posible (regla de oro 5) a cambio de una
  coherencia que nadie ve, porque es un identificador interno.
- **El `short_name` del manifiesto de la Fase 6 será "Vaeloria".** En la pantalla de inicio de Android
  caben unos 12 caracteres; el nombre completo saldría cortado de todos modos.
- **El ícono deja de mandar sobre el nombre**, solo sobre la paleta y el mundo. Su banderín pintado
  sigue diciendo "D&D CAMP" y hay que rehacerlo antes de la Fase 6.

**Pendiente:**
- Rehacer el texto del banderín en `Icono app.png` y regenerar los tamaños. Es trabajo de ilustración.
- Revisar si el vocabulario de campamento ("El campamento está vacío", "Sentar junto al fuego",
  "Echar del campamento") sigue encajando con el nombre nuevo. Por ahora se deja: un campamento en
  Vaeloria durante la era del Crepúsculo no contradice nada.

---

## 2026-08-12 — Fase 4: Sumar y restar PX

**Hecho:**
- Los botones de PX ya funcionan. El interruptor − / + fija el signo de cada ficha por separado,
  las cinco monedas (25, 50, 100, 250, 500) aplican el cambio y el ⌨ despliega un campo de cantidad
  libre con su botón *Aplicar*, que también responde a Enter y se cierra con Escape.
- La barra se anima al nuevo porcentaje y el sello, las cifras y los `aria-` se recalculan; al restar,
  el relleno se tiñe de vino mientras retrocede.
- **Deshacer de un paso** sobre la barra de avisos: *"+100 PX a Thalia Sombralarga · Deshacer"*.
  Vive lo que dura el aviso (6 s), que es lo que dura el arrepentimiento por un toque equivocado.
- Bajar de nivel se resuelve sin celebración: el sello gira medio segundo y el aviso dice
  *"vuelve al nivel N"*. Subir de nivel, por ahora, solo lo anuncia el aviso; la celebración es la Fase 5.
- Verificado en el navegador a 360 px: suma, resta, deshacer, cantidad libre con sus dos validaciones,
  restar en 0 (se queda en 0 y avisa), subir a nivel 20 (*"Nivel máximo alcanzado"*), bajar de nivel,
  que todo sobrevive a la recarga y que dar de alta un personaje en mitad de una animación no descuadra
  nada. Sin errores en consola.

**Decidido:**
- **Los cambios de PX ya no redibujan la lista.** `dibujar()` reemplaza los nodos, y un nodo nuevo no
  anima: la barra saltaría de golpe y el interruptor − / + volvería a `+` en cada toque. Las altas,
  ediciones y bajas siguen redibujando entero, que es donde esa simplicidad compensa.
- **Al cambiar de nivel la barra sale por un borde y entra por el otro.** Animar del 96 % al 3 % se
  lee como una pérdida. Ahora el relleno se llena hasta el 100 %, vuelve a entrar por el 0 % y se
  asienta — y al bajar, al revés. Es además el arranque que la Fase 5 necesita para la celebración.
- **La duración de la animación se lee del CSS** con `getComputedStyle`, no se repite en el JS. Así
  `prefers-reduced-motion` (que la recorta a 120 ms) no descoloca los tiempos del segundo tramo.
- **La cantidad libre es una fila dentro de la propia ficha**, no un modal ni un `prompt()`. Y se le
  quitan las flechitas al `input[type=number]`: son un control del sistema en plena ficha de pergamino.
- **Tope de 999.999 PX por operación** en el campo libre. Sin él, un número disparatado llega a
  `normalizarPX` como `Infinity` y devuelve 0: sumar mucho dejaría al personaje sin nada.

**Pendiente:**
- Fase 5 — la celebración de subida de nivel. El punto de enganche es `escribirPX`, que ya devuelve
  el signo del cambio de nivel, y la barra ya llega al 100 % antes de reiniciarse.
- Sigue pendiente lo de la Fase 1: las dos tipografías `.woff2` y comprimir `icono-512.png`.

---

## 2026-08-12 — Fase 3: Alta, edición y token

**Hecho:**
- La hoja emergente ya la controla `app.js`: se abre desde el botón de alta o tocando la cabecera de
  una ficha, y se cierra con Cancelar, con el velo o con Escape. Fuera el andamio de `:target`.
- Un solo formulario sirve para crear y para editar: cambian el título, el texto del botón de guardar
  y la aparición del botón de eliminar.
- Validación de nombre (1-30, se recortan espacios) y clase, con mensajes bajo cada campo.
- `js/imagen.js`: recorta la foto al cuadrado central, la reduce a 160 px y la comprime a WebP, con
  JPEG de respaldo donde no haya WebP. Medido: una foto de 1600×1000 y 31 KB sale en **4 KB**.
- Eliminar pide confirmación en dos toques sobre el propio botón.
- Barra de avisos (`#aviso`) reutilizable, que ya sirve para los errores de imagen, el borrado y el
  aviso de espacio; en la Fase 4 la usará el "Deshacer".
- Las opciones del selector de clase se generan desde `js/clases.js`, sin duplicar la lista en el HTML.

**Corregido:**
- **El atributo `hidden` no ocultaba nada** en los botones. Cualquier regla propia con `display` lo
  pisa, y `.boton` usa `display: grid`, así que el botón de eliminar y el de quitar foto aparecían al
  crear un personaje. Resuelto con `[hidden] { display: none !important }` en la base del CSS.
- **La hoja se quedaba invisible si la pestaña estaba en segundo plano.** La transición se activaba
  dentro de un `requestAnimationFrame`, y ahí el navegador no dispara fotogramas. Sustituido por un
  reflujo forzado (`void hoja.offsetWidth`), que no depende de que la pestaña esté pintando.

**Decidido:**
- **Toda la cabecera de la ficha es el botón de editar**, con un lápiz junto a la clase como pista.
  Un botón aparte no cabía: entre el token y el sello no quedaba ancho para el nombre a 360 px.
- **Nada de `confirm()` del navegador** para borrar: bloquea la página y rompe la ambientación.
  El propio botón pasa a "¿Seguro? Toca otra vez" durante cuatro segundos.
- **Los personajes nuevos empiezan con 0 PX.** No se pide la experiencia inicial en el alta; si hace
  falta, se ajusta con los botones de PX.

**Pendiente:**
- Fase 4 — cablear los botones de experiencia y el deshacer.
- Sigue pendiente lo de la Fase 1: las dos tipografías `.woff2` y comprimir `icono-512.png`.

---

## 2026-08-12 — Fase 2: Motor de experiencia y persistencia

**Hecho:**
- `js/xp.js`: los 20 umbrales de 5e y las funciones puras `normalizarPX`, `nivelDesdeXP`,
  `pxParaNivel`, `progresoEnNivel` y `formatearPX`.
- `js/clases.js`: las 13 clases con nombre y emoji, más `claseValida()`.
- `js/almacen.js`: `cargar`, `guardar`, `respaldar`, `bytesUsados`, `validarPersonaje`, `nuevoId`.
  Clave de `localStorage`: `dnd-camp-v1` (antes en la documentación figuraba `taberna-nivel-v1`).
- `js/app.js`: dibuja la lista clonando un `<template>` del HTML; las fichas escritas a mano
  desaparecen del marcado. Estado vacío con su mensaje.
- Verificado: 54 comprobaciones del motor de PX en verde, incluidos los 20 umbrales y el PX anterior
  a cada uno. En el navegador: sobrevive a la recarga; un personaje con clase desconocida o sin nombre
  se descarta sin arrastrar al resto; ni un JSON corrupto ni datos de una versión superior borran lo
  guardado; y el nivel 20 muestra "Nivel máximo alcanzado" sin intentar calcular un siguiente umbral.

**Decidido:**
- **Se fuerza el agrupado de miles** (`useGrouping: 'always'`). En español, las cifras de cuatro
  dígitos no llevan separador, así que salía "3450" junto a "14.000" y la columna se leía mal.
- **Las cifras de PX van siempre en dos líneas.** Puestas una al lado de otra, unas fichas caben en
  una línea y otras no, y la lista se veía descuadrada.
- **Se añade `js/clases.js`**, que no estaba en el plan: la lista de clases la necesitan tanto el
  dibujado como la validación, y no pertenece ni a `xp.js` ni a `almacen.js`.
- **Los datos del usuario entran por `textContent`**, nunca por `innerHTML`. Un nombre con `<b>` se
  muestra tal cual, como texto.

**Pendiente:**
- Fase 3 — la hoja emergente con lógica real, `js/imagen.js` y el borrado con confirmación.
- Sigue pendiente lo de la Fase 1: las dos tipografías `.woff2` y comprimir `icono-512.png`.

---

## 2026-08-12 — Fase 1: Esqueleto y ambientación

**Hecho:**
- Creada `recursos/` con `iconos/` y `fuentes/`. `Icono app.png` movido y renombrado a
  `recursos/iconos/icono-original.png` (sin espacios en la ruta, que es la fuente del arte).
- Generados por reescalado bicúbico `icono-512.png` (501 KB), `icono-192.png` (77 KB) y
  `icono-64.png` (10 KB), este último ya en uso como favicon y como marca de la cabecera.
- `index.html`: pantalla única completa — cabecera-banderín, lista con dos fichas de ejemplo escritas
  a mano, botón fijo de alta y hoja emergente con el formulario entero (nombre, las 13 clases, token).
- `css/estilo.css`: paleta del ícono en variables, fondo con vetas, resplandor de fogata, ficha de
  pergamino con contorno oscuro y giro leve, sello de lacre, barra de PX, monedas de cobre,
  hoja emergente, dos columnas desde 700 px y ruta de `prefers-reduced-motion`.
- Verificado en el navegador a 360 px: sin desborde horizontal.

**Decidido:**
- **Las monedas van en dos filas**: arriba el interruptor − / + y el botón ⌨; abajo las cinco monedas
  (25, 50, 100, 250, 500) en rejilla de cinco columnas iguales. En una sola fila no caben a 360 px.
  Se cae el valor 1000, que queda cubierto por el campo de cantidad libre.
- **Sin `.woff2` todavía**: el bloque `@font-face` queda escrito y comentado, y se usa la serif del
  sistema. Antes que meter un CDN de fuentes y romper el offline, se usa Georgia.
- **La hoja emergente abre con `:target`**, CSS puro, para poder juzgar su diseño sin JavaScript.
  Es un andamio consciente: la Fase 3 lo sustituye por JS.
- Se maquetó el formulario completo, que en el plan era de la Fase 3, porque su diseño se juzga mejor
  junto al resto. La Fase 3 queda solo con lógica.

**Pendiente:**
- Fase 2 — `js/xp.js` y `js/almacen.js`, y que `app.js` dibuje la lista desde el estado.
- Conseguir las dos tipografías y descomentar el `@font-face`.
- Comprimir `icono-512.png` antes de la Fase 6.

---

## 2026-08-12 — Fase 0: Planificación y documentación

**Hecho:**
- Definido el proyecto: **"D&D Camp"**, gestor de experiencia de D&D 5e en una sola pantalla.
- Evaluadas cuatro alternativas técnicas (PWA local, PWA con Firebase, APK con Capacitor, HTML suelto)
  contra las restricciones de costo cero, uso móvil, funcionamiento offline y un solo día de trabajo.
- Escritas las reglas de oro (`REGLAS.md`) y la estructura completa de documentación:
  `ESTADO.md`, `README.md`, `CLAUDE.md` y `docs/` con arquitectura, fases, diseño, datos, bitácora y aprendizaje.
- Congelado el alcance de la v1 en siete fases con estimados y criterios de terminado.
- Incorporado `Icono app.png` (aventurero-champiñón, marco de cobre rúnico, banderín "D&D CAMP")
  como arte definitivo: de él salen el nombre de la app, la paleta completa y los iconos de la PWA.

**Decidido:**
- **Datos solo locales** (`localStorage`), uno por dispositivo, sin nube ni cuentas. Compensado con
  exportar/importar un archivo JSON. Motivo: es lo único que cabe en el día y cumple offline de verdad.
- **PWA publicada en GitHub Pages**, instalable en la pantalla de inicio. Descartado el APK por ahora:
  Android Studio, JDK y la firma del paquete no caben en el plazo, y se puede añadir después sobre esta misma base.
- **Sin framework y sin build**: HTML, CSS y JS planos con módulos ES nativos.
- **Toda la persistencia detrás de un único módulo** (`js/almacen.js`) para dejar barata una futura nube.
- **El nivel se calcula, no se guarda**: la única fuente de verdad es `xp`.
- Progresión con la **tabla oficial de 5e** (20 umbrales, de 0 a 355 000 PX).
- **La interfaz se subordina al ícono**: verde bosque de fondo, cobre en los marcos, pergamino para el
  contenido, naranja de champiñón como acento y contorno oscuro en todo, para que app e ícono se lean
  como una sola pieza. Reemplaza la idea inicial de taberna en madera oscura y latón.

**Pendiente:**
- Fase 1 — Esqueleto y ambientación. Empezar por `index.html` y `css/estilo.css` con dos personajes
  escritos a mano para juzgar el diseño antes de programar la lógica.
- Conseguir las tipografías Cinzel y EB Garamond en `.woff2` subconjunto latino (máximo 120 KB entre las dos).
