'use strict';

/* Subir el número de VERSION en cada publicación: es lo que hace que los teléfonos
   descarten la caché vieja y vean los cambios. */
const VERSION = 'vaeloria-v1';

const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/estilo.css',
  'js/xp.js',
  'js/clases.js',
  'js/almacen.js',
  'js/imagen.js',
  'js/celebracion.js',
  'js/pwa.js',
  'js/app.js',
  'recursos/iconos/icono-64.png',
  'recursos/iconos/icono-192.png',
  'recursos/iconos/icono-512.png',
  'recursos/iconos/icono-maskable-512.png'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true }).then((guardado) => guardado || fetch(evento.request))
  );
});
