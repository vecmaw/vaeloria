# Diseño — La era del Crepúsculo en Vaeloria

## 0. Identidad visual

El proyecto ya tiene su ícono: **`Icono app.png`** (1024×1024) — un pequeño aventurero-champiñón con
capa raída y colgante de d20, dentro de un marco de cobre con runas grabadas y un banderín que dice
**"D&D CAMP"**, todo sobre verde bosque profundo.

**Ese ícono manda sobre toda la interfaz.** La app y su ícono deben verse como la misma cosa:
si alguien ve el ícono en la pantalla de inicio y luego abre la app, no debe notar un salto de estilo.

> ⚠️ **Conflicto abierto (2026-08-12).** La app se llama ahora *La era del Crepúsculo en Vaeloria*,
> pero el banderín del arte del ícono sigue diciendo **"D&D CAMP"**, en inglés. La paleta y el mundo
> del ícono siguen mandando; lo que ya no coincide es el texto. Hay que rehacer ese banderín en el
> arte antes de generar los iconos definitivos de la Fase 6. Ver `ESTADO.md`, deuda pendiente.

**Sensación buscada:** un campamento acogedor al borde del bosque, o la taberna donde ese campamento
se refugia cuando llueve. Cálido, redondeado, ilustrado, con humor amable. Madera, cobre, pergamino,
musgo y luz de fuego.

**Prueba de fuego:** si una pantalla podría pasar por un panel de administración con colores verdes,
está mal resuelta. Nada de tétrico, nada de épico-oscuro, nada de controles genéricos de navegador.

---

## 1. Paleta — tomada del ícono

```css
:root {
  /* Verde bosque — fondo general (el verde del ícono) */
  --bosque-noche:  #22362A;  /* fondo de la página */
  --bosque:        #2C4535;  /* paneles y superficies elevadas */
  --bosque-musgo:  #3C5A44;  /* separadores y relieves */

  /* Cobre — marcos, bordes, herrajes (el marco rúnico) */
  --cobre-sombra:  #7A5334;
  --cobre:         #A9784E;
  --cobre-brillo:  #C99A6B;

  /* Pergamino — superficies de contenido (el banderín) */
  --pergamino:     #EFE5CE;
  --pergamino-som: #D8C5A0;

  /* Hongo — acento principal, celebración, nivel (el sombrero) */
  --hongo:         #D0602C;
  --hongo-hondo:   #A94A22;
  --hongo-punto:   #F2ECD9;  /* los lunares blancos del sombrero */

  /* Musgo — sumar PX, confirmar */
  --musgo:         #7C9A55;
  --musgo-hondo:   #5C7A46;

  /* Luz de fuego — resplandores y subida de nivel */
  --fuego:         #F0A24B;
  --fuego-tenue:   rgba(240, 162, 75, 0.20);

  /* Vino — restar PX, eliminar */
  --vino:          #8E3B2A;

  /* Tinta sobre pergamino */
  --tinta:         #24322A;
  --tinta-suave:   #55645A;

  /* Contorno — el trazo oscuro que define todo en el ícono */
  --contorno:      #1A281F;
}
```

**Reglas de uso**
- Fondo de la página: `--bosque-noche` con vetas de madera muy sutiles en CSS (gradientes repetidos, sin imágenes).
- El contenido siempre va sobre pergamino; el texto sobre pergamino siempre es `--tinta`.
- **Contorno oscuro en todo**, como en el ícono: tarjetas, botones y tokens llevan un borde de 2 px
  en `--contorno`. Es lo que hace que la interfaz se lea como ilustración y no como formulario.
- El naranja del hongo es el acento fuerte: nivel, celebración y poco más. Si se usa en todo, deja de destacar.
- El resplandor de fuego vive en una sola esquina de la pantalla (gradiente radial fijo), no en cada tarjeta.

---

## 2. Tipografía

| Uso | Fuente | Alternativa del sistema |
|---|---|---|
| Títulos, nombres, número de nivel | **Cinzel** (romana con capiteles, como el banderín del ícono) | `Georgia, 'Times New Roman', serif` |
| Cuerpo, cifras de PX, botones | **EB Garamond** | `Georgia, serif` |

Ambas se descargan una sola vez como `.woff2` **subconjunto latino** y viven en `recursos/fuentes/`
(un CDN rompería el offline — regla de oro 2). Presupuesto: **máximo 120 KB entre las dos**.
Si se pasan, se usa solo Cinzel para los títulos y la serif del sistema para el resto.

Tamaños base (móvil): cuerpo 16 px, nombre del personaje 20 px, número de nivel 28 px, cifras de PX 15 px.
`font-variant-numeric: tabular-nums` en todo número que cambie, para que nada "salte" al animarse.

---

## 3. Pantalla única

```
┌───────────────────────────────┐
│ 🍄 ║La era del Crepúsculo║ ⚙ │  ← banderín de pergamino sobre marco de cobre
│    ║    en Vaeloria      ║    │     (dos líneas a 360 px, una desde 700 px)
├───────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ ◯  Thalia Sombralarga  ④ │ │  ← token · nombre · sello de nivel
│ │    Pícaro                 │ │
│ │  ▓▓▓░░░░░░░░░░░░░░░░░░░░░ │ │  ← barra que se llena
│ │  3.450 / 6.500 PX         │ │
│ │      Faltan 3.050 → nivel 5│ │
│ │  [ − │ + ]            [ ⌨ ]│ │  ← signo y cantidad libre
│ │  (25) (50) (100)(250)(500)│ │  ← valores rápidos, una fila completa
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ◯  Bruno Yunque        ③ │ │
│ │    ...                    │ │
│ └───────────────────────────┘ │
│                               │
│      ⊕  Nuevo aventurero      │  ← botón fijo abajo, siempre visible
└───────────────────────────────┘
```

La cabecera reproduce el banderín del ícono: pergamino con extremos enrollados, letras en Cinzel,
sobre una banda de cobre con runas grabadas (repetidas en CSS, no como imagen).

El nombre es largo, así que a 360 px va en **dos líneas partidas siempre por el mismo sitio**
(*La era del Crepúsculo* / *en Vaeloria*), con un `<span>` que pasa a `display: block`; desde 700 px
vuelve a una sola línea. Medido: la línea larga pide 177 px y el banderín ofrece 182 a 360 px, margen
que se consiguió bajando el ícono de la cabecera de 44 a 38 px — es decorativo, no se toca, así que
no le aplica el mínimo táctil. **Si el nombre vuelve a cambiar, hay que volver a medir esto.**

Crear y editar personajes ocurre en una **hoja emergente** que sube desde abajo sobre esta misma
pantalla. No hay navegación ni segunda vista (regla de oro 7).

---

## 4. Componentes

### Tarjeta de personaje — "ficha clavada en el tablón"
Pergamino con esquinas ligeramente irregulares (`border-radius` desigual), contorno oscuro de 2 px
y borde interior de cobre, sombra cálida hacia abajo y una leve rotación (±0,4°, alternada por posición)
para que parezca clavada a mano.
El token es circular con marco de cobre; sin foto, muestra el emoji de la clase sobre verde bosque.

### Sello de nivel
Círculo de lacre en `--hongo-hondo` con el número en `--pergamino`, arriba a la derecha de la ficha,
con el mismo contorno oscuro. Es el elemento de mayor jerarquía visual después del nombre.

### Barra de experiencia
Canal excavado con contorno oscuro y borde interior de cobre. El relleno es un gradiente
(`--fuego` → `--hongo`) con una banda clara arriba y un brillo que se desliza al llenarse.
- Transición: `width 700ms cubic-bezier(.2,.8,.25,1)`.
- Al **restar**, la misma transición en sentido inverso, con el relleno tintado a `--vino` durante el movimiento.
- Debajo, siempre: `3.450 / 6.500 PX` y `Faltan 3.050 para el nivel 6`.
- Nivel 20: barra llena con textura de cobre y el texto *"Nivel máximo alcanzado"*.

### Botones de PX — "monedas"
Discos de cobre con relieve y contorno oscuro, repartidos en **dos filas**:

- **Fila superior:** el interruptor sumar/restar a la izquierda y el botón ⌨ (cantidad libre) a la derecha.
- **Fila inferior:** las cinco monedas — 25, 50, 100, 250, 500 — en una rejilla de cinco columnas iguales
  que ocupa todo el ancho de la ficha. A 360 px salen de ~56 px y **nunca se envuelven**.

El interruptor cambia el color de su segmento activo: `--musgo` para sumar, `--vino` para restar.

> Se probó una sola fila con el signo y las seis monedas juntas: a 360 px no cabe y el ⌨ se descolgaba
> solo a una segunda línea. Ver `APRENDIZAJE.md`.

### Cantidad libre
El ⌨ despliega una **tercera fila dentro de la misma ficha**: un campo de número y un botón *Aplicar*.
Ni modal ni `prompt()` — el personaje al que se le están dando PX tiene que seguir a la vista.
Mientras está abierta, la moneda ⌨ se enciende en naranja de fuego, para que el estado se vea en
reposo. Enter aplica, Escape cierra. El signo lo sigue mandando el interruptor.
Al `input[type=number]` se le quitan las flechitas: son un control del sistema en plena ficha de
pergamino (regla de oro 10). Tope de **999.999 PX** por operación.

### Editar un personaje
No hay botón de lápiz: **toda la cabecera de la ficha** (token, nombre y clase) es el botón que abre
la hoja de edición. Entre el token y el sello no queda ancho a 360 px para meter otro control sin
estrangular el nombre, y así el objetivo táctil es enorme. La pista es un ✎ discreto junto a la clase.

### Barra de avisos
Franja de pergamino sobre el botón de alta, con `role="status"`. Aparece unos segundos y se va sola.
La usan los errores al elegir foto, el aviso de espacio, la confirmación de borrado y —desde la
Fase 4— el "Deshacer": *"+100 PX a Thalia · Deshacer"*.

### Confirmar un borrado
Nunca un `confirm()` del navegador: bloquea la página y mete un cuadro gris del sistema en escena.
El propio botón rojo pasa a **"¿Seguro? Toca otra vez"**, se oscurece y se rodea de cobre durante
cuatro segundos; pasado ese tiempo vuelve solo a su estado normal.

---

## 5. Subida de nivel — la celebración

El momento importante de la app. Dura **~2,2 segundos** y no bloquea nada: se puede tocar para saltarla.

1. **0,0 s** — La barra termina de llenarse y desborda con un fogonazo cálido.
2. **0,2 s** — La pantalla se oscurece con un viñeteado verde-cálido; la tarjeta que sube queda
   iluminada, elevada y ligeramente ampliada.
3. **0,4 s** — Un sello de lacre cae sobre la tarjeta, rebota corto y estalla en **esporas doradas**
   (12-16 partículas con `transform` y `opacity`; nada de librerías), guiño al champiñón del ícono.
4. **0,6 s** — Aparece el texto en Cinzel: **¡NIVEL 6!** y, debajo, *"Thalia sube de nivel"*.
   El número entra desde una escala de 1.6 con rebote.
5. **1,4 s** — Todo se disipa; la barra queda reiniciada en el nuevo tramo y el sello de la tarjeta
   ya muestra el número nuevo.

**Extras:** `navigator.vibrate(60)` si existe. Sonido **desactivado por defecto**, activable en ⚙
(el archivo de audio solo se añade si cabe en el presupuesto de peso).

**Bajar de nivel** no se celebra: el sello gira medio segundo hacia el número anterior y aparece un aviso discreto.

**Cómo quedó (Fase 5).** La secuencia está en `js/celebracion.js` y dura 2,0 s. Dos desvíos conscientes
respecto a lo de arriba:

- **El número vive dentro del sello grande**, en Cinzel y con el rebote desde escala 1.6. No hay una
  línea "¡NIVEL 6!" aparte: en una tarjeta de 348 px era decir dos veces lo mismo. Debajo del sello
  queda solo *"{nombre} sube de nivel"*.
- **El instante 0 es cuando la barra acaba de llenarse**, no cuando se toca la moneda. Como la barra
  tarda 700 ms en llegar al 100 %, la celebración se programa con ese retraso.

**Deshacer no celebra**, ni siquiera cuando devuelve un nivel recién perdido: es una corrección, no un logro.

`.campamento` crea su propio contexto de apilamiento, así que para que la ficha que sube quede por
encima del velo se eleva la lista entera y se apagan las demás fichas una a una (`opacity: .28`).

**`prefers-reduced-motion: reduce`** — se conserva solo un fundido del sello nuevo y el texto. Sin partículas,
sin sacudidas, sin ampliación. Todas las transiciones caen a 120 ms.

---

## 6. Móvil primero

- Diseño verificado a **360 px**; a partir de 700 px la lista pasa a dos columnas y se centra a máximo 960 px.
- Todo lo tocable: mínimo 44×44 px, con 8 px de separación entre objetivos.
- Respetar `env(safe-area-inset-*)` para el notch y la barra inferior del iPhone.
- Los botones de PX quedan en el tercio inferior de la tarjeta: es donde llega el pulgar.
- `<meta name="theme-color" content="#22362A">` para que la barra del sistema acompañe la ambientación.
- Sin `hover` como única señal: todo estado importante se ve también en reposo.

---

## 7. Accesibilidad

- Contraste mínimo AA: tinta sobre pergamino y pergamino sobre bosque lo cumplen con holgura;
  **verificar** cualquier texto que se ponga sobre cobre.
- El progreso se comunica también con texto (`3.450 / 6.500`), nunca solo con el color de la barra.
- Foco visible: contorno de cobre claro de 2 px, nunca `outline: none` sin sustituto.
- Etiquetas reales en el formulario; `aria-label` en los botones que solo tienen icono.
- La barra usa `role="progressbar"` con `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
- La subida de nivel se anuncia por `aria-live="polite"`.

---

## 8. Textos de la interfaz

Tono de tabernero: cálido, breve, con guiño, nunca cursi.

| Situación | Texto |
|---|---|
| Lista vacía | *"El campamento está vacío. Que llegue el primer aventurero."* |
| Botón de alta | *"Nuevo aventurero"* |
| Guardar personaje | *"Sentar junto al fuego"* |
| Confirmar borrado | *"¿Echar a {nombre} del campamento? No hay vuelta atrás."* |
| Al subir de nivel | *"{nombre} sube de nivel"* |
| Al bajar de nivel | *"{nombre} vuelve al nivel {n}"* |
| Faltan PX | *"Faltan 3.050 para el nivel 6"* |
| Nivel 20 | *"Nivel máximo alcanzado"* |
| Exportar | *"Guardar la crónica"* |
| Importar | *"Cargar una crónica"* |

---

## 9. Iconos de la app

El arte fuente es `recursos/iconos/icono-original.png` (1024×1024) y se conserva siempre.

**Ya generados** (Fase 1, reescalado bicúbico):

- `icono-512.png` (501 KB) — para el manifiesto.
- `icono-192.png` (77 KB) — manifiesto y `apple-touch-icon`.
- `icono-64.png` (10 KB) — favicon y la marca de la cabecera.

**Hecho en la Fase 6** (`icono-maskable-512.png` con el arte al 66 % sobre verde `#2F4D35`, y `icono-512.png` comprimido a ~125 KB; ambos siguen con el banderín "D&D CAMP" y se regeneran con ffmpeg cuando haya arte nuevo). Lo que era pendiente:

- `icono-maskable-512.png` — con margen extra de seguridad, porque Android recorta los iconos a
  círculo o *squircle* y el marco de cobre quedaría cortado.
- Comprimir `icono-512.png`: 501 KB es mucho para un archivo que entra en la caché offline.
