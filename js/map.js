//Model: locations array used to place markers on the map as well as to filter them 
var locations = [
   {
      title: 'Cafe Des Delice', 
      location: {
        lat: 36.8701133, 
        lng: 10.3511667}
      },
    
    {
      title: 'Cafe Nattes', 
      location: {
        lat: 36.871115, 
        lng: 10.3482}
      },
    
    {
      title: 'Coste',
     location: {
      lat: 36.871957, 
      lng: 10.341325}
    },
    
    {
      title: 'The Lounge Dar Zarrouk',
       location: {
        lat: 36.87055, 
        lng: 10.349539}
    },
    
    {
      title: 'Art Cafe',
      location: {
        lat: 36.870763, 
        lng: 10.347574}
    },

    {
      title: 'Dar Dallaji',
      location: {
        lat: 36.8705339,
        lng: 10.3457563} 
    }
];

// Source -- Udacity Google maps APIs course "https://github.com/udacity/ud864" 

var map;
// Create a new blank array for all the listing markers.
var markers = [];


// Initialize map function
function initMap() {
  // Constructor creates a new map
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 36.869833, lng: 10.341369},
          zoom: 16,
          mapTypeControl: false
        });
  // attach a click event listener to the marker objects and open an info window on click
  // creates infoWindow for each location
  var infoWindow = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize.
  for (j = 0; j < locations.length; j++) {
    (function() {
            // Get the position from the location array.
           var position = locations[j].location;
           var title = locations[j].title;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP,
        address: address
      });
     // Push the marker to our array of markers.
      markers.push(marker);

      viewModel.filterLocations()[j].marker = marker;

      // Create an onclick event to open the large infoWindow at each marker.
      marker.addListener("click", function() {
        populateInfoWindow(this, infoWindow);
        infoWindow.setContent(contentString);
      });

      // This function populates the infoWindow when the marker is clicked. We'll only allow
      // one infoWindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infoWindow) {
        // Check to make sure the infoWindow is not already opened on this marker.
        if (infoWindow.marker != marker) {
          infoWindow.marker = marker;
          infoWindow.setContent(
            '<div class="title">' +
              marker.title +
              "</div>" +
              marker.contentString
          );
          // sets animation to bounce 2 times when marker is clicked
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
            marker.setAnimation(null);
          }, 1400);
          // Make sure the marker property is cleared if the infoWindow is closed.
          infoWindow.addListener("closeclick", function() {
            infoWindow.setMarker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infoWindow.setContent('<center><h4>' + marker.title + '</h4></center>'+ "<div class='category'>" +"Catergory: " + 
                                      "<span class='info'>" + category + "</span></div>" + "<div class='address'>" +
                                      "Address: " + "<span class='info'>" + address + "</span></div>" +
                                      "<div class='information'>" + "Details: " + "<a href='" + foursquareId + "'>" +
                                      "Click here" + "</a></div>"+ '<center><div id="pano"></div></center>');

                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infoWindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          infoWindow.open(map, marker);
        }
      } 

// foursquare client-id and client-secret 
      var client_id = "3RXKON431ZBWVSBAEDELQYVITYAA4SSGGCDYB542GB2E3HJN";
      var client_secret = "O33XR2NHHSLK4K3BGXQYI04QITCHHVFWI0FXMBQTQE2W0XZW";

      // foursquare api request url
      var reqURL = "https://api.foursquare.com/v2/venues/search";
      // declare variables to get ajax request of foursquare api data
      var venue, address, category, foursquareId, contentString;

      // ajax request of foursquare api data
      $.ajax({
        url: reqURL,
        dataType: "json",
        data: {
          client_id: client_id,
          client_secret: client_secret,
          query: marker.title,
          near: "Sid'Bou Said",
          v: 20190126
        },
        success: function(data) {
          // get venue info
          venue = data.response.venues[0];
          // get venue address info
          address = venue.location.formattedAddress[0];
          // get venue category info
          category = venue.categories[0].name;
          // gets link of place
          foursquareId = "https://foursquare.com/v/" + venue.id;
        },
        error: function() {
          alert('There is an issue while loading the Foursquare API. Please try again.');
        }
      });
    })(j);
  }
}

// Location Constructor
var Location = function(data) {
  var self = this;
  this.title = data.title;
  this.location = data.location;
  this.show = ko.observable(true);
};

// View Model 

var ViewModel = function() {
  var self = this;

  this.filterLocations = ko.observableArray();
  this.filteredInput = ko.observable("");


  for (i = 0; i < locations.length; i++) {
    var place = new Location(locations[i]);
    self.filterLocations.push(place);
  }

  // Set each marker's visibility to false and loop through the user inputs in the search bar.
  // If a map marker matchs with user key words, set its visibility to true.

  this.searchFilter = ko.computed(function() {
    var filter = self.filteredInput().toLowerCase();
    for (j = 0; j < self.filterLocations().length; j++) {
      if (
        self
          .filterLocations()
          [j].title.toLowerCase()
          .indexOf(filter) > -1
      ) {
        self.filterLocations()[j].show(true); 
        if (self.filterLocations()[j].marker) {
          self.filterLocations()[j].marker.setVisible(true);
        }
      } else {
        self.filterLocations()[j].show(false); 
        if (self.filterLocations()[j].marker) {
          self.filterLocations()[j].marker.setVisible(false);
        }
      }
    }
  });

// Source -- "https://developers.google.com/maps/documentation/javascript/events" 
  //show info of a particular marker clicked from the location list
  this.showLocation = function(locations) {
    google.maps.event.trigger(locations.marker, "click");
  };
};


var viewModel = new ViewModel();
ko.applyBindings(viewModel);

//handle map error 
function mapError() {
  alert("Google Maps has failed to load.");
}
