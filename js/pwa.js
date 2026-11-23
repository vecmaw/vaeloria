'use strict';

/* Registro del service worker y petición de almacenamiento persistente.
   Bajo file:// el navegador no registra service workers; ahí la app funciona igual, solo sin caché. */
(function () {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }
})();
