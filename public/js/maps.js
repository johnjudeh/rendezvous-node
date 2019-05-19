// 1. NAVIGATION CONTROLLER

// Handles page navigation logic
class NavController {

  // Sets variables and calls initial methods
  constructor() {
    // Creates class properties
    this.arrowIcon = document.querySelector('.icon.angle.left');
    this.friendFinder = document.querySelector('.locations');
    this.body = document.body;

    // Calls private class methods
    this._manageEvents();
  }

  // Adds event listeners for Friend Holder navigation
  _manageEvents() {
    // Arrow icon opens the Friend Finder tab
    this.arrowIcon.addEventListener('click', (event) => {
      this.friendFinder.classList.toggle('open');
    });

    // Ensures that body event is not fired when clicking on
    // Friend Finder
    this.friendFinder.addEventListener('click', (event) => {
      event.stopPropagation();
    })

    // Closes Friend Finder tab when the body is clicked
    this.body.addEventListener('click', () => {
      this.friendFinder.classList.remove('open');
    });
  }
}

// Initiates NavController on page load
const navController = new NavController();


// 2. MAP CONTROLLER

// Function called async by Google Maps script
function initMap() {
  const mapController = new MapController();
}

// Handles all map logic
class MapController {

  // Sets variables and calls initial methods
  constructor() {
    // Properties used by multiple methods
    this.map;
    this.places;
    this.markers = [];
    this.geocoder;
    this.locations = [];
    this.addresses = [];
    this.funMarkers = [];
    this.infoWindow;
    this.autocomplete;
    this.funLocations = [];
    this.funTypes_UserOverride;
    this.funButton = document.querySelector('.fun-finder-sec__fun-btn');
    this.searchButton = document.querySelector('button.search');
    this.locateButton = document.querySelector('button.locateButton');

    // Constants used by multiple methods
    this.LONDON_ZOOM = 12;
    this.DEFAULT_RADIUS = 1000;           // Upto 50,000
    this.FH_TIMEOUT = 700;
    this.CENTER_TIMEOUT = 2300;
    this.ERROR_TIMEOUT = 2500;
    this.SPY_SRC = '/avatars/ninja.png';
    this.LONDON_CENTER = {lat: 51.505, lng: -0.123};
    this.FUN_PLACE_CATEGORIES = [ 'Attractions', 'Out & About', 'Adventure', 'Night Life',
                                  'Smarts & Arts', 'Wellness'
                                ];
    this.FUN_PLACE_TYPES = [ 'amusement_park', 'aquarium', 'art_gallery', 'bakery',
                              'bar', 'beauty_salon', 'book_store', 'bowling_alley',
                              'cafe', 'campground', 'car_rental', 'casino', 'gym',
                              'library', 'movie_theater', 'museum', 'night_club',
                              'park', 'restaurant', 'rv_park', 'shopping_mall', 'spa',
                              'stadium', 'zoo'
                            ];
    this.FUN_PLACE_TYPES_AND_CATEGORIES = [
      { type: this.FUN_PLACE_TYPES[0], category: this.FUN_PLACE_CATEGORIES[2] },
      { type: this.FUN_PLACE_TYPES[1], category: this.FUN_PLACE_CATEGORIES[0] },
      { type: this.FUN_PLACE_TYPES[2], category: this.FUN_PLACE_CATEGORIES[4] },
      { type: this.FUN_PLACE_TYPES[3], category: this.FUN_PLACE_CATEGORIES[1] },
      { type: this.FUN_PLACE_TYPES[4], category: this.FUN_PLACE_CATEGORIES[3] },
      { type: this.FUN_PLACE_TYPES[5], category: this.FUN_PLACE_CATEGORIES[5] },
      { type: this.FUN_PLACE_TYPES[6], category: this.FUN_PLACE_CATEGORIES[4] },
      { type: this.FUN_PLACE_TYPES[7], category: this.FUN_PLACE_CATEGORIES[3] },
      { type: this.FUN_PLACE_TYPES[8], category: this.FUN_PLACE_CATEGORIES[1] },
      { type: this.FUN_PLACE_TYPES[9], category: this.FUN_PLACE_CATEGORIES[2] },
      { type: this.FUN_PLACE_TYPES[10], category: this.FUN_PLACE_CATEGORIES[2] },
      { type: this.FUN_PLACE_TYPES[11], category: this.FUN_PLACE_CATEGORIES[0] },
      { type: this.FUN_PLACE_TYPES[12], category: this.FUN_PLACE_CATEGORIES[5] },
      { type: this.FUN_PLACE_TYPES[13], category: this.FUN_PLACE_CATEGORIES[4] },
      { type: this.FUN_PLACE_TYPES[14], category: this.FUN_PLACE_CATEGORIES[3] },
      { type: this.FUN_PLACE_TYPES[15], category: this.FUN_PLACE_CATEGORIES[0] },
      { type: this.FUN_PLACE_TYPES[16], category: this.FUN_PLACE_CATEGORIES[3] },
      { type: this.FUN_PLACE_TYPES[17], category: this.FUN_PLACE_CATEGORIES[0] },
      { type: this.FUN_PLACE_TYPES[18], category: this.FUN_PLACE_CATEGORIES[1] },
      { type: this.FUN_PLACE_TYPES[19], category: this.FUN_PLACE_CATEGORIES[2] },
      { type: this.FUN_PLACE_TYPES[20], category: this.FUN_PLACE_CATEGORIES[1] },
      { type: this.FUN_PLACE_TYPES[21], category: this.FUN_PLACE_CATEGORIES[5] },
      { type: this.FUN_PLACE_TYPES[22], category: this.FUN_PLACE_CATEGORIES[0] },
      { type: this.FUN_PLACE_TYPES[23], category: this.FUN_PLACE_CATEGORIES[0] }
    ]
    this.MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
    this.CLUSTER_IMAGE = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
    // Methods called at instansiation
    this._getUserPreferences();
    this._createMap();
  }

  // Pulls logged in user location preferences
  _getUserPreferences() {
    const currentScript = document.getElementById('mapScript');
    const currentUserInterests = currentScript.getAttribute('data-user-interests');

    if (currentUserInterests) {
      this.funTypes_UserOverride = JSON.parse(currentUserInterests);
    }
  }

  // Creates map and adds button events
  _createMap() {
    // Creates map when google script is called centred on London
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: this.LONDON_CENTER,
      zoom: this.LONDON_ZOOM,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      backgroundColor: 'rgb(242, 255, 254)'
    });

    // Geocoder turns locations into coordinates
    this.geocoder = new google.maps.Geocoder();

    const mapController = this;

    // Various event listeners control page logic
    this.locateButton.addEventListener('click', () => {
      mapController._geolocateUser()
    }, {once: true});

    this.searchButton.addEventListener('click', () => {
      mapController._searchFunctionality();
    }, {once: true});

    this.funButton.addEventListener('click', () => mapController._funSearch());
  }

  // Finds user based on device GPS
  _geolocateUser() {
    this._loadingGeolocation();

    // Uses HTML5 geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Saves first location and hides buttons
        this.locations.push({
          coords: pos,
        });
        this._hideLocatorButtons();

        // Waits till the locator button animation ends
        // Then adds friend holder box and search bar
        setTimeout(() => {
          this._createAutocomplete();
          // Gives current user spy avatar
          this._addFriendHolder(pos, this.SPY_SRC);
        }, this.FH_TIMEOUT);

        // Ensures markers in close proximity cluster
        this._createMarkerClusterer();

      }, () => {
        // Error handler if location is not found
        this.infoWindow = new google.maps.InfoWindow();
        this._handleLocationError(true, this.infoWindow, this.map.getCenter());
      });
    } else {
      // Error handler if browser doesn't support Geolocation
      this.infoWindow = new google.maps.InfoWindow();
      this._handleLocationError(false, this.infoWindow, this.map.getCenter());
    }
  }

  // Simulates loading as geolocation is found
  _loadingGeolocation () {
    const locateButton = document.querySelector('.locateButton');
    locateButton.classList.add('loading');
  }

   // Hides buttons
  _hideLocatorButtons() {
    const locatorDiv = document.querySelector('#locator');
    const locateButton = document.querySelector('.locateButton');

    locateButton.classList.remove('loading', 'geo');
    locateButton.textContent = '';
    locateButton.classList.add('shrink');
    setTimeout(() => locatorDiv.classList.add('hidden'), this.FH_TIMEOUT);
  }

  // Creates google's autocomplete search bar
  _createAutocomplete() {
    // replaces locations buttons with search bar
    this._createsearchInput();

    const autocompleteInput = document.getElementById('autocomplete');
    autocompleteInput.focus();

    // Creates search functionality
    this.autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
    this.places = new google.maps.places.PlacesService(this.map);

    const mapController = this;
    this.autocomplete.addListener('place_changed', () => mapController._onPlaceChanged(autocompleteInput));
  }

  // Creates the map search bar
  _createsearchInput () {
    const searchDiv = document.querySelector('#search');
    searchDiv.classList.remove('hidden');
  }

  // Calls markerClusterer and deletes search bar input
  _onPlaceChanged(inputElement) {
    const place = this.autocomplete.getPlace();

    inputElement.value = '';
    inputElement.focus();

    if (place && place.geometry && place.geometry.location) {
      const location = place.geometry.location.toJSON();
      this.locations.push({
        coords: location,
      });
      this._createMarkerClusterer();
      this._addFriendHolder(location);
    }
  }

  // Places markers + ensures marker clustering
  _createMarkerClusterer(){
    const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lastLocationIndex = this.locations.length - 1;
    const mapController = this;
    const location = this.locations[lastLocationIndex];
    const label = labels[lastLocationIndex % labels.length];

    // Adds label to each location
    location.label = label;

    // Creates map markers and pushes into markers array
    this.markers.push(new google.maps.Marker({
      position: location.coords,
      label: label,
      animation: google.maps.Animation.DROP
    }));

    // Makes close markers cluster
    const markerCluster = new MarkerClusterer(this.map, this.markers,
      {imagePath: this.CLUSTER_IMAGE});

    // Adjust map's zoom and center point
    this._setZoomAndCenter(this.locations);
  }

  // Adjusts map's zoom and center point
  _setZoomAndCenter(locations, msTimeOut) {

    // Optional parameter that creates a lag for effect
    if (!msTimeOut) {
      let msTimeOut = 0;
    }

    let bounds = new google.maps.LatLngBounds();

    // Extends bounds for each location
    locations.forEach((location) => {
      const locationLatLng = new google.maps.LatLng({
        lat: location.coords.lat,
        lng: location.coords.lng
      })
      bounds.extend(locationLatLng);
    });

    // Sets zoom and center based on bounds
    if (locations.length === 1) {
      setTimeout(() => {
        this.map.setCenter(bounds.getCenter());
        // If only one location, uses zoom level 18
        this.map.setZoom(18);
      }, msTimeOut);

    } else {
      setTimeout(() => {
        this.map.setCenter(bounds.getCenter());
        this.map.fitBounds(bounds, 60);
      }, msTimeOut);
    }

  }

  // Adds friend holder with optional avatar parameter
  _addFriendHolder(location, imgSrc) {
    const locatorParent = document.querySelector('.locator-parent');
    const friendHolder = document.querySelector('#clone');
    const fhCloned = friendHolder.cloneNode(true);
    let resultCountry;

    // Shows friend holder
    fhCloned.classList.remove('hidden');
    fhCloned.id = '';

    // Translates coordinates into location
    this.geocoder.geocode({ location: location }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {

        if (results[0].formatted_address) {
          // Pushs address into addresses array
          this.addresses.push(results[0].formatted_address);

          const addressComponents_obj = results[0].address_components;

          // Sets search restrictions to first country chosen
          for (let addressCompenent of addressComponents_obj) {
            if (addressCompenent.types.includes('country')) {
              resultCountry = addressCompenent.short_name;
              this._setCountryAndUnhideFunFinder(resultCountry);
              break;
            }
          }

        } else {
          // If first result has no formatted address
          this.addresses.push('Not available...');
        }

        // Enters found location into friend holder paragraph
        const addressParagraph = fhCloned.children[0].children[1].children[0];
        addressParagraph.textContent = this.addresses[this.addresses.length - 1];
      }
    })

    // Enters optional avatar into friend holder img
    if (imgSrc) {
      const img = fhCloned.children[0].children[0];
      img.src = imgSrc;
    }

    // Adds friend holder into DOM
    locatorParent.insertBefore(fhCloned, friendHolder);
  }

  // Called by search button or error
  _searchFunctionality(isError) {
    this._hideLocatorButtons();
    setTimeout(() => this._createAutocomplete(), this.FH_TIMEOUT);

    // Closes infoWindow once error is handled
    if (isError) {
      setTimeout(() => this.infoWindow.close(), this.ERROR_TIMEOUT);
    }
  }

  // Shows fun finder button and sets country restriction
  _setCountryAndUnhideFunFinder(country) {

    // Sets country restriction based on 1st location
    if (this.locations.length === 1) {
      this._setCountryRestriction(country);
      const reloadIcon = document.getElementById('reloadMap');
      const autocompleteInput = document.getElementById('autocomplete');

      reloadIcon.classList.remove('disabled');
      reloadIcon.classList.add('pointer');

      reloadIcon.addEventListener('click', () => {
        window.location.reload();
      });

      autocompleteInput.placeholder = 'Where are your friends?';

    // Activates fun finder button for >=2 locations
    } else if (this.locations.length === 2) {
      const funFinderDiv = document.getElementById('fun-finder-div');
      funFinderDiv.classList.remove('hidden');
    }
  }

  // Sets search restriction to first country
  _setCountryRestriction(country) {
    const countryRestrict = {'country': country};
    this.autocomplete.setOptions({ componentRestrictions: countryRestrict });
  }

  // Geolocation error handler
  _handleLocationError(browserHasGeolocation, infoWindow, pos) {
    // Shows user error message
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(this.map);

    // Sets up search bar to find locations
    this._searchFunctionality(true);
  }

  // Searches for fun places based on mid point
  _funSearch(radius) {
    const mapController = this;

    // Resets class infoWindow variable for fun locations
    this.infoWindow = new google.maps.InfoWindow({
      content: document.getElementById('info-content')
    });

    // Sets search location
    const search = {
      location: mapController.map.getCenter(),
      radius: radius || mapController.DEFAULT_RADIUS,
      type: mapController.funTypes_UserOverride || mapController.FUN_PLACE_TYPES,
      openNow: true,
      rankBy: google.maps.places.RankBy.PROMINENCE
    }

    // Searches with Googles places library
    this.places.nearbySearch(search, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        let maxResults = 5;

        // If too few results, search is rerun
        if (results.length < 5) {
          this._reSearch(radius);
          return;
        }

        // Creates a marker for each fun place found, and assigns letter
        for (let i = 0; i < maxResults; i++) {
          const markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          const markerIcon = this.MARKER_PATH + markerLetter + '.png';

          // Use marker animation to drop the icons incrementally on the map
          this.funMarkers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
          });

          // Saves fun locations to array
          this.funLocations.push({
            coords: results[i].geometry.location.toJSON(),
            label: markerLetter
          });

          // If the user clicks a marker, show the details in the info window
          this.funMarkers[i].placeResult = results[i];
          google.maps.event.addListener(mapController.funMarkers[i], 'click', () => {
            const marker = mapController.funMarkers[i];
            mapController._showInfoWindow(marker);
          });

          // Drops markers onto map
          setTimeout(() => {
            this.funMarkers[i].setMap(this.map);
          }, i * 100);
        }

        // Zooms into locations once they have been decided
        // Uses 2300ms timeout for effect
        this._setZoomAndCenter(this.funLocations, this.CENTER_TIMEOUT);

        // Closes Friend Finder tab for users to see the results
        this._closeFriendFinder();

      } else {
        // If no results are found, searches again with larger radius
        this._reSearch(radius);
      }
    });
  }

  // Closes Friend Finder tab
  _closeFriendFinder() {
    const friendFinder = document.querySelector('.locations');
    friendFinder.classList.remove('open');
  }

  // Dispaly location info window
  _showInfoWindow(marker) {
    // Shows information about location
    this.places.getDetails({placeId: marker.placeResult.place_id},
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          this.infoWindow.open(this.map, marker);
          this._buildIWContent(place);
        });
  }

  // Adds location info to hidden table on page
  _buildIWContent(place) {
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

    // Assign a five-star rating to the location, using a black star ('&#10029;')
    // to indicate the rating the location has earned, and a white star ('&#10025;')
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
      const hostnameRegexp = new RegExp('^https?://.+?/');
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

  // Increases radius and calls search
  _reSearch(oldRadius) {
    let newRadius;

    // Sets larger radius
    if (oldRadius) {
      newRadius = oldRadius * 1.5;
    } else {
      newRadius = this.DEFAULT_RADIUS * 1.5;
    }

    this._funSearch(newRadius);
  }

}
