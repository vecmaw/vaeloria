# 🍄 La era del Crepúsculo en Vaeloria

Gestor de experiencia para una mesa de **D&D 5e**. Una sola pantalla: todos los personajes de la
partida, sumar y restar PX con un toque, ver cuánto falta para el siguiente nivel con una barra que
se llena, y una celebración cuando alguien sube.

Pensado para usarse **desde el celular, en la mesa, sin señal y sin gastar un peso**.

> **Estado: usable en una partida real.** Fases 0 a 5 terminadas: crear, editar y eliminar personajes,
> sumar y restar PX con la barra y el nivel al día, y la celebración de subida de nivel. Falta la
> instalación offline (Fase 6) y la publicación en GitHub (Fase 7). Después, quizá, convertirla en un
> módulo de la plataforma web del grupo (Fase 8, condicionada).
> Punto de entrada para retomar el proyecto: [`ESTADO.md`](ESTADO.md).

---

## Qué hace

- Lista de personajes con token, nombre, clase y nivel.
- Sumar o restar experiencia con cinco valores rápidos (25, 50, 100, 250, 500) o una cantidad libre,
  con deshacer de un paso por si el toque fue el equivocado.
- Barra de progreso del nivel actual y *"faltan X PX para el nivel N"*, con la tabla oficial de 5e.
- Animación de subida de nivel.
- Crear, editar y eliminar personajes en la misma pantalla.
- Todo guardado en el propio teléfono; funciona sin internet.
- Exportar e importar la partida como archivo, para respaldar o pasarla a otro celular.

## Qué **no** hace (a propósito)

Sin cuentas, sin contraseñas y sin permisos: quien tenga el teléfono edita a cualquier personaje.
Tampoco sincroniza entre dispositivos ni gestiona fichas completas (vida, inventario, hechizos).
Solo experiencia y niveles. El porqué de cada exclusión está en [`REGLAS.md`](REGLAS.md).

---

## Cómo está hecho

PWA sin build: HTML, CSS y JavaScript planos (seis `<script defer>`, sin módulos ES), datos en
`localStorage`, service worker para funcionar offline, publicada gratis en GitHub Pages.
Sin frameworks, sin dependencias, sin servidor.

Detalle completo en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

---

## Cómo probarla en el computador

**Doble clic en `index.html`.** Eso es todo: no hay que instalar ni compilar nada, y los personajes
se guardan igual.

Lo único que **no** funciona así es el service worker, que el navegador solo registra por HTTP.
Es decir: para probar el **modo avión** (Fase 6) hace falta servir la carpeta:

```bash
python -m http.server 8080
```

Luego abrir `http://localhost:8080`.

> Por esto mismo, los archivos de `js/` se cargan con `<script defer>` y **no** con
> `<script type="module">`: bajo `file://` el navegador bloquea los módulos por CORS y la app se queda
> muerta. Si alguna vez se vuelven a meter módulos, el doble clic deja de funcionar.

## Cómo publicarla *(gratis)*

1. Crear el repositorio en GitHub y subir la carpeta.
2. **Settings → Pages → Source: Deploy from a branch**, rama principal, carpeta `/ (root)`.
3. Esperar un minuto: queda en `https://<usuario>.github.io/<repositorio>/`.

Cada actualización es un `git push`. No hay compilación ni despliegue que configurar.

## Cómo instalarla en el celular

- **Android (Chrome):** abrir la URL → menú ⋮ → *Instalar aplicación* (o *Añadir a pantalla de inicio*).
- **iPhone (Safari):** abrir la URL → botón Compartir → *Añadir a pantalla de inicio*.
  Safari no muestra ningún botón de instalar; ese es el único camino.

Queda con ícono propio, abre a pantalla completa y funciona sin señal.

---

## Documentación

| Archivo | Contenido |
|---|---|
| [`ESTADO.md`](ESTADO.md) | Fase actual, próximo paso, decisiones vigentes — **empezar aquí** |
| [`REGLAS.md`](REGLAS.md) | Reglas de oro innegociables |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Stack, estructura de archivos, decisiones técnicas |
| [`docs/FASES.md`](docs/FASES.md) | Plan de trabajo con estimados y criterios de terminado |
| [`docs/DISENO.md`](docs/DISENO.md) | Paleta, tipografías, componentes, subida de nivel |
| [`docs/DATOS.md`](docs/DATOS.md) | Modelo de datos y tabla de experiencia de 5e |
| [`docs/ACTUALIZACIONES.md`](docs/ACTUALIZACIONES.md) | Bitácora cronológica |
| [`docs/APRENDIZAJE.md`](docs/APRENDIZAJE.md) | Lecciones y avisos para sesiones futuras |
