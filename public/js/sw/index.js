// export default

serviceWorker();

function serviceWorker() {

  if (!navigator.serviceWorker) return

  navigator.serviceWorker.register('./sw/sw.js').then((reg) => {
    console.log('Service worker registered: ', reg);
  }).catch((err) => {
    console.log('Service worker registration failed: ', err);
  });

}
