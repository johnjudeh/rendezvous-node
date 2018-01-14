'use strict';

// export default

serviceWorker();

function serviceWorker() {

  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('./sw/sw.js').then(function (reg) {
    console.log('Service worker registered: ', reg);
  }).catch(function (err) {
    console.log('Service worker registration failed: ', err);
  });
}