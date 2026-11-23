/* ============================================================
   Única puerta a la persistencia. Ningún otro archivo debe tocar
   localStorage: el día que esto se mude a la nube, se reemplaza
   este módulo y nada más (ver docs/ARQUITECTURA.md, decisión D2).
   ============================================================ */

'use strict';

/* Usa `normalizarPX` (js/xp.js) y `claseValida` (js/clases.js), que se cargan antes
   que este archivo. El orden lo fijan los <script> de index.html. */

/* La clave conserva el nombre viejo de la app a propósito: renombrarla dejaría
   huérfanos los personajes ya guardados (regla de oro 5). Es interna, no se ve. */
const CLAVE = 'dnd-camp-v1';
const CLAVE_RESPALDO = 'dnd-camp-v1-respaldo';

const VERSION = 1;

/** Aviso cuando lo guardado se acerca al límite de localStorage (~5 MB). */
const LIMITE_AVISO = 4 * 1024 * 1024;

function estadoVacio() {
  return { version: VERSION, actualizado: null, personajes: [] };
}

function nuevoId() {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/* ---------- Validación ---------- */

function fechaValida(valor) {
  return typeof valor === 'string' && !Number.isNaN(Date.parse(valor)) ? valor : new Date().toISOString();
}

/**
 * Devuelve un personaje saneado, o null si no hay forma de rescatarlo.
 * Sin nombre o sin una clase conocida no es un personaje.
 */
function validarPersonaje(p) {
  if (!p || typeof p !== 'object') return null;

  const nombre = typeof p.nombre === 'string' ? p.nombre.trim().slice(0, 30) : '';
  if (!nombre || !claseValida(p.clase)) return null;

  return {
    id: typeof p.id === 'string' && p.id ? p.id : nuevoId(),
    nombre,
    clase: p.clase,
    token: typeof p.token === 'string' && p.token.startsWith('data:image/') ? p.token : null,
    xp: normalizarPX(p.xp),
    creado: fechaValida(p.creado),
    actualizado: fechaValida(p.actualizado),
  };
}

function validarEstado(dato) {
  if (!dato || typeof dato !== 'object' || !Array.isArray(dato.personajes)) {
    console.warn('[almacen] Lo guardado no tiene la forma esperada; se arranca vacío sin borrarlo.');
    return estadoVacio();
  }

  // Datos escritos por una versión más nueva de la app: no se tocan.
  if (typeof dato.version === 'number' && dato.version > VERSION) {
    console.warn(`[almacen] Datos de la versión ${dato.version}, superior a la conocida (${VERSION}). No se modifican.`);
    return estadoVacio();
  }

  const personajes = dato.personajes.map(validarPersonaje).filter(Boolean);
  const descartados = dato.personajes.length - personajes.length;
  if (descartados > 0) console.warn(`[almacen] ${descartados} personaje(s) ilegibles descartados.`);

  return { version: VERSION, actualizado: dato.actualizado ?? null, personajes };
}

/* ---------- Lectura y escritura ---------- */

function cargar() {
  let crudo;
  try {
    crudo = localStorage.getItem(CLAVE);
  } catch (e) {
    // Safari en navegación privada puede negar el acceso.
    console.error('[almacen] Sin acceso a localStorage:', e);
    return estadoVacio();
  }

  if (!crudo) return estadoVacio();

  try {
    return validarEstado(JSON.parse(crudo));
  } catch (e) {
    console.error('[almacen] JSON corrupto; se arranca vacío y se conserva lo guardado:', e);
    return estadoVacio();
  }
}

/**
 * Guarda el estado completo. Devuelve true si se escribió.
 * Si setItem falla (cuota llena), lo anterior sigue intacto en localStorage.
 */
function guardar(estado) {
  const limpio = {
    version: VERSION,
    actualizado: new Date().toISOString(),
    personajes: (estado?.personajes ?? []).map(validarPersonaje).filter(Boolean),
  };

  try {
    localStorage.setItem(CLAVE, JSON.stringify(limpio));
    estado.actualizado = limpio.actualizado;
    return true;
  } catch (e) {
    console.error('[almacen] No se pudo guardar (¿espacio agotado?):', e);
    return false;
  }
}

/** Copia de seguridad previa a cualquier importación o migración (regla de oro 5). */
function respaldar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) localStorage.setItem(CLAVE_RESPALDO, crudo);
    return true;
  } catch (e) {
    console.error('[almacen] No se pudo respaldar:', e);
    return false;
  }
}

/** Bytes aproximados que ocupa la partida; sirve para avisar antes de llenar la cuota. */
function bytesUsados() {
  try {
    return (localStorage.getItem(CLAVE) ?? '').length * 2;
  } catch {
    return 0;
  }
}
