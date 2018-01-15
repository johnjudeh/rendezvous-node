// export default

serviceWorker();

function serviceWorker() {

  if (!navigator.serviceWorker) return

  navigator.serviceWorker.register('/sw.js').then((reg) => {
    console.log('Service worker reigistered: ', reg);
  }).catch((err) => {
    console.log('Service worker not registered: ', err);
  })

}
