/* ============================================================
   Convierte la foto que elige el usuario en un token pequeño.
   Aquí se concentra toda la parte frágil: orientación EXIF,
   recorte y formatos de salida.
   ============================================================ */

'use strict';

/** Lado del token guardado. 160 px basta: en pantalla se muestra a 56. */
const LADO = 160;
const CALIDAD = 0.82;

/** Por encima de esto ni se intenta; son fotos que no vienen de una galería normal. */
const ENTRADA_MAXIMA = 25 * 1024 * 1024;

/** Un token comprimido debería quedar bastante por debajo de esto. */
const SALIDA_MAXIMA = 20 * 1024;

function cargarConImg(archivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}

/* createImageBitmap con 'from-image' respeta la orientación EXIF de las fotos de
   celular. Donde no exista o no acepte la opción, un <img> normal ya la aplica
   por su cuenta en todos los navegadores modernos. */
async function cargarImagen(archivo) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    } catch {
      // sigue por el camino del <img>
    }
  }
  return cargarConImg(archivo);
}

/**
 * Recorta al cuadrado central, reduce a 160 px y comprime.
 * Devuelve un `data:` URL listo para guardar.
 */
async function procesarToken(archivo) {
  if (!archivo || !archivo.type?.startsWith('image/')) {
    throw new Error('Eso no parece una imagen.');
  }
  if (archivo.size > ENTRADA_MAXIMA) {
    throw new Error('Esa imagen es demasiado pesada. Prueba con otra.');
  }

  const imagen = await cargarImagen(archivo);
  const ancho = imagen.width;
  const alto = imagen.height;
  if (!ancho || !alto) throw new Error('No se pudo leer la imagen.');

  const lado = Math.min(ancho, alto);
  const desdeX = (ancho - lado) / 2;
  const desdeY = (alto - lado) / 2;

  const lienzo = document.createElement('canvas');
  lienzo.width = LADO;
  lienzo.height = LADO;

  const pincel = lienzo.getContext('2d');
  pincel.imageSmoothingEnabled = true;
  pincel.imageSmoothingQuality = 'high';
  pincel.drawImage(imagen, desdeX, desdeY, lado, lado, 0, 0, LADO, LADO);
  imagen.close?.();

  // Si el navegador no sabe exportar WebP devuelve un PNG, que pesa de más.
  let dato = lienzo.toDataURL('image/webp', CALIDAD);
  if (!dato.startsWith('data:image/webp')) {
    dato = lienzo.toDataURL('image/jpeg', CALIDAD);
  }
  return dato;
}

/** Bytes aproximados que ocupa un `data:` URL una vez guardado. */
function pesoAproximado(dataUrl) {
  return typeof dataUrl === 'string' ? dataUrl.length * 2 : 0;
}
