'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceWorker = function () {
  function ServiceWorker() {
    _classCallCheck(this, ServiceWorker);

    this.registerServiceWorker();
  }

  _createClass(ServiceWorker, [{
    key: 'registerServiceWorker',
    value: function registerServiceWorker() {
      var _this = this;

      if (!navigator.serviceWorker) return;
      var serviceWorker = this;

      navigator.serviceWorker.register('/sw.js').then(function (reg) {
        if (!navigator.serviceWorker.controller) {
          return;
        }

        if (reg.waiting) {
          console.log('Service Worker is Waiting');
          _this.updateReady(reg.waiting);
          return;
        }

        if (reg.installing) {
          console.log('Service Worker is Installing!');
          _this.trackInstalling(reg.installing);
          return;
        }

        reg.addEventListener('updatefound', function () {
          console.log('Service Worker is Installing!');
          serviceWorker.trackInstalling(reg.installing);
        });
      }).catch(function (error) {
        console.log('Oops, something went wrong!');
      });
    }
  }, {
    key: 'trackInstalling',
    value: function trackInstalling(worker) {
      worker.addEventListener('statechange', function () {
        if (worker.state === 'installed') {
          console.log('Service Worker is Waiting');
          serviceWorker.updateReady(worker);
        }
      });
    }
  }, {
    key: 'updateReady',
    value: function updateReady(worker) {
      var toastDiv = document.getElementById('toastDiv');
      var swDismissBtn = document.getElementById('swDismiss');
      var swRefreshBtn = document.getElementById('swRefresh');

      toastDiv.classList.remove('hidden');

      swDismissBtn.addEventListener('click', function () {
        toastDiv.classList.add('hidden');
      });

      swRefreshBtn.addEventListener('click', function () {
        toastDiv.classList.add('hidden');
        worker.postMessage({ action: 'skipWaiting' });
      });
    }
  }]);

  return ServiceWorker;
}();

var serviceWorker = new ServiceWorker();