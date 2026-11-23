/* ============================================================
   La celebración de subida de nivel (docs/DISENO.md §5).
   No toca datos ni almacenamiento: recibe la ficha ya al día y solo pinta.
   Se carga antes que app.js, que es quien la dispara.
   ============================================================ */

'use strict';

/** Dentro del rango 12-16 que pide el diseño. */
const ESPORAS = 14;

const celebraVelo = document.getElementById('celebra-velo');
const plantillaSubida = document.getElementById('plantilla-subida');
const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');

/** Solo puede haber una a la vez: `{ nodo, subida, relojes }` o null. */
let celebracionActual = null;

function programarCelebra(accion, milisegundos) {
  celebracionActual?.relojes.push(setTimeout(accion, milisegundos));
}

/* Repartidas en círculo con algo de desorden: a intervalos exactos se ve la rejilla
   y parece un reloj, no una nube de esporas. */
function sembrarEsporas(contenedor) {
  const trozos = [];
  for (let i = 0; i < ESPORAS; i++) {
    const espora = document.createElement('span');
    espora.className = 'espora';
    espora.style.setProperty('--ang', `${(360 / ESPORAS) * i + Math.random() * 20 - 10}deg`);
    espora.style.setProperty('--dist', `${48 + Math.random() * 40}px`);
    espora.style.setProperty('--tam', `${5 + Math.random() * 5}px`);
    espora.style.setProperty('--retraso', `${Math.random() * 80}ms`);
    trozos.push(espora);
  }
  contenedor.replaceChildren(...trozos);
}

/**
 * Deja la pantalla como estaba. Es idempotente y la llaman tres sitios: el reloj del
 * final, el toque para saltarla y el arranque de una celebración nueva.
 */
function terminarCelebracion() {
  if (!celebracionActual) return;
  const { nodo, subida, relojes } = celebracionActual;
  celebracionActual = null;

  for (const reloj of relojes) clearTimeout(reloj);
  subida.remove();
  nodo.classList.remove('is-subiendo');
  nodo.querySelector('.barra')?.classList.remove('is-fogonazo');
  celebraVelo.classList.remove('is-visible');
  celebraVelo.hidden = true;
  document.body.classList.remove('is-celebrando');
}

/**
 * Arranca la secuencia sobre la ficha indicada. El instante 0 es el momento en que la
 * barra acaba de llenarse, así que app.js la llama con ese retraso, no al tocar.
 */
function celebrarSubida(nodo, nombre, nivel) {
  terminarCelebracion();

  const subida = plantillaSubida.content.firstElementChild.cloneNode(true);
  subida.querySelector('.subida__num').textContent = nivel;
  subida.querySelector('.subida__quien').textContent = `${nombre} sube de nivel`;
  subida.addEventListener('click', terminarCelebracion);

  celebracionActual = { nodo, subida, relojes: [] };

  document.body.classList.add('is-celebrando');
  nodo.classList.add('is-subiendo');
  nodo.querySelector('.barra')?.classList.add('is-fogonazo');
  celebraVelo.hidden = false;
  // Reflujo forzado y no requestAnimationFrame: en una pestaña de fondo no hay fotogramas
  // y el velo se quedaría transparente pero interceptando toques (ver APRENDIZAJE.md).
  void celebraVelo.offsetWidth;
  celebraVelo.classList.add('is-visible');

  try { navigator.vibrate?.(60); } catch { /* el navegador puede negarla */ }

  // Ruta corta de `prefers-reduced-motion`: solo el fundido del sello y el texto.
  if (movimientoReducido.matches) {
    nodo.append(subida);
    subida.classList.add('is-rotulada');
    programarCelebra(terminarCelebracion, 1300);
    return;
  }

  programarCelebra(() => {
    nodo.append(subida);
    programarCelebra(() => sembrarEsporas(subida.querySelector('.subida__esporas')), 240);
    programarCelebra(() => subida.classList.add('is-rotulada'), 300);
  }, 200);

  programarCelebra(() => subida.classList.add('is-saliendo'), 1600);
  programarCelebra(terminarCelebracion, 2000);
}

celebraVelo.addEventListener('click', terminarCelebracion);

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && celebracionActual) terminarCelebracion();
});
