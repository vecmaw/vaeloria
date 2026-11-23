# Plan de Fases

**Presupuesto total: 1 día ≈ 7 horas efectivas.** Las fases van en orden; cada una termina con algo
que se puede ver funcionando. Si una fase se pasa 50 % de su estimado, se recorta su alcance y se
anota el recorte en `APRENDIZAJE.md` (regla de oro 9).

| Fase | Qué entrega | Estimado | Estado |
|---|---|---|---|
| 0 | Planificación y documentación | 45 min | ✅ Completada |
| 1 | Esqueleto y ambientación | 1 h 15 | ✅ Completada (falta tipografía) |
| 2 | Motor de experiencia y persistencia | 45 min | ✅ Completada |
| 3 | Alta, edición y token de personajes | 1 h 15 | ✅ Completada |
| 4 | Sumar y restar PX con la barra viva | 1 h | ✅ Completada |
| 5 | Celebración de subida de nivel | 45 min | ✅ Completada |
| 6 | PWA instalable y offline | 45 min | 🟡 Código hecho, falta probar en el celular |
| 7 | Publicación, respaldos y GitHub | 1 h | ⬜ |
| 8 | Contrato del almacén y modelo (sin servidor) | por definir | ⬜ condicionada |
| 9 | Ver la mesa en directo (solo lectura) | por definir | ⬜ condicionada |
| 10 | Gestionar el propio personaje en línea | por definir | ⬜ condicionada |
| 11 | Recuperación de identidad | por definir | ⬜ condicionada |

**Mínimo utilizable:** al terminar la Fase 4 la app ya sirve en una partida real.
La Fase 5 es su alma. Las Fases 6 y 7 son la entrega, y pueden hacerse otro día sin bloquear el uso.

---

## Fase 0 — Planificación y documentación · 45 min ✅

Decidir arquitectura, congelar alcance, escribir las reglas de oro y dejar la documentación
que permita retomar el proyecto en cualquier sesión.

**Terminado cuando:** existen `REGLAS.md`, `ESTADO.md`, `README.md`, `CLAUDE.md` y los seis archivos de `docs/`,
y las dos decisiones grandes (datos locales, PWA en GitHub Pages) están registradas.

---

## Fase 1 — Esqueleto y ambientación · 1 h 15 ✅

- `index.html` con la pantalla única completa: cabecera, lista, botón de alta, hoja emergente vacía.
- `css/estilo.css`: variables de la paleta tomada del ícono, cabecera-banderín, tipografías locales,
  tarjeta de personaje, sello de nivel, barra de PX, botones-moneda.
- **Dos personajes escritos a mano en el HTML** para juzgar el diseño antes de programar nada.
- Descargar y subconjuntar las dos `.woff2` a `recursos/fuentes/`.

**Terminado cuando:** en un celular de 360 px la pantalla se ve como el mismo mundo del ícono,
sin desbordes horizontales, y las dos fichas de ejemplo se leen bien. Sin JavaScript todavía.

**Resultado:** cumplido y verificado a 360 px (sin desborde horizontal). Se maquetó además la hoja
emergente completa con su formulario, que abre con `:target` en CSS puro; la Fase 3 solo tendrá que
sustituir ese mecanismo por JS. Las monedas pasaron a dos filas tras comprobar que en una no caben.

**Pendiente de esta fase:** conseguir Cinzel y EB Garamond en `.woff2` y activar el bloque `@font-face`
que ya está escrito y comentado al inicio de `css/estilo.css`. Mientras tanto se usa la serif del sistema,
que mantiene el tono sin costar una sola petición de red.

---

## Fase 2 — Motor de experiencia y persistencia · 45 min ✅

- `js/xp.js`: tabla de 20 umbrales y las funciones puras (`nivelDesdeXP`, `progresoEnNivel`, …).
- `js/clases.js`: las 13 clases con nombre y emoji.
- `js/almacen.js`: `cargar`, `guardar`, `respaldar`, con validación de la estructura al leer.
- `js/app.js`: dibujar la lista desde el estado, clonando un `<template>` del HTML.

**Terminado cuando:** los personajes de prueba se guardan, sobreviven a recargar la página, y los
casos límite dan bien: `xp = 0`, `xp` justo en un umbral, nivel 20, y resta por debajo de cero.

**Resultado:** cumplido. 54 comprobaciones del motor de PX en verde, incluidos los 20 umbrales y el
PX inmediatamente anterior a cada uno. Verificado también en el navegador que sobrevive a la recarga,
que un personaje con clase desconocida o sin nombre se descarta sin tirar el resto, y que ni un JSON
corrupto ni unos datos de versión superior borran lo guardado.

**Cómo repetir las comprobaciones del motor:** el guion está en el bloc de notas de la sesión, no en
el repositorio. Si hace falta dejarlo fijo, el sitio es `pruebas/comprobar-xp.mjs` y se ejecuta con
`node`, sin dependencias.

---

## Fase 3 — Alta, edición y token · 1 h 15 ✅

- Hoja emergente con nombre, selector de clase (13 opciones con emoji) y token.
- `js/imagen.js`: tomar la foto de la galería, recortar a cuadrado, redimensionar a 160 px,
  comprimir a WebP (JPEG como respaldo) y devolver un `data:` URL.
- Editar y eliminar personaje, con confirmación solo al eliminar.
- Validación: nombre obligatorio de 1-30 caracteres, clase obligatoria.

**Terminado cuando:** se crea un personaje con foto desde el celular, se edita, se elimina, y todo
sobrevive a recargar. Un token comprimido pesa menos de 20 KB.

**Resultado:** cumplido. Una foto de 1600×1000 y 31 KB sale como WebP de 160 px y **4 KB**, muy por
debajo del presupuesto. Verificados el alta, la edición, las tres formas de cerrar la hoja (Cancelar,
velo y Escape), el borrado en dos toques y que todo sobrevive a la recarga.

**Riesgo de EXIF:** resuelto con `createImageBitmap(archivo, { imageOrientation: 'from-image' })`
y, donde no exista, un `<img>` normal, que ya aplica la orientación por su cuenta.

**Se sustituyó el andamio de `:target`** por control desde JS, como estaba previsto.

---

## Fase 4 — Sumar y restar PX · 1 h ✅

- Interruptor sumar/restar y los cinco valores rápidos, más el campo de cantidad libre.
- La barra se anima al nuevo porcentaje; los textos de PX y de faltantes se actualizan.
- Deshacer de un paso con aviso temporal.
- Bajar de nivel se maneja sin celebración.

**Terminado cuando:** en el celular se puede llevar una sesión entera de PX sin errores de cálculo
y sin toques fallidos, y la barra nunca se desincroniza del número.

**Resultado:** cumplido. Verificados a 360 px la suma, la resta, el deshacer, la cantidad libre con
sus dos validaciones, restar en 0 (se queda en 0), llegar al nivel 20, bajar de nivel, la recarga y
un alta en mitad de una animación. Sin errores en consola.

**Dos cosas que no estaban en el plan y sí en el resultado:** los cambios de PX actualizan la ficha
en su sitio en vez de redibujar la lista (si no, la barra no anima y el interruptor se reinicia), y
al cambiar de nivel la barra sale por un borde y entra por el otro en vez de recorrer el salto al
revés. Las dos razones, en `APRENDIZAJE.md`.

---

## Fase 5 — Celebración de subida de nivel · 45 min ✅

- Secuencia completa descrita en `DISENO.md` §5: fogonazo, oscurecido, sello de lacre, chispas,
  número grande en Cinzel.
- Vibración si está disponible; saltable con un toque.
- Ruta reducida para `prefers-reduced-motion`.

**Terminado cuando:** cruzar un umbral dispara la celebración una sola vez, se puede saltar,
y al terminar la tarjeta muestra el nivel nuevo con la barra ya en el tramo correcto.

**Riesgo:** es la fase más fácil de sobre-trabajar. Límite duro: 45 minutos, luego se congela.

**Resultado:** cumplido, en `js/celebracion.js` (archivo nuevo, para no engordar `app.js`).
Dura 2,0 s medidos. Verificado: cruzar un umbral la dispara; un toque en el velo o en la ficha la
corta en seco y deja todo limpio; sumar sin cruzar umbral no la dispara; bajar de nivel tampoco;
un salto de siete niveles de una vez produce **una sola** celebración; y el rótulo con un nombre
de 29 caracteres pasa a dos líneas sin desbordar a 360 px. La ruta de `prefers-reduced-motion`
se comprobó con `--force-prefers-reduced-motion`: sin esporas y sin ampliación.

**Se apartó del diseño en dos puntos, a propósito:**

1. **No hay línea "¡NIVEL 6!" aparte.** El número va dentro del sello grande, en Cinzel y con el
   rebote desde escala 1.6 que pedía `DISENO.md` §5. Repetirlo debajo como texto era decir dos veces
   lo mismo en una tarjeta de 348 px.
2. **Deshacer no celebra**, ni cuando devuelve un nivel que se acababa de perder. Recuperar algo por
   una corrección no es un logro, y convertía el botón *Deshacer* en una fiesta.

---

## Fase 6 — PWA instalable y offline · 45 min

- `manifest.webmanifest`: `name` "La era del Crepúsculo en Vaeloria" y `short_name` "Vaeloria"
  (en la pantalla de inicio de Android caben ~12 caracteres), `display: standalone`, `theme_color: #22362A`,
  iconos de 192 y 512 px más una versión *maskable*.
- `sw.js` con caché versionada y estrategia *cache-first*, borrando las cachés viejas al activar.
- Los tamaños 512 · 192 · 64 ya existen en `recursos/iconos/` (Fase 1). Falta la variante *maskable*
  con margen: el recorte circular de Android se come el marco de cobre. Ver `DISENO.md` §9.
- `navigator.storage.persist()` para reducir el riesgo de que el navegador borre los datos.

**Terminado cuando:** se instala en la pantalla de inicio del celular, abre a pantalla completa con
ícono propio, y **funciona en modo avión** tras cerrarla del todo.

---

## Fase 7 — Publicación, respaldos y GitHub · 1 h

- Exportar e importar JSON (reemplazar / combinar), con respaldo previo.
- Repositorio en GitHub (cuenta personal por ahora, transferible al grupo; ver "Flujo de trabajo con
  GitHub"), publicar con GitHub Pages desde `main`.
- README con la URL, cómo instalarla en Android y en iPhone, y cómo actualizar.
- Prueba final desde el celular contra la URL publicada.

**Terminado cuando:** la URL abre en el celular de cualquiera de la mesa, se instala, funciona sin
señal, y un archivo exportado se puede importar en otro teléfono.

---

## Modo en línea (Fases 8 a 11) · condicionado

**Idea (2026-11-23):** que cada jugador cree y gestione **solo su personaje**, vea a los demás de la mesa
y los vea moverse en directo (barras de PX y nivel). Encaja como módulo de la futura plataforma del grupo.

> **Revisión (2026-11-23): el servidor puede ser el de Kevin.** El módulo se integrará a un servidor que
> Kevin prepara en su notebook. La decisión 2 (Firebase) queda **en revisión hasta hablar con él**: lo que
> se mantiene es la Fase 8 (contrato del almacén), que sirve para cualquiera de los dos. Con servidor propio,
> la recuperación de identidad (Fase 11) deja de ser un problema de reglas y se resuelve en el servidor.
> Preguntas para Kevin: ver `docs/ARQUITECTURA.md` §8.

**Decisiones del dueño (2026-11-23):**

1. **Cada quien edita solo el suyo.** Sin rol de máster por ahora; el máster dice cuántos PX y cada
   jugador se los suma.
2. **Firebase (Firestore)** como base de datos: gratis sin tarjeta (plan Spark), tiempo real y
   modo offline incluidos. Si la plataforma del grupo trae su propio backend, solo se reescribe el
   adaptador (ver Fase 8): la interfaz del almacén no cambia.
3. **Identidad anónima + código de recuperación.** Sin cuentas ni contraseñas.
4. **La v1 local se conserva.** El modo en línea es **opcional**: sin mesa conectada, la app se
   comporta exactamente como hoy (reglas 2, 4 y 6 intactas en ese modo).

**Reglas de oro:** estas decisiones reabren explícitamente la **4** (datos del dispositivo) y la **6**
(sin usuarios) **solo para el modo en línea**. La 1 (costo cero) se cumple con el plan gratuito de
Firebase. La 2 y la 8 se cumplen si el SDK se guarda como archivo local en el repositorio (sin `npm`,
sin CDN) y la app sigue abriendo con la caché local sin señal.

### Fase 8 — Contrato del almacén y modelo (sin servidor)
- Partir `app.js` (sacar `js/formulario.js`), deuda ya conocida.
- Definir y documentar el **contrato de `almacen.js`**: leer, guardar, eliminar, **suscribirse a
  cambios** y quién es el dueño. Todo asíncrono, aunque el modo local responda al instante.
- Añadir `duenoId` y `mesaId` al personaje con migración (copia de seguridad antes, regla 5).
  En modo local, el dueño es siempre "este dispositivo".
- Dejar `xp.js`, `clases.js` y `celebracion.js` sin dependencias de pantalla ni de datos.

**Terminado cuando:** la app local funciona igual que antes sobre el contrato nuevo, y ningún archivo
fuera de `almacen.js` conoce `localStorage`.

### Fase 9 — Ver la mesa en directo (solo lectura)
- Proyecto Firebase, SDK guardado en `recursos/` y adaptador en línea de `almacen.js`.
- Autenticación anónima. Entrar a una **mesa** con un código corto o enlace.
- Lista con los personajes de todos, las barras y niveles actualizándose en vivo; los ajenos sin
  botones de edición. Reglas de Firestore: lectura para cualquier jugador de la mesa.

**Terminado cuando:** dos teléfonos en la misma mesa ven moverse la barra del otro en menos de ~2 s.

### Fase 10 — Gestionar el propio personaje en línea
- Reglas de seguridad: **solo el dueño escribe su personaje** (`request.auth.uid == duenoId`),
  y solo puede cambiar campos válidos (PX no negativos, topes de nombre).
- Crear, editar y eliminar el propio personaje en línea; el resto en solo lectura.
- Edición **sin señal** con cola local y sincronización al volver.

**Terminado cuando:** un jugador no puede, ni forzando la app, modificar el personaje de otro.

### Fase 11 — Recuperación de identidad
- Mostrar un **código de recuperación** al crear el personaje y permitir reclamarlo desde otro
  dispositivo. Sin Cloud Functions (exigen tarjeta, regla 1): se resuelve con una colección de
  recuperación consultada por código y reglas de Firestore. Técnica por validar antes de comprometerse.
- Exportar e importar JSON sigue valiendo como respaldo.

**Terminado cuando:** borrar los datos del navegador y reclamar con el código devuelve el personaje.

**Riesgos:** perder el código = perder el personaje (aviso claro al crearlo); la identidad anónima
se borra al limpiar datos del sitio; los límites gratuitos de Firestore (lecturas por día) son holgados
para una mesa pero conviene vigilarlos; los tokens `data:` van dentro del documento (~4 KB, bien).

---

## Flujo de trabajo con GitHub

- **Repositorio:** cuenta personal por ahora; se transfiere o se mueve a la organización del grupo
  cuando exista. Nombre en español y sin tildes, p. ej. `vaeloria`.
- **`main` siempre desplegable.** Pages publica desde ahí, así que nada roto entra a `main`.
- **Regla: la URL publicada siempre está al día.** Al cerrar cada sesión con cambios, se fusionan a `main`
  y se sube (ver `CLAUDE.md`, cierre de sesión). Una rama sin fusionar no se ve en el sitio.
- **Una rama por fase o tarea** (`fase-6-pwa`, `deuda-formulario`, `arte-banderin`) y PR hacia `main`,
  con una línea de qué cambia y cómo se verificó.
- **Commits en español**, en imperativo y de un solo tema.
- **Issues para lo pendiente:** la deuda de `ESTADO.md` y las ideas de "Fuera de alcance" se abren
  como issues para que el grupo las reparta. `ESTADO.md` sigue siendo la fuente de verdad del avance.
- **Cada versión publicada sube la versión de la caché** del service worker (Fase 6) en el mismo PR.
- **Nunca se suben** `.claude/` ni exportaciones de partidas reales (`.gitignore`).

---

## Comprobación final antes de dar por cerrado

- [ ] Nada de peticiones de red después de la primera carga (verificar en modo avión).
- [ ] No hay desbordamiento horizontal a 360 px.
- [ ] Recargar la página no pierde ni un personaje.
- [ ] Restar por debajo de 0 deja en 0 y no rompe la barra.
- [ ] El nivel 20 muestra "Nivel máximo alcanzado" y no intenta calcular un siguiente nivel.
- [ ] La celebración se dispara exactamente una vez por umbral cruzado.
- [ ] Un archivo exportado se importa correctamente en otro dispositivo.
- [ ] `ESTADO.md` y `docs/ACTUALIZACIONES.md` reflejan el estado real.

---

## Fuera de alcance (ideas para después)

No se hacen en la v1. Se apuntan aquí para no perderlas ni dejar que rompan el plazo:

- Sincronización entre celulares (Firebase) — ver `ARQUITECTURA.md` §7.
- APK de Android con Capacitor.
- Varias campañas o mesas en la misma app.
- Historial completo de PX por personaje, con fechas.
- Puntos de golpe, inventario, hechizos o cualquier otra ficha de personaje.
- Reparto automático de los PX de un encuentro entre el grupo.
- Nivel por hitos como modo dedicado (por ahora se resuelve escribiendo los PX a mano).
- Tema claro.
