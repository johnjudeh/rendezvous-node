let map, infoWindow, pos, autocomplete, places, geocoder, funTypes_UserOverride;
let markers = [];
let londonCenter = {lat: 51.509, lng: -0.116};
let londonZoom = 12;
let locations = [
  // {lat: 51.4954622, lng: -0.07652579999999999},
  // {lat: 51.5051007, lng: -0.01562920000003487},
  // {lat: 51.5501741, lng: -0.003371000000015556}
  // {lat: 51.4955329 + (0.00137 * Math.pow(2, 5.4)), lng: -0.0765513 + (0.0038 * Math.pow(2, 4))},
  // {lat: 51.4955329 - (0.00137 * Math.pow(2, 4)), lng: -0.0765513 - (0.0038 * Math.pow(2, 4))}
  // {lat: 51.4955329, lng: -0.0765513}
];
let addresses = [];
let funLocations = [];
let funMarkers = [];
let spySrc = '/avatars/ninja.png';
const FUN_PLACE_TYPES = [
  'amusement_park',
  'aquarium',
  'art_gallery',
  'bakery',
  'bar',
  'beauty_salon',
  'book_store',
  'bowling_alley',
  'cafe',
  'campground',
  'car_rental',
  'casino',
  'gym',
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
  // 'travel_agency',
  'zoo'
];
const DEFAULT_RADIUS = 1000;
const MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
const hostnameRegexp = new RegExp('^https?://.+?/');
const locateButton = document.querySelector('button.locateButton');
const searchButton = document.querySelector('button.search');
const funButton = document.querySelector('.funFinder');

let currentScript = document.getElementById('mapScript');
let currentUserInterests = currentScript.getAttribute('data-user-interests');

if (currentUserInterests) {
  funTypes_UserOverride = JSON.parse(currentUserInterests);
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    // center: {lat: 51.5007, lng: -0.12406},
    center: londonCenter,
    zoom: londonZoom,
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

  locateButton.addEventListener('click', geolocateUser);
  searchButton.addEventListener('click', () => {
    hideLocatorButtons();
    setTimeout(() => createAutocomplete(), 1000);
  });
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

      // Waits till the locator button animation ends
      setTimeout(() => {
        createAutocomplete();
        addFriendHolder(pos, spySrc);
      }, 1000);

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

  autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', () => onPlaceChanged(autocompleteInput));
}

function createSearchInput () {
  const searchDiv = document.querySelector('#search');
  searchDiv.classList.remove('hidden');
}

function loadingGeolocation () {
  const locateButton = document.querySelector('.locateButton');
  locateButton.classList.add('loading');
}

function hideLocatorButtons() {
  const locatorDiv = document.querySelector('#locator');
  const locateButton = document.querySelector('.locateButton');

  locateButton.classList.remove('loading', 'geo');
  locateButton.textContent = '';
  locateButton.classList.add('shrink');
  setTimeout(() => locatorDiv.classList.add('hidden'), 1000);
}

function addFriendHolder(location, imgSrc) {
  const locatorParent = document.querySelector('.locatorParent');
  const friendHolder = document.querySelector('#clone');
  const fhCloned = friendHolder.cloneNode(true);
  let resultCountry;

  fhCloned.classList.remove('hidden');
  fhCloned.id = '';

  geocoder.geocode({ location: location }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {

      if (results[0].formatted_address) {
        addresses.push(results[0].formatted_address);

        const addressComponents_obj = results[0].address_components;

        for (addressCompenent of addressComponents_obj) {
          if (addressCompenent.types.includes('country')) {
            resultCountry = addressCompenent.short_name;
            unhideButtonsAndSetCountry(resultCountry);
            break;
          }
        }

      } else {
        // If first result has no formatted address
        addresses.push('Not available...');
      }

      const addressParagraph = fhCloned.childNodes[1].childNodes[3].childNodes[1];
      addressParagraph.textContent = addresses[addresses.length - 1];
    }
  })

  if (imgSrc) {
    const img = fhCloned.childNodes[1].childNodes[1];
    img.src = imgSrc;
  }

  locatorParent.insertBefore(fhCloned, friendHolder);
}

function unhideButtonsAndSetCountry(country) {
  if (locations.length === 1) {
    setCountryRestriction(country);
    const reloadIcon = document.getElementById('reloadMap');
    const autocompleteInput = document.getElementById('autocomplete');

    reloadIcon.classList.remove('disabled');
    reloadIcon.classList.add('pointer');

    reloadIcon.addEventListener('click', () => {
      window.location.reload();
    });

    autocompleteInput.placeholder = 'Where are your friends?';
    
  } else if (locations.length === 2) {
    const funFinderDiv = document.getElementById('funFinderDiv');
    funFinderDiv.classList.remove('hidden');
  }
}

function onPlaceChanged(inputElement) {
  let place = autocomplete.getPlace();

  inputElement.value = '';
  inputElement.focus();

  if (place && place.geometry && place.geometry.location) {
    let location = place.geometry.location.toJSON();
    locations.push(location);
    createMarkerClusterer();
    addFriendHolder(location);
  }
}

function search(radius) {

  const search = {
    location: map.getCenter(),
    radius: radius || DEFAULT_RADIUS,                // Upto 50 000
    types: funTypes_UserOverride || FUN_PLACE_TYPES,
    openNow: true,
    rankBy: google.maps.places.RankBy.PROMINENCE
  }

  places.nearbySearch(search, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {

      // Checks if number of results is less than max results shown
      let maxResults = 5;
      if (results.length < 5) {
        maxResults = results.length;
      }

      // Create a marker for each fun place found, and assign letter
      for (let i = 0; i < maxResults; i++) {
        let markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        let markerIcon = MARKER_PATH + markerLetter + '.png';

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
        setTimeout(() => {
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
  let newRadius;

  if (oldRadius) {
    newRadius = oldRadius * 1.5;
  } else {
    newRadius = DEFAULT_RADIUS * 1.5;
  }

  search(newRadius);
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
  let lastLocationIndex = locations.length - 1;
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

function setCountryRestriction(country) {
  const countryRestrict = {'country': country};
  autocomplete.setOptions({ componentRestrictions: countryRestrict });
}

// Not being used at the moment as is very buggy
function resetPage() {
  locations = [];
  const locateButton = document.querySelector('.locateButton');
  const fHolders = document.querySelectorAll('.friendHolder');
  const searchDiv = document.getElementById('search');
  const locatorDiv = document.getElementById('locator');
  const funFinderDiv = document.getElementById('funFinderDiv');

  locateButton.classList.add('geo');
  locateButton.innerHTML = '<i class="marker icon"></i>Locate Me';
  locateButton.classList.remove('shrink');

  for (fHolder of fHolders) {
    fHolder.classList.add('hidden');
  }
  searchDiv.classList.add('hidden');
  funFinderDiv.classList.add('hidden');
  locatorDiv.classList.remove('hidden');


  for (marker of markers) {
    marker.setVisible(false);
    marker.setMap(null);
  }
  markers = [];

  for (funMarker of funMarkers) {
    funMarker.setVisible(false);
    funMarker.setMap(null);
  }
  funMarkers = [];

  map.panTo(londonCenter);
  map.setZoom(londonZoom);

}
