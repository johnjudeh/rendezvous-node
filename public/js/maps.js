let map, infoWindow, pos, autocomplete, places, geocoder;
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
let funLocations = [];
let funMarkers = [];
let funPlaceTypes = [
  'amusement_park',
  'aquarium',
  'art_gallery',
  'bakery',
  'bar',
  'beauty_salon',
  'bicycle_store',
  'book_store',
  'bowling_alley',
  'cafe',
  'campground',
  'car_rental',
  'casino',
  'gym',
  'hair_care',
  'library',
  // 'lodging',
  'movie_theater',
  'museum',
  'night_club',
  'park',
  'restaurant',
  'rv_park',
  'shopping_mall',
  'spa',
  'stadium',
  'travel_agency',
  'zoo'
];
let spySrc = '/avatars/ninja.png'
const MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
const hostnameRegexp = new RegExp('^https?://.+?/');
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
    backgroundColor: 'rgb(242, 255, 254)'
    // draggable: false,
    // zoomControl: false,
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  geocoder = new google.maps.Geocoder();

  locateButton.addEventListener('click', geolocateUser, {once: true});
  searchButton.addEventListener('click', createAutocomplete);
  funButton.addEventListener('click', search);
}

function geolocateUser() {
  loadingGeolocation();
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);

      hideLocatorButtons();
      addFriendHolder(pos, spySrc);

      // Waits till the locator button animation ends
      setTimeout(() => createAutocomplete(), 1000);
      createMarkerClusterer();

    }, () => {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function createAutocomplete() {
  // replaces locations buttons with search bar
  createSearchInput();

  const autocompleteInput = document.getElementById('autocomplete');
  autocompleteInput.focus();

  autocomplete = new google.maps.places.Autocomplete(
    autocompleteInput, {
    types: [],
    // types: ['address'],
    componentRestrictions: countryRestrict
  });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', () => onPlaceChanged(autocompleteInput));
}

function createSearchInput () {
  hideLocatorButtons();

  const searchDiv = document.querySelector('#search');
  searchDiv.classList.remove('hidden');
}

function loadingGeolocation () {
  const locateButton = document.querySelector('.locateButton');
  locateButton.classList.add('loading');
}

// Add transition animations!

function hideLocatorButtons() {
  const locatorDiv = document.querySelector('#locator');
  const locateButton = document.querySelector('.locateButton');
  const orDiv = document.querySelector('.or');

  locateButton.classList.remove('loading', 'geo');
  locateButton.textContent = '';
  locateButton.classList.add('shrink');
  setTimeout(() => locatorDiv.classList.add('hidden'), 1000);
}

function addFriendHolder(location, imgSrc) {
  const locatorParent = document.querySelector('.locatorParent');
  const friendHolder = document.querySelector('#clone');
  const fhCloned = friendHolder.cloneNode(true);

  fhCloned.classList.remove('hidden');
  fhCloned.id = '';

  geocoder.geocode({
    location: location
    // fill more into me
  }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      let address;
      console.log(results);

      if (results[0].formatted_address) {
        address = results[0].formatted_address;
      } else {
        // If first result has no formatted address
        address = 'Not available...';
      }

      const addressParagraph = fhCloned.childNodes[1].childNodes[3].childNodes[1];
      addressParagraph.textContent = address;
    }
  })

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

function onPlaceChanged(inputElement) {
  let place = autocomplete.getPlace();

  inputElement.value = '';
  inputElement.focus();

  if (place.geometry.location) {
    let location = place.geometry.location.toJSON();
    locations.push(location);
    createMarkerClusterer();
    addFriendHolder(location);
  } else {
    document.getElementById('autocomplete').placeholder = 'Enter a city';
  }
}

// Add a bouncing marker for the chosen area can first implement
// randomly before figuring out how to really do it

function search() {

  const search = {
    location: map.getCenter(),
    radius: 900,                // Upto 50 000
    types: funPlaceTypes,
    openNow: true,
    rankBy: google.maps.places.RankBy.PROMINENCE
  }

  places.nearbySearch(search, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // clearResults();
      // clearMarkers();

      // Create a marker for each hotel found, and
      // assign a letter of the alphabetic to each marker icon.
      // for (var i = 0; i < results.length; i++) {
      for (let i = 0; i < 5; i++) {
        let markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        let markerIcon = MARKER_PATH + markerLetter + '.png';
        // Use marker animation to drop the icons incrementally on the map.
        funMarkers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });

        funLocations.push(results[i].geometry.location.toJSON());
        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        funMarkers[i].placeResult = results[i];
        google.maps.event.addListener(funMarkers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        // addResult(results[i], i);
      }
    } else {
      console.log('Oh no!', status);
    }
  });

  // Zooms into locations
  setTimeout(() => {
    map.setZoom(getZoomLevel(funLocations));
    map.panTo(getMidPoint(funLocations));
  }, 2300)
}

function dropMarker(i) {
  return function() {
    funMarkers[i].setMap(map);
  };
}

function showInfoWindow() {
  let marker = this;
  places.getDetails({placeId: marker.placeResult.place_id},
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
      });
}

function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="funPlaceIcon" ' +
      'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
      '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
        place.formatted_phone_number;
  } else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
  // for the rating points not achieved.
  if (place.rating) {
    let ratingHtml = '';
    for (let i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      } else {
        ratingHtml += '&#10029;';
      }
    document.getElementById('iw-rating-row').style.display = '';
    document.getElementById('iw-rating').innerHTML = ratingHtml;
    }
  } else {
    document.getElementById('iw-rating-row').style.display = 'none';
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    let fullUrl = place.website;
    let website = hostnameRegexp.exec(place.website);
    if (website === null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('iw-website-row').style.display = '';
    document.getElementById('iw-website').textContent = website;
  } else {
    document.getElementById('iw-website-row').style.display = 'none';
  }
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
