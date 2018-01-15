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
      updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      console.log('Service Worker is Installing!');
      trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener('updatefound', () => {
      console.log('Service Worker is Installing!');
      trackInstalling(reg.installing);
    })

  })

}

function trackInstalling(worker) {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed'){
      console.log('Service Worker is Waiting');
      updateReady(worker);
    }
  })
}

function updateReady(worker) {
  const toastDiv = document.getElementById('toastDiv');
  const swDismissBtn = document.getElementById('swDismiss');
  const swRefreshBtn = document.getElementById('swRefresh');

  toastDiv.classList.remove('hidden');

  swDismissBtn.addEventListener('click', () => {
    toastDiv.classList.add('hidden');
  })

  swRefreshBtn.addEventListener('click', () => {
    toastDiv.classList.add('hidden');
    worker.postMessage({action: 'skipWaiting'});
  })
}
