/* Las 13 clases de D&D 5e. El emoji hace de token cuando el personaje no tiene foto. */

'use strict';

const CLASES = {
  barbaro:    { nombre: 'Bárbaro',    emoji: '🪓' },
  bardo:      { nombre: 'Bardo',      emoji: '🎻' },
  clerigo:    { nombre: 'Clérigo',    emoji: '✨' },
  druida:     { nombre: 'Druida',     emoji: '🌿' },
  guerrero:   { nombre: 'Guerrero',   emoji: '⚔️' },
  monje:      { nombre: 'Monje',      emoji: '👊' },
  paladin:    { nombre: 'Paladín',    emoji: '🛡️' },
  explorador: { nombre: 'Explorador', emoji: '🏹' },
  picaro:     { nombre: 'Pícaro',     emoji: '🗡️' },
  hechicero:  { nombre: 'Hechicero',  emoji: '🔥' },
  brujo:      { nombre: 'Brujo',      emoji: '👁️' },
  mago:       { nombre: 'Mago',       emoji: '📖' },
  artifice:   { nombre: 'Artífice',   emoji: '⚙️' },
};

function claseValida(clave) {
  return typeof clave === 'string' && Object.hasOwn(CLASES, clave);
}

function datosClase(clave) {
  return CLASES[clave] ?? { nombre: 'Aventurero', emoji: '🍄' };
}
