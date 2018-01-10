let map, infoWindow, pos, autocomplete, places;
let countryRestrict = {'country': 'uk'};
let locations = [
  // {lat: 51.4954622, lng: -0.07652579999999999},
  // {lat: 51.5051007, lng: -0.01562920000003487},
  // {lat: 51.5501741, lng: -0.003371000000015556}
  // {lat: 51.4955329 + (0.00137 * Math.pow(2, 5.4)), lng: -0.0765513 + (0.0038 * Math.pow(2, 4))},
  // {lat: 51.4955329 - (0.00137 * Math.pow(2, 4)), lng: -0.0765513 - (0.0038 * Math.pow(2, 4))}
  // {lat: 51.4955329, lng: -0.0765513}
];
let addresses = ['Flat 1, Amisha Court, SE1 3GH'];
let funMarkers = [];
let spySrc = 'https://cdn2.iconfinder.com/data/icons/ninja/500/Ninja_4-512.png'
const MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
const locateButton = document.querySelector('button.locateButton');
const searchButton = document.querySelector('button.search');
const funButton = document.querySelector('.funFinder');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 51.5007, lng: -0.12406},
    center: {lat: 51.509, lng: -0.116},
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    backgroundColor: 'rgb(242, 255, 254)',
    draggable: false
    // zoomControl: false,
  });

  infoWindow = new google.maps.InfoWindow;

  locateButton.addEventListener('click', () => geolocateUser(infoWindow), {once: true});
  searchButton.addEventListener('click', () => createAutocomplete(infoWindow));
  funButton.addEventListener('click', search);
}

function geolocateUser(infoWindow) {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);
      hideLocatorButtons();
      addFriendHolder(spySrc);
      createAutocomplete();
      // addFriendLocation();
      createMarkerClusterer();

    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function createAutocomplete(infoWindow) {
  // replaces locations buttons with search bar
  createSearchInput();

  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete'), {
    types: [],
    // types: ['address'],
    componentRestrictions: countryRestrict
  });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

function createSearchInput () {
  hideLocatorButtons();

  const searchDiv = document.querySelector('#search');
  searchDiv.classList.remove('hidden');
}

function hideLocatorButtons() {
  const locatorDiv = document.querySelector('#locator');
  locatorDiv.classList.add('hidden');
}

function addFriendHolder(imgSrc) {
  const locatorParent = document.querySelector('.locatorParent');
  const friendHolder = document.querySelector('#clone');
  const fhCloned = friendHolder.cloneNode(true);
  fhCloned.classList.remove('hidden');
  fhCloned.id = '';

  if (imgSrc) {
    const img = fhCloned.childNodes[1].childNodes[1];
    img.src = imgSrc;
  }

  if (locations.length === 2) {
    const funFinderDiv = document.getElementById('funFinderDiv');
    funFinderDiv.classList.remove('hidden');
  }

  locatorParent.insertBefore(fhCloned, friendHolder);
}

function initMapSearch() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.5007, lng: -0.12406},
    zoom: 12,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  autocomplete = new google.maps.places.Autocomplete(
      /* @type {!HTMLInputElement} */ (
        document.getElementById('autocomplete')), {
        types: [],
        // types: ['address'],
        componentRestrictions: countryRestrict
      });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
  let place = autocomplete.getPlace();

  if (place.geometry.location) {
    locations.push(place.geometry.location.toJSON());
    createMarkerClusterer();
    addFriendHolder();
    // map.panTo(place.geometry.location);
    // map.setZoom(15);
    // search();
  } else {
    document.getElementById('autocomplete').placeholder = 'Enter a city';
  }
}

function search() {

  const search = {
    // bounds: map.getBounds(),
    location: map.getCenter(),
    radius: 800,                // Upto 50 000
    types: ['lodgings'],
    openNow: true,
    rankBy: google.maps.places.RankBy.PROMINENCE
  }

  places.nearbySearch(search, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // clearResults();
      // clearMarkers();

      // Create a marker for each hotel found, and
      // assign a letter of the alphabetic to each marker icon.
      for (var i = 0; i < results.length; i++) {
        let markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        let markerIcon = MARKER_PATH + markerLetter + '.png';
        // Use marker animation to drop the icons incrementally on the map.
        funMarkers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });
        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        funMarkers[i].placeResult = results[i];
        // google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        // addResult(results[i], i);
      }
    } else {
      console.log('oh no!', status);
    }
  });

  // setTimeout(() => map.setZoom(), 500)
}

function dropMarker(i) {
  return function() {
    funMarkers[i].setMap(map);
  };
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function createMarkerClusterer(){
  // Marker clusters
  let labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let markers = locations.map((location, i) => {
    return new google.maps.Marker({
      position: location,
      label: labels[i % labels.length],
      animation: google.maps.Animation.DROP
    });
  })

  let markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

  let midPoint = getMidPoint(locations);
  let zoomLevel = getZoomLevel(locations);

  map.setCenter(midPoint);
  map.setZoom(zoomLevel);
}

function getMidPoint(locations) {
  let lats = []
  let lngs = [];
  let avgCoords = {};

  locations.forEach((location) => {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  maxLat = Math.max(...lats);
  minLat = Math.min(...lats);
  maxLng = Math.max(...lngs);
  minLng = Math.min(...lngs);

  avgCoords.lat = average([minLat, maxLat]);
  avgCoords.lng = average([minLng, maxLng]);

  return avgCoords;
}

function average(arr) {
  let sum = 0;
  for (index of arr) {
    sum += index;
  }
  return sum / arr.length;
}

function getZoomLevel(locations) {

  const latIncrement = 0.00137;
  const lngIncrement = 0.0038;
  const zoomLevels = [
    18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
  ];

  let lats = [];
  let lngs = [];

  let maxLat, minLat, maxLng, minLng;
  let latRange, lngRange;
  let latZoomIndex, lngZoomIndex, latZoomLevel, lngZoomLevel;
  let zoomLevel;

  locations.forEach((location) => {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  maxLat = Math.max(...lats);
  minLat = Math.min(...lats);
  maxLng = Math.max(...lngs);
  minLng = Math.min(...lngs);

  latRange = maxLat - minLat;
  lngRange = maxLng - minLng;

  latZoomIndex = Math.ceil((Math.log(latRange) - Math.log(latIncrement)) / Math.log(2));
  lngZoomIndex = Math.ceil((Math.log(lngRange) - Math.log(lngIncrement)) / Math.log(2));

  if (latZoomIndex < 0) {
    latZoomLevel = 18;
  } else if(latZoomIndex <= 17) {
    latZoomLevel = zoomLevels[latZoomIndex];
  } else {
    latZoomLevel = 1;
  }

  if (lngZoomIndex < 0) {
    lngZoomLevel = 18;
  } else if (lngZoomIndex <= 17) {
    lngZoomLevel = zoomLevels[lngZoomIndex];
  } else {
    lngZoomLevel = 1;
  }

  zoomLevel = Math.min(latZoomLevel, lngZoomLevel);

  return zoomLevel;
}
