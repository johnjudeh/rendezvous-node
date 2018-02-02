'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var map = void 0,
    infoWindow = void 0,
    pos = void 0,
    autocomplete = void 0,
    places = void 0,
    geocoder = void 0,
    funTypes_UserOverride = void 0;
var markers = [];
var londonCenter = { lat: 51.509, lng: -0.116 };
var londonZoom = 12;
var locations = [
  // {lat: 51.4954622, lng: -0.07652579999999999},
  // {lat: 51.5051007, lng: -0.01562920000003487},
  // {lat: 51.5501741, lng: -0.003371000000015556}
  // {lat: 51.4955329 + (0.00137 * Math.pow(2, 5.4)), lng: -0.0765513 + (0.0038 * Math.pow(2, 4))},
  // {lat: 51.4955329 - (0.00137 * Math.pow(2, 4)), lng: -0.0765513 - (0.0038 * Math.pow(2, 4))}
  // {lat: 51.4955329, lng: -0.0765513}
];
var addresses = [];
var funLocations = [];
var funMarkers = [];
var spySrc = '/avatars/ninja.png';
var FUN_PLACE_TYPES = ['amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bar', 'beauty_salon', 'book_store', 'bowling_alley', 'cafe', 'campground', 'car_rental', 'casino', 'gym', 'library',
// 'lodging',
'movie_theater', 'museum', 'night_club', 'park', 'restaurant', 'rv_park', 'shopping_mall', 'spa', 'stadium',
// 'travel_agency',
'zoo'];
var DEFAULT_RADIUS = 1000;
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');
var locateButton = document.querySelector('button.locateButton');
var searchButton = document.querySelector('button.search');
var funButton = document.querySelector('.funFinder');

var currentScript = document.getElementById('mapScript');
var currentUserInterests = currentScript.getAttribute('data-user-interests');

if (currentUserInterests) {
  funTypes_UserOverride = JSON.parse(currentUserInterests);
}

var Map = function () {
  function Map() {
    _classCallCheck(this, Map);

    this.makeMap();
    console.log('Hello!');
  }

  _createClass(Map, [{
    key: 'makeMap',
    value: function makeMap() {
      console.log('Hello!');
      map = new google.maps.Map(document.getElementById('map'), {
        center: londonCenter,
        zoom: londonZoom,
        mapTypeControl: false,
        streetViewControl: false,
        backgroundColor: 'rgb(242, 255, 254)'
      });

      infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
      });

      geocoder = new google.maps.Geocoder();

      locateButton.addEventListener('click', geolocateUser);
      searchButton.addEventListener('click', function () {
        hideLocatorButtons();
        setTimeout(function () {
          return createAutocomplete();
        }, 1000);
      });
      funButton.addEventListener('click', search);
    }
  }]);

  return Map;
}();

function initMap() {
  var mapInstance = new Map();
}

function geolocateUser() {
  loadingGeolocation();
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      locations.push(pos);
      hideLocatorButtons();

      // Waits till the locator button animation ends
      setTimeout(function () {
        createAutocomplete();
        addFriendHolder(pos, spySrc);
      }, 1000);

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

  var autocompleteInput = document.getElementById('autocomplete');
  autocompleteInput.focus();

  autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', function () {
    return onPlaceChanged(autocompleteInput);
  });
}

function createSearchInput() {
  var searchDiv = document.querySelector('#search');
  searchDiv.classList.remove('hidden');
}

function loadingGeolocation() {
  var locateButton = document.querySelector('.locateButton');
  locateButton.classList.add('loading');
}

function hideLocatorButtons() {
  var locatorDiv = document.querySelector('#locator');
  var locateButton = document.querySelector('.locateButton');

  locateButton.classList.remove('loading', 'geo');
  locateButton.textContent = '';
  locateButton.classList.add('shrink');
  setTimeout(function () {
    return locatorDiv.classList.add('hidden');
  }, 1000);
}

function addFriendHolder(location, imgSrc) {
  var locatorParent = document.querySelector('.locatorParent');
  var friendHolder = document.querySelector('#clone');
  var fhCloned = friendHolder.cloneNode(true);
  var resultCountry = void 0;

  fhCloned.classList.remove('hidden');
  fhCloned.id = '';

  geocoder.geocode({ location: location }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {

      if (results[0].formatted_address) {
        addresses.push(results[0].formatted_address);

        var addressComponents_obj = results[0].address_components;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = addressComponents_obj[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var addressCompenent = _step.value;

            if (addressCompenent.types.includes('country')) {
              resultCountry = addressCompenent.short_name;
              unhideButtonsAndSetCountry(resultCountry);
              break;
            }
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
      } else {
        // If first result has no formatted address
        addresses.push('Not available...');
      }

      var addressParagraph = fhCloned.childNodes[1].childNodes[3].childNodes[1];
      addressParagraph.textContent = addresses[addresses.length - 1];
    }
  });

  if (imgSrc) {
    var img = fhCloned.childNodes[1].childNodes[1];
    img.src = imgSrc;
  }

  locatorParent.insertBefore(fhCloned, friendHolder);
}

function unhideButtonsAndSetCountry(country) {
  if (locations.length === 1) {
    setCountryRestriction(country);
    var reloadIcon = document.getElementById('reloadMap');
    var autocompleteInput = document.getElementById('autocomplete');

    reloadIcon.classList.remove('disabled');
    reloadIcon.classList.add('pointer');

    reloadIcon.addEventListener('click', function () {
      window.location.reload();
    });

    autocompleteInput.placeholder = 'Where are your friends?';
  } else if (locations.length === 2) {
    var funFinderDiv = document.getElementById('funFinderDiv');
    funFinderDiv.classList.remove('hidden');
  }
}

function onPlaceChanged(inputElement) {
  var place = autocomplete.getPlace();

  inputElement.value = '';
  inputElement.focus();

  if (place && place.geometry && place.geometry.location) {
    var location = place.geometry.location.toJSON();
    locations.push(location);
    createMarkerClusterer();
    addFriendHolder(location);
  }
}

function search(radius) {

  var search = {
    location: map.getCenter(),
    radius: radius || DEFAULT_RADIUS, // Upto 50 000
    types: funTypes_UserOverride || FUN_PLACE_TYPES,
    openNow: true,
    rankBy: google.maps.places.RankBy.PROMINENCE
  };

  places.nearbySearch(search, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {

      // Checks if number of results is less than max results shown
      var maxResults = 5;
      if (results.length < 5) {
        maxResults = results.length;
      }

      // Create a marker for each fun place found, and assign letter
      for (var i = 0; i < maxResults; i++) {
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
        var markerIcon = MARKER_PATH + markerLetter + '.png';

        // Use marker animation to drop the icons incrementally on the map
        funMarkers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });
        funLocations.push(results[i].geometry.location.toJSON());

        // If the user clicks a marker, show the details in the info window
        funMarkers[i].placeResult = results[i];
        google.maps.event.addListener(funMarkers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);

        // Zooms into locations once they have been decided
        setTimeout(function () {
          map.setZoom(getZoomLevel(funLocations));
          map.panTo(getMidPoint(funLocations));
        }, 2300);
      }
    } else {
      reSearch(radius);
    }
  });
}

function reSearch(oldRadius) {
  var newRadius = void 0;

  if (oldRadius) {
    newRadius = oldRadius * 1.5;
  } else {
    newRadius = DEFAULT_RADIUS * 1.5;
  }

  search(newRadius);
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
  var lastLocationIndex = locations.length - 1;
  markers.push(new google.maps.Marker({
    position: locations[lastLocationIndex],
    label: labels[lastLocationIndex % labels.length],
    animation: google.maps.Animation.DROP
  }));

  //   .map((location, i) => {
  //   return new google.maps.Marker({
  //     position: location,
  //     label: labels[i % labels.length],
  //     animation: google.maps.Animation.DROP
  //   });
  // })

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
  var maxLat = void 0,
      minLat = void 0,
      maxLng = void 0,
      minLng = void 0;

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
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = arr[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var index = _step2.value;

      sum += index;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
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

function setCountryRestriction(country) {
  var countryRestrict = { 'country': country };
  autocomplete.setOptions({ componentRestrictions: countryRestrict });
}

// Not being used at the moment as is very buggy
function resetPage() {
  locations = [];
  var locateButton = document.querySelector('.locateButton');
  var fHolders = document.querySelectorAll('.friendHolder');
  var searchDiv = document.getElementById('search');
  var locatorDiv = document.getElementById('locator');
  var funFinderDiv = document.getElementById('funFinderDiv');

  locateButton.classList.add('geo');
  locateButton.innerHTML = '<i class="marker icon"></i>Locate Me';
  locateButton.classList.remove('shrink');

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = fHolders[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var fHolder = _step3.value;

      fHolder.classList.add('hidden');
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  searchDiv.classList.add('hidden');
  funFinderDiv.classList.add('hidden');
  locatorDiv.classList.remove('hidden');

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = markers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var marker = _step4.value;

      marker.setVisible(false);
      marker.setMap(null);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  markers = [];

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = funMarkers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var funMarker = _step5.value;

      funMarker.setVisible(false);
      funMarker.setMap(null);
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  funMarkers = [];

  map.panTo(londonCenter);
  map.setZoom(londonZoom);
}