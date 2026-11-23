/* ============================================================
   Reglas de experiencia de D&D 5e.
   Funciones puras: no tocan el DOM ni el almacenamiento.
   La tabla vive solo aquí; no duplicarla en ningún otro archivo.
   ============================================================ */

'use strict';

/** PX acumulados necesarios para alcanzar cada nivel, del 1 al 20. */
const UMBRALES = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

const NIVEL_MAX = UMBRALES.length;

/** Cualquier entrada rara (texto, null, negativo, decimal, Infinity) acaba en un entero >= 0. */
function normalizarPX(xp) {
  const n = Math.floor(Number(xp));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function nivelDesdeXP(xp) {
  const px = normalizarPX(xp);
  let nivel = 1;
  for (let i = 1; i < UMBRALES.length && px >= UMBRALES[i]; i++) nivel = i + 1;
  return nivel;
}

function pxParaNivel(nivel) {
  const n = Math.min(Math.max(Math.floor(nivel), 1), NIVEL_MAX);
  return UMBRALES[n - 1];
}

/**
 * Todo lo que la ficha necesita mostrar.
 * En el nivel 20 no hay siguiente umbral: la barra se da por llena.
 */
function progresoEnNivel(xp) {
  const px = normalizarPX(xp);
  const nivel = nivelDesdeXP(px);
  const base = UMBRALES[nivel - 1];

  if (nivel >= NIVEL_MAX) {
    return { nivel, base, siguiente: null, dentro: px - base, tramo: 0, porcentaje: 100, faltan: 0, esMaximo: true };
  }

  const siguiente = UMBRALES[nivel];
  const tramo = siguiente - base;
  const dentro = px - base;

  return {
    nivel,
    base,
    siguiente,
    dentro,
    tramo,
    porcentaje: (dentro / tramo) * 100,
    faltan: siguiente - px,
    esMaximo: false,
  };
}

/* En español las cifras de cuatro dígitos no llevan separador, así que por defecto
   saldría "3450" al lado de "14.000". En una columna de PX eso se lee mal, de modo
   que se fuerza el agrupado siempre. En navegadores antiguos la opción se ignora
   y simplemente se vuelve al comportamiento por defecto. */
const FORMATO = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });

/** 3450 → "3.450" */
function formatearPX(xp) {
  return FORMATO.format(normalizarPX(xp));
}
