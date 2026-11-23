# Reglas de Oro — La era del Crepúsculo en Vaeloria

> Reglas **innegociables**. Si una idea, librería o funcionalidad choca con una de estas, se descarta la idea, no la regla.
> Cambiar una regla de esta lista requiere decisión explícita del dueño del proyecto y quedar anotado en `docs/APRENDIZAJE.md`.

---

## 1. Costo cero, para siempre
Nada de hosting pago, dominios, bases de datos gestionadas, APIs de pago ni servicios que pidan tarjeta.
Si una solución requiere método de pago aunque sea "solo para verificar", se descarta.
**Hosting permitido:** GitHub Pages (gratis, ilimitado en la práctica para este tamaño).

## 2. Funciona sin internet
Tras la primera carga, la app debe abrir y funcionar **completa** en modo avión.
Prohibido cualquier recurso externo en tiempo de ejecución: sin CDN de fuentes, sin CDN de librerías, sin llamadas a APIs.
Todo lo que la app necesita vive dentro del repositorio.

## 3. Móvil primero, de verdad
Se diseña y se prueba primero a **360 px de ancho**; el escritorio es el caso adaptado, no al revés.
Todo elemento tocable mide mínimo **44×44 px**. Nada de hovers como única forma de descubrir una acción.

## 4. Los datos son del dispositivo
> **Excepción acordada (2026-11-23):** en el **modo en línea opcional** (Fases 8-11 de `docs/FASES.md`) los personajes viven en Firebase. Sin mesa conectada, esta regla rige tal cual.

Todo vive en el teléfono (`localStorage`). Nada se sube a ningún lado.
La única forma de que la información salga del dispositivo es que el usuario **exporte a mano** un archivo.

## 5. Nunca perder personajes
Es la peor falla posible. Antes de cualquier migración de formato se guarda una copia de seguridad.
Toda escritura se valida antes de reemplazar lo guardado; si algo falla, se conserva lo anterior.
Eliminar un personaje siempre pide confirmación.

## 6. Sin login, sin usuarios, sin permisos
> **Excepción acordada (2026-11-23):** en el modo en línea cada personaje tiene dueño y solo él lo edita, con identidad anónima y código de recuperación; sigue sin haber contraseñas ni modo máster.

No hay cuentas, no hay dueños de personaje. Cualquiera que tenga el teléfono edita a cualquiera.
Prohibido introducir roles, contraseñas o "modo máster".

## 7. Una sola pantalla
Todo ocurre en la misma vista: ver personajes, crear, editar y dar XP.
Se permiten hojas emergentes y modales sobre la misma pantalla; **no** se permiten rutas ni pestañas de navegación.

## 8. Sin build, sin dependencias
HTML, CSS y JavaScript planos. Nada de React, Vite, Tailwind, bundlers ni `npm install` para que la app corra.
Abrir `index.html` debe bastar. Esto elimina toolchain, tiempos de compilación y errores de versiones.

## 9. Terminado le gana a perfecto
El alcance está congelado en `docs/FASES.md`. Toda idea nueva que aparezca a mitad de camino va a la sección
"Fuera de alcance" y se evalúa **después** de que la v1 esté funcionando en el celular.

## 10. La ambientación no se rompe
El ícono de la app (`Icono app.png`) manda: campamento cálido al borde del bosque, con verde profundo,
cobre, pergamino, musgo y contorno oscuro ilustrado. Todo elemento en pantalla pertenece a ese mundo.
Nada de controles genéricos de sistema visibles, nada de azul de navegador, nada de emojis fuera de tono.

## 11. La documentación es parte del trabajo
Ninguna sesión de trabajo termina sin actualizar `ESTADO.md` y `docs/ACTUALIZACIONES.md`.
Cualquier sesión futura debe poder retomar el proyecto leyendo solo `ESTADO.md` en menos de un minuto.

## 12. Todo en español
Interfaz, textos, nombres de archivo, nombres de variables, comentarios y documentación.

---

## Presupuesto de tiempo
**Máximo 1 día de trabajo (~7 horas efectivas).** Si una fase se pasa 50 % de su estimado, se recorta su alcance
y se anota el recorte en `docs/APRENDIZAJE.md`. No se extiende el plazo.
