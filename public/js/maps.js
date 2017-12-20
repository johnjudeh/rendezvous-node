let map, infoWindow;
let locateButton = document.querySelector('.locateButton');
let locReq = document.currentScript.getAttribute('data-locReq');

// let latInput = document.querySelector('input.lat');
// let longInput = document.querySelector('input.long');
// lat = Number(document.currentScript.getAttribute('data-lat'));
// lng = Number(document.currentScript.getAttribute('data-lng'));
//
// coordinates = {lat, lng}

function initMap() {
  if (locReq == 'false') {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 51.5007, lng: -0.12406},
      zoom: 11
    });
  } else {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 51.5007, lng: -0.12406},
      zoom: 14
    });
    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        var marker = new google.maps.Marker({
            position: pos,
            map: map
        });
        map.setCenter(pos);
      }, () => {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// locateButton.addEventListener('click', () => {
//   location.reload();
// });
