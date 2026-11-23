/* ============================================================
   Arranque, dibujado, alta/edición de personajes y reparto de PX.
   ============================================================ */

'use strict';

/* Este archivo va el último. Usa lo que declaran, por este orden:
     js/xp.js       progresoEnNivel · nivelDesdeXP · normalizarPX · formatearPX
     js/clases.js   CLASES · datosClase
     js/almacen.js  cargar · guardar · nuevoId · bytesUsados · LIMITE_AVISO
     js/imagen.js   procesarToken · pesoAproximado · SALIDA_MAXIMA
   Sin módulos ES no hay `import` que lo declare, así que el orden de los <script>
   de index.html es lo que lo sostiene: no reordenarlos. */

const estado = cargar();

const lista = document.getElementById('lista');
const vacio = document.getElementById('vacio');
const plantilla = document.getElementById('plantilla-ficha');
const aviso = document.getElementById('aviso');

const hoja = document.getElementById('hoja');
const velo = document.getElementById('hoja-velo');
const tituloHoja = document.getElementById('hoja-titulo');
const formulario = document.getElementById('formulario');
const campoNombre = document.getElementById('campo-nombre');
const campoClase = document.getElementById('campo-clase');
const campoFoto = document.getElementById('campo-foto');
const errorNombre = document.getElementById('error-nombre');
const errorClase = document.getElementById('error-clase');
const tokenVista = document.getElementById('token-vista');
const tokenNota = document.getElementById('token-nota');
const botonFoto = document.getElementById('boton-foto');
const botonQuitar = document.getElementById('boton-quitar');
const botonGuardar = document.getElementById('boton-guardar');
const botonEliminar = document.getElementById('boton-eliminar');
const botonCancelar = document.getElementById('boton-cancelar');
const botonNuevo = document.getElementById('boton-nuevo');

/** Cantidad máxima que se acepta de una sola vez en el campo de cantidad libre. */
const PX_MAXIMO_LIBRE = 999999;

/** id del personaje que se está editando, o null si se está creando uno nuevo. */
let editandoId = null;
/** Foto elegida en el formulario, aún sin guardar. */
let fotoActual = null;
/** Elemento que abrió la hoja, para devolverle el foco al cerrar. */
let disparador = null;
/** Último cambio de PX, para el deshacer de un paso: `{ id, xpAnterior }`. */
let ultimoCambio = null;
let confirmandoBorrado = false;
let relojBorrado = null;
let relojAviso = null;

/* ---------- Avisos ---------- */

function ocultarAviso() {
  clearTimeout(relojAviso);
  aviso.replaceChildren();
}

/**
 * Muestra una franja de pergamino unos segundos.
 * Con `accion` aparece además un botón (el "Deshacer" de la Fase 4).
 */
function mostrarAviso(texto, { milisegundos = 4000, accion = null, etiqueta = 'Deshacer' } = {}) {
  const pastilla = document.createElement('div');
  pastilla.className = accion ? 'aviso__pastilla aviso__pastilla--accion' : 'aviso__pastilla';

  const parrafo = document.createElement('p');
  parrafo.className = 'aviso__texto';
  parrafo.textContent = texto;
  pastilla.append(parrafo);

  if (accion) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'aviso__accion';
    boton.textContent = etiqueta;
    boton.addEventListener('click', () => { ocultarAviso(); accion(); });
    pastilla.append(boton);
  }

  clearTimeout(relojAviso);
  aviso.replaceChildren(pastilla);
  relojAviso = setTimeout(ocultarAviso, milisegundos);
}

/* ---------- Dibujado ---------- */

/**
 * Pone al día sello, barra y cifras de una ficha ya construida.
 * `movimiento` es el signo del cambio de PX y `cambioNivel` el del cambio de nivel;
 * en el primer dibujado ambos son 0 y nada se anima.
 */
function pintarProgreso(nodo, personaje, movimiento = 0, cambioNivel = 0) {
  const progreso = progresoEnNivel(personaje.xp);
  const siguiente = progreso.nivel + 1;

  const sello = nodo.querySelector('.sello');
  sello.title = `Nivel ${progreso.nivel}`;
  sello.querySelector('.sello__num').textContent = progreso.nivel;
  if (cambioNivel < 0) girarSello(sello);

  const barra = nodo.querySelector('.barra');
  barra.setAttribute('aria-valuenow', Math.round(progreso.porcentaje));
  barra.setAttribute('aria-label', progreso.esMaximo
    ? `${personaje.nombre} está en el nivel máximo`
    : `Progreso de ${personaje.nombre} hacia el nivel ${siguiente}`);

  nodo.querySelector('.cifras__px').textContent = progreso.esMaximo
    ? `${formatearPX(personaje.xp)} PX`
    : `${formatearPX(personaje.xp)} / ${formatearPX(progreso.siguiente)} PX`;

  nodo.querySelector('.cifras__faltan').textContent = progreso.esMaximo
    ? 'Nivel máximo alcanzado'
    : `Faltan ${formatearPX(progreso.faltan)} para el nivel ${siguiente}`;

  moverBarra(nodo, personaje.id, progreso, movimiento, cambioNivel);
}

function ficha(personaje) {
  const nodo = plantilla.content.firstElementChild.cloneNode(true);
  const clase = datosClase(personaje.clase);

  nodo.dataset.id = personaje.id;

  const token = nodo.querySelector('.token');
  if (personaje.token) {
    const img = document.createElement('img');
    img.src = personaje.token;
    img.alt = '';
    token.replaceChildren(img);
  } else {
    token.textContent = clase.emoji;
  }

  const abrir = nodo.querySelector('.ficha__abrir');
  abrir.setAttribute('aria-label', `Editar a ${personaje.nombre}`);

  // textContent y no innerHTML: el nombre lo escribe el usuario.
  nodo.querySelector('.ficha__nombre').textContent = personaje.nombre;
  nodo.querySelector('.ficha__clase').textContent = clase.nombre;

  pintarProgreso(nodo, personaje);
  return nodo;
}

/* Se redibuja la lista entera en las altas, ediciones y bajas: con decenas de fichas
   es imperceptible y evita que el DOM y los datos se desincronicen (decisión D3).
   Los cambios de PX no pasan por aquí: reemplazar el nodo mataría la animación de la
   barra y devolvería el interruptor − / + a su posición de partida. */
function dibujar() {
  for (const id of [...relojesBarra.keys()]) cancelarBarra(id);
  lista.replaceChildren(...estado.personajes.map(ficha));
  vacio.hidden = estado.personajes.length > 0;
}

function nodoFicha(id) {
  // Sin querySelector: un id importado de un archivo ajeno puede no ser un selector válido.
  return [...lista.children].find((nodo) => nodo.dataset.id === id) ?? null;
}

function persistir() {
  if (!guardar(estado)) {
    mostrarAviso('No se pudo guardar. Puede que no quede espacio en el teléfono.', { milisegundos: 8000 });
    return false;
  }
  if (bytesUsados() > LIMITE_AVISO) {
    mostrarAviso('El campamento está casi lleno. Conviene quitar alguna foto.', { milisegundos: 8000 });
  }
  return true;
}

/* ---------- La barra viva ---------- */

/** Relojes pendientes de la barra, por id de personaje. */
const relojesBarra = new Map();

function programarBarra(id, accion, milisegundos) {
  const lote = relojesBarra.get(id) ?? [];
  lote.push(setTimeout(accion, milisegundos));
  relojesBarra.set(id, lote);
}

function cancelarBarra(id) {
  for (const reloj of relojesBarra.get(id) ?? []) clearTimeout(reloj);
  relojesBarra.delete(id);
}

/* La duración la manda el CSS —y `prefers-reduced-motion` la recorta a 120 ms—,
   así que se lee de ahí en lugar de repetir el número en dos sitios. */
function duracionDe(nodo) {
  const valor = getComputedStyle(nodo).transitionDuration;
  const numero = parseFloat(valor) || 0;
  return valor.endsWith('ms') ? numero : numero * 1000;
}

function sinTransicion(nodo, accion) {
  nodo.style.transition = 'none';
  accion();
  void nodo.offsetWidth;
  nodo.style.transition = '';
}

function girarSello(sello) {
  sello.classList.remove('is-girando');
  void sello.offsetWidth;
  sello.classList.add('is-girando');
}

/**
 * Al cambiar de nivel el porcentaje salta de punta a punta: subir del 96 % al 3 % se vería
 * como una pérdida. El relleno sale primero por el borde que abandona y vuelve a entrar
 * por el contrario, que es además el arranque que la Fase 5 necesita para la celebración.
 */
function moverBarra(nodo, id, progreso, movimiento, cambioNivel) {
  const relleno = nodo.querySelector('.barra__relleno');
  const destino = `${progreso.porcentaje}%`;
  const dosTiempos = cambioNivel !== 0 && !progreso.esMaximo;

  cancelarBarra(id);
  relleno.classList.toggle('is-restando', movimiento < 0);

  if (!dosTiempos && movimiento >= 0) {
    relleno.style.width = destino;
    return;
  }

  const paso = duracionDe(relleno);

  if (!dosTiempos) {
    relleno.style.width = destino;
  } else {
    relleno.style.width = cambioNivel > 0 ? '100%' : '0%';
    programarBarra(id, () => {
      sinTransicion(relleno, () => { relleno.style.width = cambioNivel > 0 ? '0%' : '100%'; });
      relleno.style.width = destino;
    }, paso);
  }

  if (movimiento < 0) {
    programarBarra(id, () => relleno.classList.remove('is-restando'), paso * (dosTiempos ? 2 : 1) + 60);
  }
}

/* ---------- Reparto de PX ---------- */

/** Escribe los PX nuevos y pone la ficha al día. Devuelve el signo del cambio de nivel. */
function escribirPX(personaje, xpNuevo) {
  const movimiento = Math.sign(xpNuevo - personaje.xp);
  const cambioNivel = Math.sign(nivelDesdeXP(xpNuevo) - nivelDesdeXP(personaje.xp));

  personaje.xp = xpNuevo;
  personaje.actualizado = new Date().toISOString();

  const nodo = nodoFicha(personaje.id);
  if (nodo) pintarProgreso(nodo, personaje, movimiento, cambioNivel);
  return cambioNivel;
}

function resumenCambio(personaje, xpAnterior, cambioNivel) {
  const delta = personaje.xp - xpAnterior;
  const cabeza = `${delta > 0 ? '+' : '−'}${formatearPX(Math.abs(delta))} PX a ${personaje.nombre}`;
  if (cambioNivel === 0) return cabeza;
  // Subir de nivel también se anuncia aquí; la celebración visual llega en la Fase 5.
  return `${cabeza} · ${cambioNivel > 0 ? 'sube al' : 'vuelve al'} nivel ${nivelDesdeXP(personaje.xp)}`;
}

function aplicarPX(id, cantidad) {
  const personaje = estado.personajes.find((p) => p.id === id);
  if (!personaje) return;

  const anterior = personaje.xp;
  const nuevo = normalizarPX(anterior + cantidad);
  if (nuevo === anterior) {
    mostrarAviso(`${personaje.nombre} ya no tiene PX que perder.`);
    return;
  }

  const cambioNivel = escribirPX(personaje, nuevo);
  if (!persistir()) return;

  ultimoCambio = { id, xpAnterior: anterior };
  mostrarAviso(resumenCambio(personaje, anterior, cambioNivel), {
    milisegundos: 6000,
    accion: deshacer,
  });

  if (cambioNivel > 0) lanzarCelebracion(personaje);
}

/**
 * El instante 0 de la secuencia es cuando la barra acaba de llenarse, no cuando se toca
 * la moneda. Se cuelga del mismo lote de relojes que la barra para que un toque nuevo
 * la cancele junto con la animación que la iba a acompañar.
 *
 * Deliberadamente **no** se llama desde `deshacer`: recuperar un nivel que se acababa de
 * perder es una corrección, no un logro, y celebrarla convertiría el deshacer en fiesta.
 */
function lanzarCelebracion(personaje) {
  const nodo = nodoFicha(personaje.id);
  if (!nodo) return;

  const nivel = nivelDesdeXP(personaje.xp);
  programarBarra(personaje.id, () => {
    const actual = nodoFicha(personaje.id);
    if (actual) celebrarSubida(actual, personaje.nombre, nivel);
  }, duracionDe(nodo.querySelector('.barra__relleno')));
}

/* Un solo paso de deshacer, y solo mientras el aviso está en pantalla: es la red de
   seguridad para el toque equivocado, no un historial (eso está fuera de alcance). */
function deshacer() {
  if (!ultimoCambio) return;
  const { id, xpAnterior } = ultimoCambio;
  ultimoCambio = null;

  const personaje = estado.personajes.find((p) => p.id === id);
  if (!personaje) {
    mostrarAviso('Ese aventurero ya no está en el campamento.');
    return;
  }

  escribirPX(personaje, xpAnterior);
  persistir();
  mostrarAviso(`${personaje.nombre} vuelve a ${formatearPX(xpAnterior)} PX.`);
}

/* ---------- Controles de la ficha ---------- */

function signoDe(nodo) {
  return nodo.querySelector('.signo__op.is-activo')?.dataset.signo === '-1' ? -1 : 1;
}

function cambiarSigno(nodo, elegido) {
  for (const op of nodo.querySelectorAll('.signo__op')) {
    const activo = op === elegido;
    op.classList.toggle('is-activo', activo);
    op.setAttribute('aria-pressed', String(activo));
  }
}

function alternarLibre(nodo, abrir) {
  const fila = nodo.querySelector('.libre');
  const boton = nodo.querySelector('.moneda--libre');
  const campo = nodo.querySelector('.libre__campo');
  const abierta = abrir ?? fila.hidden;

  fila.hidden = !abierta;
  boton.setAttribute('aria-expanded', String(abierta));

  if (abierta) {
    campo.focus();
  } else {
    campo.value = '';
    boton.focus();
  }
}

function aplicarLibre(nodo) {
  const campo = nodo.querySelector('.libre__campo');
  const cantidad = Math.floor(Number(campo.value));

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    mostrarAviso('Escribe una cantidad de PX mayor que cero.');
    campo.focus();
    return;
  }
  if (cantidad > PX_MAXIMO_LIBRE) {
    mostrarAviso(`De una vez, como mucho ${formatearPX(PX_MAXIMO_LIBRE)} PX.`);
    campo.focus();
    return;
  }

  alternarLibre(nodo, false);
  aplicarPX(nodo.dataset.id, cantidad * signoDe(nodo));
}

/* ---------- La hoja ---------- */

function rellenarClases() {
  const opciones = Object.entries(CLASES).map(([clave, datos]) => {
    const opcion = document.createElement('option');
    opcion.value = clave;
    opcion.textContent = `${datos.emoji} ${datos.nombre}`;
    return opcion;
  });
  campoClase.append(...opciones);
}

function limpiarErrores() {
  for (const nodo of [errorNombre, errorClase]) {
    nodo.textContent = '';
    nodo.hidden = true;
  }
  campoNombre.removeAttribute('aria-invalid');
  campoClase.removeAttribute('aria-invalid');
}

function marcarError(nodo, campo, texto) {
  nodo.textContent = texto;
  nodo.hidden = false;
  campo.setAttribute('aria-invalid', 'true');
}

function actualizarVistaToken() {
  if (fotoActual) {
    const img = document.createElement('img');
    img.src = fotoActual;
    img.alt = '';
    tokenVista.replaceChildren(img);
    botonQuitar.hidden = false;
    tokenNota.textContent = 'Recortada al centro y guardada en pequeño.';
  } else {
    tokenVista.textContent = campoClase.value ? datosClase(campoClase.value).emoji : '🍄';
    botonQuitar.hidden = true;
    tokenNota.textContent = 'Sin foto se usa el emoji de la clase.';
  }
}

function reiniciarBorrado() {
  clearTimeout(relojBorrado);
  confirmandoBorrado = false;
  botonEliminar.textContent = 'Echar del campamento';
  botonEliminar.classList.remove('is-confirmando');
}

function abrirHoja(personaje, origen) {
  disparador = origen ?? null;
  editandoId = personaje?.id ?? null;
  fotoActual = personaje?.token ?? null;

  limpiarErrores();
  reiniciarBorrado();

  campoNombre.value = personaje?.nombre ?? '';
  campoClase.value = personaje?.clase ?? '';
  tituloHoja.textContent = personaje ? 'Editar aventurero' : 'Nuevo aventurero';
  botonGuardar.textContent = personaje ? 'Guardar cambios' : 'Sentar junto al fuego';
  botonEliminar.hidden = !personaje;
  actualizarVistaToken();

  hoja.hidden = false;
  document.body.classList.add('sin-scroll');
  // Un reflujo forzado le da a la transición un punto de partida. Con
  // requestAnimationFrame la hoja se quedaba invisible si la pestaña estaba
  // en segundo plano, porque ahí el navegador no dispara los fotogramas.
  void hoja.offsetWidth;
  hoja.classList.add('is-abierta');
  campoNombre.focus();
}

function cerrarHoja() {
  hoja.classList.remove('is-abierta');
  document.body.classList.remove('sin-scroll');
  setTimeout(() => { hoja.hidden = true; }, 260);
  reiniciarBorrado();
  campoFoto.value = '';
  disparador?.focus();
  disparador = null;
}

/* ---------- Guardar, editar, eliminar ---------- */

function enviar() {
  limpiarErrores();

  const nombre = campoNombre.value.trim();
  const clase = campoClase.value;
  let correcto = true;

  if (!nombre) {
    marcarError(errorNombre, campoNombre, 'Ponle un nombre al aventurero.');
    correcto = false;
  }
  if (!clase) {
    marcarError(errorClase, campoClase, 'Elige una clase.');
    correcto = false;
  }
  if (!correcto) return;

  const ahora = new Date().toISOString();
  const existente = estado.personajes.find((p) => p.id === editandoId);

  if (existente) {
    Object.assign(existente, { nombre, clase, token: fotoActual, actualizado: ahora });
  } else {
    estado.personajes.push({
      id: nuevoId(),
      nombre,
      clase,
      token: fotoActual,
      xp: 0,
      creado: ahora,
      actualizado: ahora,
    });
  }

  persistir();
  dibujar();
  cerrarHoja();
}

function eliminar() {
  const indice = estado.personajes.findIndex((p) => p.id === editandoId);
  if (indice === -1) return cerrarHoja();

  const [fuera] = estado.personajes.splice(indice, 1);
  persistir();
  dibujar();
  cerrarHoja();
  mostrarAviso(`${fuera.nombre} ya no está en el campamento.`);
}

/* ---------- Eventos ---------- */

botonNuevo.addEventListener('click', () => abrirHoja(null, botonNuevo));

/* Un solo oyente para toda la lista: las fichas se reemplazan al redibujar y así no hay
   que volver a enganchar nada. El orden importa — `.moneda--libre` también es `.moneda`,
   de ahí que las de valor fijo se busquen por `data-px`. */
lista.addEventListener('click', (evento) => {
  const nodo = evento.target.closest('.ficha');
  if (!nodo) return;

  const abrir = evento.target.closest('.ficha__abrir');
  if (abrir) {
    const personaje = estado.personajes.find((p) => p.id === nodo.dataset.id);
    if (personaje) abrirHoja(personaje, abrir);
    return;
  }

  const signo = evento.target.closest('.signo__op');
  if (signo) return cambiarSigno(nodo, signo);

  if (evento.target.closest('.moneda--libre')) return alternarLibre(nodo);
  if (evento.target.closest('.libre__aplicar')) return aplicarLibre(nodo);

  const moneda = evento.target.closest('.moneda[data-px]');
  if (moneda) aplicarPX(nodo.dataset.id, Number(moneda.dataset.px) * signoDe(nodo));
});

lista.addEventListener('keydown', (evento) => {
  const campo = evento.target.closest('.libre__campo');
  if (!campo) return;

  if (evento.key === 'Enter') {
    evento.preventDefault();
    aplicarLibre(campo.closest('.ficha'));
  } else if (evento.key === 'Escape') {
    alternarLibre(campo.closest('.ficha'), false);
  }
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  enviar();
});

botonCancelar.addEventListener('click', cerrarHoja);
velo.addEventListener('click', cerrarHoja);

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && !hoja.hidden) cerrarHoja();
});

campoClase.addEventListener('change', actualizarVistaToken);

botonFoto.addEventListener('click', () => campoFoto.click());

campoFoto.addEventListener('change', async () => {
  const archivo = campoFoto.files?.[0];
  if (!archivo) return;

  botonFoto.disabled = true;
  botonFoto.textContent = 'Un momento…';
  try {
    fotoActual = await procesarToken(archivo);
    if (pesoAproximado(fotoActual) > SALIDA_MAXIMA) {
      console.warn(`[app] Token de ${Math.round(pesoAproximado(fotoActual) / 1024)} KB, más de lo previsto.`);
    }
    actualizarVistaToken();
  } catch (error) {
    mostrarAviso(error.message);
  } finally {
    botonFoto.disabled = false;
    botonFoto.textContent = 'Elegir foto';
    // Se limpia para que elegir dos veces la misma foto vuelva a disparar el evento.
    campoFoto.value = '';
  }
});

botonQuitar.addEventListener('click', () => {
  fotoActual = null;
  actualizarVistaToken();
});

/* Borrar es lo único irreversible, así que pide confirmación. Se hace con el propio
   botón en lugar de un confirm() del navegador, que bloquea y rompe la ambientación. */
botonEliminar.addEventListener('click', () => {
  if (!confirmandoBorrado) {
    confirmandoBorrado = true;
    botonEliminar.textContent = '¿Seguro? Toca otra vez';
    botonEliminar.classList.add('is-confirmando');
    relojBorrado = setTimeout(reiniciarBorrado, 4000);
    return;
  }
  eliminar();
});

rellenarClases();
dibujar();
