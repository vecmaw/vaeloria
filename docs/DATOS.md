# Modelo de Datos y Reglas de Experiencia

## 1. Estado guardado

Todo el estado es **un solo objeto JSON** bajo la clave `dnd-camp-v1` de `localStorage`.

```json
{
  "version": 1,
  "actualizado": "2026-08-12T18:22:00.000Z",
  "personajes": [
    {
      "id": "p_l8x2k9",
      "nombre": "Thalia Sombralarga",
      "clase": "picaro",
      "token": "data:image/webp;base64,UklGRi...",
      "xp": 3450,
      "creado": "2026-08-12T15:00:00.000Z",
      "actualizado": "2026-08-12T18:22:00.000Z"
    }
  ]
}
```

### Campos de un personaje

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | texto | Generado al crear. Nunca cambia. Nunca se reutiliza. |
| `nombre` | texto | Obligatorio, 1-30 caracteres, se recortan espacios. Se permiten nombres repetidos. |
| `clase` | texto | Una de las claves de la tabla de clases (§4). Obligatorio. |
| `token` | texto o `null` | `data:` URL de la imagen ya comprimida. Si es `null` se muestra el emoji de la clase. |
| `xp` | entero | ≥ 0. Nunca negativo: restar más de lo que tiene lo deja en 0. Sin tope superior. |
| `creado` / `actualizado` | ISO 8601 | Solo informativos; permiten ordenar y depurar. |

**El nivel no se guarda.** Se calcula siempre desde `xp` (decisión D1 en `ARQUITECTURA.md`).

### Validación al cargar
Si falta `version`, si `personajes` no es un arreglo, o si el JSON no parsea:
se devuelve un estado vacío en memoria y **no se sobrescribe** lo guardado, para poder recuperarlo a mano.
Los personajes individuales que no validen se descartan; los válidos se conservan.
Si `version` es **mayor** que la que conoce la app, tampoco se toca nada: son datos del futuro.
Un personaje sin nombre o con una clase desconocida no es rescatable y se descarta.

---

## 2. Tabla de experiencia — D&D 5e oficial

PX acumulados necesarios para **alcanzar** cada nivel:

| Nivel | PX totales | PX del tramo |
|---:|---:|---:|
| 1 | 0 | 300 |
| 2 | 300 | 600 |
| 3 | 900 | 1 800 |
| 4 | 2 700 | 3 800 |
| 5 | 6 500 | 7 500 |
| 6 | 14 000 | 9 000 |
| 7 | 23 000 | 11 000 |
| 8 | 34 000 | 14 000 |
| 9 | 48 000 | 16 000 |
| 10 | 64 000 | 21 000 |
| 11 | 85 000 | 15 000 |
| 12 | 100 000 | 20 000 |
| 13 | 120 000 | 20 000 |
| 14 | 140 000 | 25 000 |
| 15 | 165 000 | 30 000 |
| 16 | 195 000 | 30 000 |
| 17 | 225 000 | 40 000 |
| 18 | 265 000 | 40 000 |
| 19 | 305 000 | 50 000 |
| 20 | 355 000 | — |

Se escribe en `js/xp.js` como un arreglo de 20 números y **no se duplica en ningún otro archivo**.

```js
export const UMBRALES = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
                         85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
```

---

## 3. Cálculos

```
nivelDesdeXP(xp)      → el mayor n tal que UMBRALES[n-1] <= xp.  Tope: 20.
pxParaNivel(n)        → UMBRALES[n-1]
progresoEnNivel(xp)   → {
                          nivel,
                          base:       PX con los que empezó el nivel actual,
                          siguiente:  PX necesarios para el próximo nivel,
                          dentro:     xp - base,
                          tramo:      siguiente - base,
                          porcentaje: dentro / tramo * 100,
                          faltan:     siguiente - xp
                        }
```

**Casos límite que deben estar cubiertos:**

- `xp = 0` → nivel 1, 0 %, faltan 300.
- `xp` exactamente igual a un umbral → ya es el nivel nuevo, 0 % de progreso en él.
- **Nivel 20** → no hay "siguiente"; la barra se muestra llena al 100 % con el texto
  *"Nivel máximo alcanzado"* en lugar de los PX faltantes.
- Restar PX puede **bajar** de nivel: es válido y se muestra sin celebración (con un aviso discreto).
- `xp` negativo tras una resta → se fija en 0.

---

## 4. Clases de D&D 5e

Viven en `js/clases.js`. Cada clase aporta el nombre mostrado y un emoji, que hace de token
cuando el personaje no tiene foto.

| Clave | Nombre mostrado | Emoji |
|---|---|---|
| `barbaro` | Bárbaro | 🪓 |
| `bardo` | Bardo | 🎻 |
| `clerigo` | Clérigo | ✨ |
| `druida` | Druida | 🌿 |
| `guerrero` | Guerrero | ⚔️ |
| `monje` | Monje | 👊 |
| `paladin` | Paladín | 🛡️ |
| `explorador` | Explorador | 🏹 |
| `picaro` | Pícaro | 🗡️ |
| `hechicero` | Hechicero | 🔥 |
| `brujo` | Brujo | 👁️ |
| `mago` | Mago | 📖 |
| `artifice` | Artífice | ⚙️ |

---

## 5. Botones de experiencia

Valores rápidos: **25 · 50 · 100 · 250 · 500**, más el botón ⌨ para una cantidad libre.
El signo lo decide un interruptor sumar/restar, para no duplicar los botones.
(Se dejó fuera el 1000: son seis monedas y a 360 px la fila ya no cabe; con el campo libre se cubre.)

**Deshacer:** se guarda en memoria el último cambio aplicado (`{id, xpAnterior}`).
El botón "Deshacer" aparece unos segundos tras cada cambio y restaura el valor previo.
Solo un paso de deshacer; no se persiste entre recargas.

---

## 6. Exportar e importar

**Exportar** genera `dnd-camp-YYYY-MM-DD.json` con el objeto de estado completo, tokens incluidos,
mediante una descarga local (`Blob` + enlace). No sale nada por la red.

**Importar** lee el archivo, valida versión y estructura, y ofrece dos modos:

- **Reemplazar** — descarta lo actual y deja lo del archivo.
- **Combinar** — agrega los personajes del archivo cuyo `id` no exista ya.

Antes de aplicar cualquiera de los dos, se guarda una copia del estado actual en la clave
`dnd-camp-v1-respaldo` (regla de oro 5).

---

## 7. Migraciones

El campo `version` existe desde el primer día justamente para esto.
Cuando cambie el formato: se copia lo guardado a `dnd-camp-v1-respaldo`, se transforma,
se sube `version`, y se anota la migración en `docs/ACTUALIZACIONES.md`.
Una versión de la app nunca debe escribir sobre datos de una versión más nueva que la que conoce.
