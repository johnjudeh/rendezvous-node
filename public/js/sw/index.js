// export default

registerServiceWorker();

function registerServiceWorker() {

  if (!navigator.serviceWorker) return

  navigator.serviceWorker.register('/sw.js').then(reg => {
    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      console.log('Service Worker is Waiting');
      return;
    }

    if (reg.installing) {
      console.log('Service Worker is Installing!');
      return;
    }

    reg.addEventListener('updatefound', () => {
      console.log('Service Worker is Installing!');
    })

  })

}
