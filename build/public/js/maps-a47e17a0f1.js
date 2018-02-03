'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    this.funButton = document.querySelector('.funFinder');
    this.searchButton = document.querySelector('button.search');
    this.locateButton = document.querySelector('button.locateButton');

    // Constants used by multiple methods
    this.LONDON_ZOOM = 12;
    this.DEFAULT_RADIUS = 1000; // Upto 50,000
    this.SPY_SRC = '/avatars/ninja.png';
    this.LONDON_CENTER = { lat: 51.509, lng: -0.116 };
    this.FUN_PLACE_TYPES = ['amusement_park', 'aquarium', 'art_gallery', 'bakery', 'bar', 'beauty_salon', 'book_store', 'bowling_alley', 'cafe', 'campground', 'car_rental', 'casino', 'gym', 'library', 'movie_theater', 'museum', 'night_club', 'park', 'restaurant', 'rv_park', 'shopping_mall', 'spa', 'stadium', 'zoo'];
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
        backgroundColor: 'rgb(242, 255, 254)'
      });

      // Sets class infoWindow variable
      this.infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
      });

      // Geocoder turns locations into coordinates
      this.geocoder = new google.maps.Geocoder();

      var mapController = this;

      // Various event listeners control page logic
      this.locateButton.addEventListener('click', function () {
        return mapController._geolocateUser();
      });
      this.searchButton.addEventListener('click', function () {
        mapController._searchFunctionality();
      });
      this.funButton.addEventListener('click', function () {
        return mapController._funSearch();
      });
    }

    // Finds user based on device GPS

  }, {
    key: '_geolocateUser',
    value: function _geolocateUser() {
      var _this = this;

      this._loadingGeolocation();

      // Uses HTML5 geolocation if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Saves first location and hides buttons
          _this.locations.push(pos);
          _this._hideLocatorButtons();

          // Waits till the locator button animation ends
          // Then adds friend holder box and search bar
          setTimeout(function () {
            _this._createAutocomplete();
            // Gives current user spy avatar
            _this._addFriendHolder(pos, _this.SPY_SRC);
          }, 1000);

          // Ensures markers in close proximity cluster
          _this._createMarkerClusterer();
        }, function () {
          // Error handler if location is not found
          _this._handleLocationError(true, _this.infoWindow, _this.map.getCenter());
        });
      } else {
        // Error handler if browser doesn't support Geolocation
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
      }, 1000);
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
        this.locations.push(location);
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

      // Creates map markers and pushes into markers array
      this.markers.push(new google.maps.Marker({
        position: mapController.locations[lastLocationIndex],
        label: labels[lastLocationIndex % labels.length],
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
      var _this2 = this;

      // Optional parameter that creates a lag for effect
      if (!msTimeOut) {
        var _msTimeOut = 0;
      }

      var bounds = new google.maps.LatLngBounds();

      // Extends bounds for each location
      locations.forEach(function (location) {
        var locationLatLng = new google.maps.LatLng({
          lat: location.lat,
          lng: location.lng
        });
        bounds.extend(locationLatLng);
      });

      // Sets zoom and center based on bounds
      if (locations.length === 1) {
        setTimeout(function () {
          _this2.map.setCenter(bounds.getCenter());
          // If only one location, uses zoom level 18
          _this2.map.setZoom(18);
        }, msTimeOut);
      } else {
        setTimeout(function () {
          _this2.map.setCenter(bounds.getCenter());
          _this2.map.fitBounds(bounds, 33);
        }, msTimeOut);
      }
    }

    // Adds friend holder with optional avatar parameter

  }, {
    key: '_addFriendHolder',
    value: function _addFriendHolder(location, imgSrc) {
      var _this3 = this;

      var locatorParent = document.querySelector('.locatorParent');
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
            _this3.addresses.push(results[0].formatted_address);

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
                  _this3._setCountryAndUnhideFunFinder(resultCountry);
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
            _this3.addresses.push('Not available...');
          }

          // Enters found location into friend holder paragraph
          var addressParagraph = fhCloned.children[0].children[1].children[0];
          addressParagraph.textContent = _this3.addresses[_this3.addresses.length - 1];
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
      var _this4 = this;

      this._hideLocatorButtons();
      setTimeout(function () {
        return _this4._createAutocomplete();
      }, 1000);

      // Closes infoWindow once error is handled
      if (isError) {
        setTimeout(function () {
          return _this4.infoWindow.close();
        }, 2500);
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
        var funFinderDiv = document.getElementById('funFinderDiv');
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
      this.infoWindow.setPosition(pos);
      this.infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
      this.infoWindow.open(this.map);

      // Sets up search bar to find locations
      this._searchFunctionality(true);
    }

    // Searches for fun places based on mid point

  }, {
    key: '_funSearch',
    value: function _funSearch(radius) {
      var _this5 = this;

      var mapController = this;

      // Sets search location
      var search = {
        location: mapController.map.getCenter(),
        radius: radius || mapController.DEFAULT_RADIUS,
        types: mapController.funTypes_UserOverride || mapController.FUN_PLACE_TYPES,
        openNow: true,
        rankBy: google.maps.places.RankBy.PROMINENCE

        // Searches with Googles places library
      };this.places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {

          // Checks if number of results is less than max results shown
          var maxResults = 5;
          if (results.length < 5) {
            // maxResults = results.length;
            _this5._reSearch(radius);
            return;
          }

          // Creates a marker for each fun place found, and assigns letter

          var _loop = function _loop(i) {
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i % 26);
            var markerIcon = _this5.MARKER_PATH + markerLetter + '.png';

            // Use marker animation to drop the icons incrementally on the map
            _this5.funMarkers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });

            // Saves fun locations to array
            _this5.funLocations.push(results[i].geometry.location.toJSON());

            // If the user clicks a marker, show the details in the info window
            _this5.funMarkers[i].placeResult = results[i];
            google.maps.event.addListener(mapController.funMarkers[i], 'click', function () {
              var marker = mapController.funMarkers[i];
              mapController._showInfoWindow(marker);
            });

            // Drops markers onto map
            setTimeout(function () {
              _this5.funMarkers[i].setMap(_this5.map);
            }, i * 100);
          };

          for (var i = 0; i < maxResults; i++) {
            _loop(i);
          }

          // Zooms into locations once they have been decided
          // Uses 2300ms timeout for effect
          _this5._setZoomAndCenter(_this5.funLocations, 2300);
        } else {
          // If no results are found, searches again with larger radius
          _this5._reSearch(radius);
        }
      });
    }

    // Dispaly location info window

  }, {
    key: '_showInfoWindow',
    value: function _showInfoWindow(marker) {
      var _this6 = this;

      // Shows information about location
      this.places.getDetails({ placeId: marker.placeResult.place_id }, function (place, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        _this6.infoWindow.open(_this6.map, marker);
        _this6._buildIWContent(place);
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