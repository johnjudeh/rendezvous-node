'use strict';

var map = void 0,
    infoWindow = void 0,
    pos = void 0,
    autocomplete = void 0,
    places = void 0,
    geocoder = void 0;
var countryRestrict = { 'country': 'uk' };
var locations = [
  // {lat: 51.4954622, lng: -0.07652579999999999},
  // {lat: 51.5051007, lng: -0.01562920000003487},
  // {lat: 51.5501741, lng: -0.003371000000015556}
  // {lat: 51.4955329 + (0.00137 * Math.pow(2, 5.4)), lng: -0.0765513 + (0.0038 * Math.pow(2, 4))},
  // {lat: 51.4955329 - (0.00137 * Math.pow(2, 4)), lng: -0.0765513 - (0.0038 * Math.pow(2, 4))}
  // {lat: 51.4955329, lng: -0.0765513}
];
var addresses = ['Flat 1, Amisha Court, SE1 3GH'];
var funLocations = [];
var funMarkers = [];
var funPlaceTypes = ['amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bar', 'beauty_salon', 'bicycle_store', 'book_store', 'bowling_alley', 'cafe', 'campground', 'car_rental', 'casino', 'gym', 'hair_care', 'library', 'lodging', 'movie_theater', 'museum', 'night_club', 'park', 'restaurant', 'rv_park', 'shopping_mall', 'spa', 'stadium', 'travel_agency', 'zoo'];
var spySrc = 'https://cdn2.iconfinder.com/data/icons/ninja/500/Ninja_4-512.png';
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');
var locateButton = document.querySelector('button.locateButton');
var searchButton = document.querySelector('button.search');
var funButton = document.querySelector('.funFinder');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 51.5007, lng: -0.12406},
    center: { lat: 51.509, lng: -0.116 },
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

  locateButton.addEventListener('click', geolocateUser, { once: true });
  searchButton.addEventListener('click', createAutocomplete);
  funButton.addEventListener('click', search);
}

function geolocateUser() {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);

      hideLocatorButtons();
      addFriendHolder(pos, spySrc);

      createAutocomplete();
      createMarkerClusterer();
    }, function () {
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

  autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
    types: [],
    // types: ['address'],
    componentRestrictions: countryRestrict
  });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);
}

function createSearchInput() {
  hideLocatorButtons();

  var searchDiv = document.querySelector('#search');
  searchDiv.classList.remove('hidden');
}

function hideLocatorButtons() {
  var locatorDiv = document.querySelector('#locator');
  locatorDiv.classList.add('hidden');
}

function addFriendHolder(location, imgSrc) {
  var locatorParent = document.querySelector('.locatorParent');
  var friendHolder = document.querySelector('#clone');
  var fhCloned = friendHolder.cloneNode(true);

  fhCloned.classList.remove('hidden');
  fhCloned.id = '';

  geocoder.geocode({
    location: location
    // fill more into me
  }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var address = void 0;

      if (results[0].formatted_address) {
        address = results[0].formatted_address;
      } else {
        // If first result has no formatted address
        address = 'Not available...';
      }

      var addressParagraph = fhCloned.childNodes[1].childNodes[3].childNodes[1];
      addressParagraph.textContent = address;
    }
  });

  if (imgSrc) {
    var img = fhCloned.childNodes[1].childNodes[1];
    img.src = imgSrc;
  }

  if (locations.length === 2) {
    var funFinderDiv = document.getElementById('funFinderDiv');
    funFinderDiv.classList.remove('hidden');
  }

  locatorParent.insertBefore(fhCloned, friendHolder);
}

function onPlaceChanged() {
  var place = autocomplete.getPlace();

  if (place.geometry.location) {
    var location = place.geometry.location.toJSON();
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

  var search = {
    location: map.getCenter(),
    radius: 900, // Upto 50 000
    types: funPlaceTypes,
    openNow: true,
    rankBy: google.maps.places.RankBy.PROMINENCE
  };

  places.nearbySearch(search, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // clearResults();
      // clearMarkers();

      // Create a marker for each hotel found, and
      // assign a letter of the alphabetic to each marker icon.
      // for (var i = 0; i < results.length; i++) {
      for (var i = 0; i < 5; i++) {
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
        var markerIcon = MARKER_PATH + markerLetter + '.png';
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
  setTimeout(function () {
    map.setZoom(getZoomLevel(funLocations));
    map.panTo(getMidPoint(funLocations));
  }, 2300);
}

function dropMarker(i) {
  return function () {
    funMarkers[i].setMap(map);
  };
}

function showInfoWindow() {
  var marker = this;
  places.getDetails({ placeId: marker.placeResult.place_id }, function (place, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      return;
    }
    infoWindow.open(map, marker);
    buildIWContent(place);
  });
}

function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="funPlaceIcon" ' + 'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url + '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent = place.formatted_phone_number;
  } else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
  // for the rating points not achieved.
  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < i + 0.5) {
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
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
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
  infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function createMarkerClusterer() {
  // Marker clusters
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  var markers = locations.map(function (location, i) {
    return new google.maps.Marker({
      position: location,
      label: labels[i % labels.length],
      animation: google.maps.Animation.DROP
    });
  });

  var markerCluster = new MarkerClusterer(map, markers, { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });

  var midPoint = getMidPoint(locations);
  var zoomLevel = getZoomLevel(locations);

  map.setCenter(midPoint);
  map.setZoom(zoomLevel);
}

function getMidPoint(locations) {
  var lats = [];
  var lngs = [];
  var avgCoords = {};

  locations.forEach(function (location) {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  maxLat = Math.max.apply(Math, lats);
  minLat = Math.min.apply(Math, lats);
  maxLng = Math.max.apply(Math, lngs);
  minLng = Math.min.apply(Math, lngs);

  avgCoords.lat = average([minLat, maxLat]);
  avgCoords.lng = average([minLng, maxLng]);

  return avgCoords;
}

function average(arr) {
  var sum = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = arr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      index = _step.value;

      sum += index;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return sum / arr.length;
}

function getZoomLevel(locations) {

  var latIncrement = 0.00137;
  var lngIncrement = 0.0038;
  var zoomLevels = [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  var lats = [];
  var lngs = [];

  var maxLat = void 0,
      minLat = void 0,
      maxLng = void 0,
      minLng = void 0;
  var latRange = void 0,
      lngRange = void 0;
  var latZoomIndex = void 0,
      lngZoomIndex = void 0,
      latZoomLevel = void 0,
      lngZoomLevel = void 0;
  var zoomLevel = void 0;

  locations.forEach(function (location) {
    lats.push(location.lat);
    lngs.push(location.lng);
  });

  maxLat = Math.max.apply(Math, lats);
  minLat = Math.min.apply(Math, lats);
  maxLng = Math.max.apply(Math, lngs);
  minLng = Math.min.apply(Math, lngs);

  latRange = maxLat - minLat;
  lngRange = maxLng - minLng;

  latZoomIndex = Math.ceil((Math.log(latRange) - Math.log(latIncrement)) / Math.log(2));
  lngZoomIndex = Math.ceil((Math.log(lngRange) - Math.log(lngIncrement)) / Math.log(2));

  if (latZoomIndex < 0) {
    latZoomLevel = 18;
  } else if (latZoomIndex <= 17) {
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