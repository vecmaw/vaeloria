# Arquitectura — La era del Crepúsculo en Vaeloria

## 1. Qué se construye

Una **PWA de una sola pantalla** que gestiona la experiencia de los personajes de una mesa de D&D 5e.
Sin servidor, sin base de datos, sin cuentas. Todo el estado vive en el navegador del teléfono.

```
┌─────────────────────────────────────────────────┐
│  Teléfono (Chrome / Safari)                     │
│                                                 │
│   index.html ─── css/estilo.css                 │
│        │                                        │
│        ├── js/app.js      (interfaz y eventos)  │
│        ├── js/xp.js       (reglas de nivel)     │
│        └── js/almacen.js  (persistencia)        │
│                    │                            │
│                    ▼                            │
│              localStorage                       │
│                                                 │
│   sw.js (service worker) → caché de la app      │
└─────────────────────────────────────────────────┘
              ▲
              │ solo la primera vez (o al actualizar)
              │
      GitHub Pages (archivos estáticos, gratis)
```

---

## 2. Stack elegido

| Capa | Elección | Por qué |
|---|---|---|
| Interfaz | HTML + CSS + JS planos (scripts clásicos) | Sin build, sin dependencias, sin toolchain que falle. Regla de oro 8. |
| Estado | Objeto en memoria + `localStorage` | Volumen mínimo (decenas de personajes). Síncrono y trivial de depurar. |
| Persistencia | Un solo módulo `almacen.js` | Puerta única a los datos: cambiar a nube después = reemplazar un archivo. |
| Offline | Service worker con estrategia *cache-first* | Requisito duro: debe abrir en modo avión. |
| Instalación | `manifest.webmanifest` + iconos | Ícono propio en la pantalla de inicio y arranque a pantalla completa. |
| Publicación | GitHub Pages | Gratis, HTTPS incluido (obligatorio para service workers), desplegar = `git push`. |
| Tipografías | Archivos `.woff2` locales | Un CDN de fuentes rompería el offline. Regla de oro 2. |

### Cómo se cargan los archivos de `js/`

No hay módulos ES. `index.html` termina con ocho `<script defer>` **en orden de dependencia**:

```
xp.js → clases.js → almacen.js → imagen.js → celebracion.js → tokens-base.js → pwa.js → app.js
```

`defer` conserva ese orden y espera a que el DOM esté montado, que es lo que `app.js` y
`celebracion.js` necesitan para buscar sus elementos, y `app.js` para llamar a `cargar()` en su primera
línea. Los seis comparten un único ámbito global: lo que uno declara con `const` o `function` en el
nivel superior lo ven los que se cargan después, sin `import` de por medio. Cada archivo abre con
`'use strict'`, que los módulos daban gratis.

**Precio a pagar, y cómo no tropezar con él:** hay 103 nombres en el ámbito global y **dos archivos no
pueden declarar el mismo**; un `const` repetido no es un aviso, es un `SyntaxError` que tumba la carga
entera. Al añadir un archivo, comprobarlo:

```sh
grep -hoE "^(const|let|var|function|async function|class) +[A-Za-z_$][A-Za-z0-9_$]*" js/*.js \
  | sed -E 's/^[a-z ]+ +//' | sort | uniq -d      # no debe imprimir nada
```

### Descartado a propósito

- **Módulos ES** — se usaron hasta la Fase 4 y **rompían la regla de oro 8**: el navegador los pide
  por red y los bloquea por CORS bajo `file://`, así que abrir `index.html` con doble clic no
  ejecutaba ni una línea. Ver `APRENDIZAJE.md`.
- **React / Vue / Svelte** — el peso de la herramienta supera al de la app.
- **Tailwind** — requiere build; el CSS a mano con variables es más corto para este tamaño.
- **Firebase / Supabase** — no hacen falta sin sincronización, y añaden red y configuración.
- **IndexedDB** — más API para el mismo resultado; se reconsidera solo si los tokens desbordan
  `localStorage` (ver "Riesgos").
- **APK con Capacitor** — cabe perfectamente *después*, sobre esta misma base, pero el SDK de Android
  no cabe dentro del día de trabajo.

---

## 3. Estructura de archivos

```
DND WEB/
├── index.html                 Pantalla única completa
├── manifest.webmanifest       Metadatos de instalación
├── sw.js                      Service worker (caché offline)
├── css/
│   └── estilo.css             Todo el estilo: variables, componentes, animaciones
├── js/
│   ├── app.js                 Arranque, render, manejo de eventos
│   ├── almacen.js             Leer/guardar/exportar/importar (único acceso a localStorage)
│   ├── xp.js                  Tabla de PX, nivel actual, progreso, PX faltantes
│   ├── clases.js              Las 13 clases de 5e con su nombre y su emoji
│   ├── imagen.js              Redimensionar y comprimir el token antes de guardarlo
│   └── celebracion.js         La secuencia de subida de nivel (solo pinta, no toca datos)
├── recursos/
│   ├── iconos/                icono-original.png (1024, arte fuente) + 512 · 192 · 64
│   └── fuentes/               2 archivos .woff2 (subconjunto latino)
├── ESTADO.md · REGLAS.md · README.md · CLAUDE.md
└── docs/                      ARQUITECTURA · FASES · DISENO · DATOS · ACTUALIZACIONES · APRENDIZAJE
```

**Regla de tamaño:** si `app.js` pasa de ~400 líneas, se parte por componente
(`js/tarjeta.js`, `js/formulario.js`). Antes de eso, un solo archivo es más fácil de leer.

> ⚠️ **Ya se pasó.** `app.js` va por **613 líneas**. El corte natural es sacar la hoja de alta/edición
> a `js/formulario.js` (~180 líneas: abrir, cerrar, validar, guardar, eliminar, foto), que apenas se
> roza con el reparto de PX. La Fase 5 no lo empeoró —la celebración se fue a su propio archivo, que
> es justo el patrón a seguir—, así que ya no corre prisa. Al partirlo, acordarse de añadir el
> `<script>` nuevo en `index.html` **antes** de `app.js`.

---

## 4. Responsabilidad de cada módulo

**`xp.js`** — Funciones puras, sin tocar el DOM ni el almacenamiento.
`nivelDesdeXP(xp)`, `pxParaNivel(n)`, `progresoEnNivel(xp) → {actual, total, porcentaje, faltan}`.
Es el único lugar donde vive la tabla de 5e, y el más fácil de verificar a mano.

**`almacen.js`** — Único módulo que conoce `localStorage`.
`cargar()`, `guardar(estado)`, `respaldar()`, `bytesUsados()`, `validarPersonaje()`, `nuevoId()`;
`exportar()` e `importar()` llegan en la Fase 7.
Valida la forma de los datos al leer y al importar; si lo guardado está corrupto, si es de una versión
más nueva, o si `localStorage` ni siquiera es accesible (Safari privado), devuelve un estado vacío
**sin borrar** lo anterior (regla de oro 5).

**`clases.js`** — Las 13 clases con su nombre mostrado y su emoji, más `claseValida()`, que usa
`almacen.js` para decidir si un personaje es rescatable.

**`imagen.js`** — Recibe el archivo de la galería, lo dibuja en un `<canvas>` recortado a cuadrado de
160 px y devuelve un `data:` URL comprimido. Aísla toda la parte frágil (orientación EXIF, formatos).

**`celebracion.js`** — La secuencia de subida de nivel (`DISENO.md` §5). Solo pinta: recibe la ficha ya
actualizada, el nombre y el nivel, y no toca datos ni almacenamiento. `celebrarSubida()` la arranca y
`terminarCelebracion()` la deshace; esta última es idempotente porque la llaman tres sitios —el reloj
del final, el toque para saltarla y el arranque de una celebración nueva—.

**`app.js`** — Pega todo: dibuja la lista, abre el formulario, aplica los cambios de PX, decide cuándo
hay que celebrar y pide a `almacen.js` que persista.

### Flujo de un cambio de PX

```
Toque en "+100"
   → app.js calcula xp nuevo
   → xp.js dice nivel antes y nivel después
   → almacen.js guarda
   → app.js redibuja la tarjeta y anima la barra
   → si nivel después > nivel antes → celebración de subida de nivel
```

---

## 5. Decisiones y su porqué

**D1 — El nivel nunca se guarda, se calcula.**
Guardar `xp` y `nivel` a la vez permite que se contradigan. Se guarda solo `xp`; el nivel se deriva.
Excepción: `ajusteNivel` (entero, normalmente 0) para mesas que suben por hitos; en ese caso la app
escribe los PX correspondientes al nivel elegido, y sigue habiendo una sola fuente de verdad.

**D2 — Una capa de persistencia, no llamadas a `localStorage` dispersas.**
Cuesta 20 líneas hoy y es lo único que hará barata una futura sincronización en la nube.

**D3 — Estado completo en un solo objeto, redibujado completo de la lista.**
Con decenas de tarjetas, redibujar todo es imperceptible y elimina toda una clase de errores de
sincronización entre el DOM y los datos. Lo usan las altas, las ediciones y las bajas.

*Matizado en la Fase 4:* **los cambios de PX no redibujan.** Un nodo recién clonado nace con el ancho
final ya puesto y no transiciona, así que la barra saltaba de golpe; y el interruptor − / +, cuyo
estado vive en el DOM, volvía a `+` en cada toque. Esos cambios actualizan la tarjeta en su sitio
(`pintarProgreso`). El motivo largo está en `APRENDIZAJE.md`.

**D4 — Los tokens se guardan como `data:` URL dentro del propio JSON.**
Así exportar la partida es un único archivo autocontenido, sin imágenes sueltas que se pierdan.
El costo es peso, y por eso se comprime agresivamente antes de guardar.

**D5 — Confirmación solo para eliminar, y sin diálogos del navegador.**
Sumar o restar PX es reversible con el botón contrario y con "deshacer"; pedir confirmación en cada
toque arruinaría el uso en mesa. Borrar un personaje sí es destructivo y sí pregunta, pero con el
propio botón, que pasa a "¿Seguro? Toca otra vez" durante cuatro segundos. Un `confirm()` bloquea la
página y mete en escena un cuadro gris del sistema, justo lo que prohíbe la regla de oro 10.

---

## 6. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| `localStorage` lleno por los tokens (~5 MB) | No se puede guardar | Comprimir a 160 px WebP (~8-15 KB c/u). Avisar al superar 4 MB. Si desborda: pasar imágenes a IndexedDB. |
| El navegador borra los datos del sitio | Se pierde la partida | Recordar exportar; añadir `navigator.storage.persist()` en la Fase 6. |
| Service worker sirve una versión vieja | La app no se actualiza | Versionar el nombre de la caché y borrar las anteriores al activar. |
| WebP no soportado (iOS antiguo) | Falla el guardado del token | Detectar soporte y caer a JPEG con calidad 0.8. |
| El día de trabajo se desborda | No hay entrega | Fases 1-5 son el mínimo entregable; 6 y 7 se pueden hacer otro día sin bloquear el uso. |

---

## 7. Camino de crecimiento (no se hace ahora)

Cada paso es aditivo y no rompe lo anterior:

1. **APK Android** — envolver esta misma carpeta con Capacitor.
2. **Sincronización entre celulares** — reemplazar `almacen.js` por una versión con Firestore,
   manteniendo la misma interfaz de funciones.
3. **Varias campañas** — el estado ya es un objeto con `version`; se le añade `campanas[]`.
4. **Historial completo de PX por personaje** — el modelo ya reserva el campo.
