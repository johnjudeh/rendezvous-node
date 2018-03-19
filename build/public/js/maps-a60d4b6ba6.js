'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 1. NAVIGATION CONTROLLER

// Handles page navigation logic
var NavController = function () {

  // Sets variables and calls initial methods
  function NavController() {
    _classCallCheck(this, NavController);

    // Creates class properties
    this.arrowIcon = document.querySelector('.icon.angle.left');
    this.friendFinder = document.querySelector('.locations');
    this.body = document.body;

    // Calls private class methods
    this._manageEvents();
  }

  // Adds event listeners for Friend Holder navigation


  _createClass(NavController, [{
    key: '_manageEvents',
    value: function _manageEvents() {
      var _this = this;

      // Arrow icon opens the Friend Finder tab
      this.arrowIcon.addEventListener('click', function (event) {
        _this.friendFinder.classList.toggle('open');
      });

      // Ensures that body event is not fired when clicking on
      // Friend Finder
      this.friendFinder.addEventListener('click', function (event) {
        event.stopPropagation();
      });

      // Closes Friend Finder tab when the body is clicked
      this.body.addEventListener('click', function () {
        _this.friendFinder.classList.remove('open');
      });
    }
  }]);

  return NavController;
}();

// Initiates NavController on page load


var navController = new NavController();

// 2. MAP CONTROLLER

// Function called async by Google Maps script
function initMap() {
  var mapController = new MapController();
}

// Handles all map logic

var MapController = function () {

  // Sets variables and calls initial methods
  function MapController() {
    _classCallCheck(this, MapController);

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
    this.DEFAULT_RADIUS = 1000; // Upto 50,000
    this.FH_TIMEOUT = 700;
    this.CENTER_TIMEOUT = 2300;
    this.ERROR_TIMEOUT = 2500;
    this.SPY_SRC = '/avatars/ninja-6879220b2d.png';
    this.LONDON_CENTER = { lat: 51.505, lng: -0.123 };
    this.FUN_PLACE_CATEGORIES = ['Attractions', 'Out & About', 'Adventure', 'Night Life', 'Smarts & Arts', 'Wellness'];
    this.FUN_PLACE_TYPES = ['amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bar', 'beauty_salon', 'book_store', 'bowling_alley', 'cafe', 'campground', 'car_rental', 'casino', 'gym', 'library', 'movie_theater', 'museum', 'night_club', 'park', 'restaurant', 'rv_park', 'shopping_mall', 'spa', 'stadium', 'zoo'];
    this.FUN_PLACE_TYPES_AND_CATEGORIES = [{ type: this.FUN_PLACE_TYPES[0], category: this.FUN_PLACE_CATEGORIES[2] }, { type: this.FUN_PLACE_TYPES[1], category: this.FUN_PLACE_CATEGORIES[0] }, { type: this.FUN_PLACE_TYPES[2], category: this.FUN_PLACE_CATEGORIES[4] }, { type: this.FUN_PLACE_TYPES[3], category: this.FUN_PLACE_CATEGORIES[1] }, { type: this.FUN_PLACE_TYPES[4], category: this.FUN_PLACE_CATEGORIES[3] }, { type: this.FUN_PLACE_TYPES[5], category: this.FUN_PLACE_CATEGORIES[5] }, { type: this.FUN_PLACE_TYPES[6], category: this.FUN_PLACE_CATEGORIES[4] }, { type: this.FUN_PLACE_TYPES[7], category: this.FUN_PLACE_CATEGORIES[3] }, { type: this.FUN_PLACE_TYPES[8], category: this.FUN_PLACE_CATEGORIES[1] }, { type: this.FUN_PLACE_TYPES[9], category: this.FUN_PLACE_CATEGORIES[2] }, { type: this.FUN_PLACE_TYPES[10], category: this.FUN_PLACE_CATEGORIES[2] }, { type: this.FUN_PLACE_TYPES[11], category: this.FUN_PLACE_CATEGORIES[0] }, { type: this.FUN_PLACE_TYPES[12], category: this.FUN_PLACE_CATEGORIES[5] }, { type: this.FUN_PLACE_TYPES[13], category: this.FUN_PLACE_CATEGORIES[4] }, { type: this.FUN_PLACE_TYPES[14], category: this.FUN_PLACE_CATEGORIES[3] }, { type: this.FUN_PLACE_TYPES[15], category: this.FUN_PLACE_CATEGORIES[0] }, { type: this.FUN_PLACE_TYPES[16], category: this.FUN_PLACE_CATEGORIES[3] }, { type: this.FUN_PLACE_TYPES[17], category: this.FUN_PLACE_CATEGORIES[0] }, { type: this.FUN_PLACE_TYPES[18], category: this.FUN_PLACE_CATEGORIES[1] }, { type: this.FUN_PLACE_TYPES[19], category: this.FUN_PLACE_CATEGORIES[2] }, { type: this.FUN_PLACE_TYPES[20], category: this.FUN_PLACE_CATEGORIES[1] }, { type: this.FUN_PLACE_TYPES[21], category: this.FUN_PLACE_CATEGORIES[5] }, { type: this.FUN_PLACE_TYPES[22], category: this.FUN_PLACE_CATEGORIES[0] }, { type: this.FUN_PLACE_TYPES[23], category: this.FUN_PLACE_CATEGORIES[0] }];
    this.MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
    this.CLUSTER_IMAGE = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
    // Methods called at instansiation
    this._getUserPreferences();
    this._createMap();
  }

  // Pulls logged in user location preferences


  _createClass(MapController, [{
    key: '_getUserPreferences',
    value: function _getUserPreferences() {
      var currentScript = document.getElementById('mapScript');
      var currentUserInterests = currentScript.getAttribute('data-user-interests');

      if (currentUserInterests) {
        this.funTypes_UserOverride = JSON.parse(currentUserInterests);
      }
    }

    // Creates map and adds button events

  }, {
    key: '_createMap',
    value: function _createMap() {
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

      var mapController = this;

      // Various event listeners control page logic
      this.locateButton.addEventListener('click', function () {
        mapController._geolocateUser();
      }, { once: true });

      this.searchButton.addEventListener('click', function () {
        mapController._searchFunctionality();
      }, { once: true });

      this.funButton.addEventListener('click', function () {
        return mapController._funSearch();
      });
    }

    // Finds user based on device GPS

  }, {
    key: '_geolocateUser',
    value: function _geolocateUser() {
      var _this2 = this;

      this._loadingGeolocation();

      // Uses HTML5 geolocation if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Saves first location and hides buttons
          _this2.locations.push({
            coords: pos
          });
          _this2._hideLocatorButtons();

          // Waits till the locator button animation ends
          // Then adds friend holder box and search bar
          setTimeout(function () {
            _this2._createAutocomplete();
            // Gives current user spy avatar
            _this2._addFriendHolder(pos, _this2.SPY_SRC);
          }, _this2.FH_TIMEOUT);

          // Ensures markers in close proximity cluster
          _this2._createMarkerClusterer();
        }, function () {
          // Error handler if location is not found
          _this2.infoWindow = new google.maps.InfoWindow();
          _this2._handleLocationError(true, _this2.infoWindow, _this2.map.getCenter());
        });
      } else {
        // Error handler if browser doesn't support Geolocation
        this.infoWindow = new google.maps.InfoWindow();
        this._handleLocationError(false, this.infoWindow, this.map.getCenter());
      }
    }

    // Simulates loading as geolocation is found

  }, {
    key: '_loadingGeolocation',
    value: function _loadingGeolocation() {
      var locateButton = document.querySelector('.locateButton');
      locateButton.classList.add('loading');
    }

    // Hides buttons

  }, {
    key: '_hideLocatorButtons',
    value: function _hideLocatorButtons() {
      var locatorDiv = document.querySelector('#locator');
      var locateButton = document.querySelector('.locateButton');

      locateButton.classList.remove('loading', 'geo');
      locateButton.textContent = '';
      locateButton.classList.add('shrink');
      setTimeout(function () {
        return locatorDiv.classList.add('hidden');
      }, this.FH_TIMEOUT);
    }

    // Creates google's autocomplete search bar

  }, {
    key: '_createAutocomplete',
    value: function _createAutocomplete() {
      // replaces locations buttons with search bar
      this._createsearchInput();

      var autocompleteInput = document.getElementById('autocomplete');
      autocompleteInput.focus();

      // Creates search functionality
      this.autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
      this.places = new google.maps.places.PlacesService(this.map);

      var mapController = this;
      this.autocomplete.addListener('place_changed', function () {
        return mapController._onPlaceChanged(autocompleteInput);
      });
    }

    // Creates the map search bar

  }, {
    key: '_createsearchInput',
    value: function _createsearchInput() {
      var searchDiv = document.querySelector('#search');
      searchDiv.classList.remove('hidden');
    }

    // Calls markerClusterer and deletes search bar input

  }, {
    key: '_onPlaceChanged',
    value: function _onPlaceChanged(inputElement) {
      var place = this.autocomplete.getPlace();

      inputElement.value = '';
      inputElement.focus();

      if (place && place.geometry && place.geometry.location) {
        var location = place.geometry.location.toJSON();
        this.locations.push({
          coords: location
        });
        this._createMarkerClusterer();
        this._addFriendHolder(location);
      }
    }

    // Places markers + ensures marker clustering

  }, {
    key: '_createMarkerClusterer',
    value: function _createMarkerClusterer() {
      var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var lastLocationIndex = this.locations.length - 1;
      var mapController = this;
      var location = this.locations[lastLocationIndex];
      var label = labels[lastLocationIndex % labels.length];

      // Adds label to each location
      location.label = label;

      // Creates map markers and pushes into markers array
      this.markers.push(new google.maps.Marker({
        position: location.coords,
        label: label,
        animation: google.maps.Animation.DROP
      }));

      // Makes close markers cluster
      var markerCluster = new MarkerClusterer(this.map, this.markers, { imagePath: this.CLUSTER_IMAGE });

      // Adjust map's zoom and center point
      this._setZoomAndCenter(this.locations);
    }

    // Adjusts map's zoom and center point

  }, {
    key: '_setZoomAndCenter',
    value: function _setZoomAndCenter(locations, msTimeOut) {
      var _this3 = this;

      // Optional parameter that creates a lag for effect
      if (!msTimeOut) {
        var _msTimeOut = 0;
      }

      var bounds = new google.maps.LatLngBounds();

      // Extends bounds for each location
      locations.forEach(function (location) {
        var locationLatLng = new google.maps.LatLng({
          lat: location.coords.lat,
          lng: location.coords.lng
        });
        bounds.extend(locationLatLng);
      });

      // Sets zoom and center based on bounds
      if (locations.length === 1) {
        setTimeout(function () {
          _this3.map.setCenter(bounds.getCenter());
          // If only one location, uses zoom level 18
          _this3.map.setZoom(18);
        }, msTimeOut);
      } else {
        setTimeout(function () {
          _this3.map.setCenter(bounds.getCenter());
          _this3.map.fitBounds(bounds, 60);
        }, msTimeOut);
      }
    }

    // Adds friend holder with optional avatar parameter

  }, {
    key: '_addFriendHolder',
    value: function _addFriendHolder(location, imgSrc) {
      var _this4 = this;

      var locatorParent = document.querySelector('.locator-parent');
      var friendHolder = document.querySelector('#clone');
      var fhCloned = friendHolder.cloneNode(true);
      var resultCountry = void 0;

      // Shows friend holder
      fhCloned.classList.remove('hidden');
      fhCloned.id = '';

      // Translates coordinates into location
      this.geocoder.geocode({ location: location }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {

          if (results[0].formatted_address) {
            // Pushs address into addresses array
            _this4.addresses.push(results[0].formatted_address);

            var addressComponents_obj = results[0].address_components;

            // Sets search restrictions to first country chosen
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = addressComponents_obj[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var addressCompenent = _step.value;

                if (addressCompenent.types.includes('country')) {
                  resultCountry = addressCompenent.short_name;
                  _this4._setCountryAndUnhideFunFinder(resultCountry);
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
            _this4.addresses.push('Not available...');
          }

          // Enters found location into friend holder paragraph
          var addressParagraph = fhCloned.children[0].children[1].children[0];
          addressParagraph.textContent = _this4.addresses[_this4.addresses.length - 1];
        }
      });

      // Enters optional avatar into friend holder img
      if (imgSrc) {
        var img = fhCloned.children[0].children[0];
        img.src = imgSrc;
      }

      // Adds friend holder into DOM
      locatorParent.insertBefore(fhCloned, friendHolder);
    }

    // Called by search button or error

  }, {
    key: '_searchFunctionality',
    value: function _searchFunctionality(isError) {
      var _this5 = this;

      this._hideLocatorButtons();
      setTimeout(function () {
        return _this5._createAutocomplete();
      }, this.FH_TIMEOUT);

      // Closes infoWindow once error is handled
      if (isError) {
        setTimeout(function () {
          return _this5.infoWindow.close();
        }, this.ERROR_TIMEOUT);
      }
    }

    // Shows fun finder button and sets country restriction

  }, {
    key: '_setCountryAndUnhideFunFinder',
    value: function _setCountryAndUnhideFunFinder(country) {

      // Sets country restriction based on 1st location
      if (this.locations.length === 1) {
        this._setCountryRestriction(country);
        var reloadIcon = document.getElementById('reloadMap');
        var autocompleteInput = document.getElementById('autocomplete');

        reloadIcon.classList.remove('disabled');
        reloadIcon.classList.add('pointer');

        reloadIcon.addEventListener('click', function () {
          window.location.reload();
        });

        autocompleteInput.placeholder = 'Where are your friends?';

        // Activates fun finder button for >=2 locations
      } else if (this.locations.length === 2) {
        var funFinderDiv = document.getElementById('fun-finder-div');
        funFinderDiv.classList.remove('hidden');
      }
    }

    // Sets search restriction to first country

  }, {
    key: '_setCountryRestriction',
    value: function _setCountryRestriction(country) {
      var countryRestrict = { 'country': country };
      this.autocomplete.setOptions({ componentRestrictions: countryRestrict });
    }

    // Geolocation error handler

  }, {
    key: '_handleLocationError',
    value: function _handleLocationError(browserHasGeolocation, infoWindow, pos) {
      // Shows user error message
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(this.map);

      // Sets up search bar to find locations
      this._searchFunctionality(true);
    }

    // Searches for fun places based on mid point

  }, {
    key: '_funSearch',
    value: function _funSearch(radius) {
      var _this6 = this;

      var mapController = this;

      // Resets class infoWindow variable for fun locations
      this.infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
      });

      // Sets search location
      var search = {
        location: mapController.map.getCenter(),
        radius: radius || mapController.DEFAULT_RADIUS,
        type: mapController.funTypes_UserOverride || mapController.FUN_PLACE_TYPES,
        openNow: true,
        rankBy: google.maps.places.RankBy.PROMINENCE

        // Searches with Googles places library
      };this.places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {

          var maxResults = 5;

          // If too few results, search is rerun
          if (results.length < 5) {
            _this6._reSearch(radius);
            return;
          }

          // Creates a marker for each fun place found, and assigns letter

          var _loop = function _loop(i) {
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
            var markerIcon = _this6.MARKER_PATH + markerLetter + '.png';

            // Use marker animation to drop the icons incrementally on the map
            _this6.funMarkers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });

            // Saves fun locations to array
            _this6.funLocations.push({
              coords: results[i].geometry.location.toJSON(),
              label: markerLetter
            });

            // If the user clicks a marker, show the details in the info window
            _this6.funMarkers[i].placeResult = results[i];
            google.maps.event.addListener(mapController.funMarkers[i], 'click', function () {
              var marker = mapController.funMarkers[i];
              mapController._showInfoWindow(marker);
            });

            // Drops markers onto map
            setTimeout(function () {
              _this6.funMarkers[i].setMap(_this6.map);
            }, i * 100);
          };

          for (var i = 0; i < maxResults; i++) {
            _loop(i);
          }

          // Zooms into locations once they have been decided
          // Uses 2300ms timeout for effect
          _this6._setZoomAndCenter(_this6.funLocations, _this6.CENTER_TIMEOUT);

          // Closes Friend Finder tab for users to see the results
          _this6._closeFriendFinder();
        } else {
          // If no results are found, searches again with larger radius
          _this6._reSearch(radius);
        }
      });
    }

    // Closes Friend Finder tab

  }, {
    key: '_closeFriendFinder',
    value: function _closeFriendFinder() {
      var friendFinder = document.querySelector('.locations');
      friendFinder.classList.remove('open');
    }

    // Dispaly location info window

  }, {
    key: '_showInfoWindow',
    value: function _showInfoWindow(marker) {
      var _this7 = this;

      // Shows information about location
      this.places.getDetails({ placeId: marker.placeResult.place_id }, function (place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        _this7.infoWindow.open(_this7.map, marker);
        _this7._buildIWContent(place);
      });
    }

    // Adds location info to hidden table on page

  }, {
    key: '_buildIWContent',
    value: function _buildIWContent(place) {
      document.getElementById('iw-icon').innerHTML = '<img class="funPlaceIcon" ' + 'src="' + place.icon + '"/>';
      document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url + '">' + place.name + '</a></b>';
      document.getElementById('iw-address').textContent = place.vicinity;

      if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent = place.formatted_phone_number;
      } else {
        document.getElementById('iw-phone-row').style.display = 'none';
      }

      // Assign a five-star rating to the location, using a black star ('&#10029;')
      // to indicate the rating the location has earned, and a white star ('&#10025;')
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
        var hostnameRegexp = new RegExp('^https?://.+?/');
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

    // Increases radius and calls search

  }, {
    key: '_reSearch',
    value: function _reSearch(oldRadius) {
      var newRadius = void 0;

      // Sets larger radius
      if (oldRadius) {
        newRadius = oldRadius * 1.5;
      } else {
        newRadius = this.DEFAULT_RADIUS * 1.5;
      }

      this._funSearch(newRadius);
    }
  }]);

  return MapController;
}();