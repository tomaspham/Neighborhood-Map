// global
var map;

onGMapsError = function () {
    alert('There was an error occured with the Google Maps. Please try again later.');
};

function AppViewModel() {
    var self = this;
    this.markers = [];
    this.searchOption = ko.observable("");

    // Populates the infowindow when the marker is clicked
    this.populateInfoWindow = function (marker, infowindow) {
        if (infowindow.marker !== marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // Foursquare credentials
            var clientID = 'CWRZKRDH5H2GEQHR33BJEMQVCWOIODG4VGXSWV4XLNLCU13W';
            var clientSecret = 'EO3TC1U4W4ITWUOILMIJNK4M3YYDK13ESUWOFRYWXXG1DWPE';
            // URL for Foursquare API
            var apiUrl =
                'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.name +
                '&v=20181201' + '&m=foursquare';
            // Foursquare API
            $.getJSON(apiUrl).done(function (marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.category = response.categories[0].shortName;
                self.fourSquareHtml =
                    '<h3 class="four_square_subtitle">- ' + self.category + ' -</h3>' + '<div>' +
                    '<h5 class="four_square_address_title"> Address: </h5>' +
                    '<p class="four_square_address">' + self.street + '</p>' +
                    '<p class="four_square_address">' + self.city + '</p>' +
                    '<p class="four_square_four_square">@FourSquare Api Response</p>' +
                    '</p>' + '</div>' + '</div>';

                infowindow.setContent(self.html + self.fourSquareHtml);
            }).fail(function () {
                // Show alert
                alert("Foursquare API call failed. Refresh the page to retry.");
            });
            this.html = '<div>' + '<h3 class="four_square_title">' + marker.name + '</h3>';

            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    };

    this.populateMarkerWithBounce = function () {
        self.populateInfoWindow(this, self.infoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 1000);
    };


    this.initMap = function () {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 49.19482597859249, lng: 16.608447241979782},
            zoom: 15,
            styles: styles,
            mapTypeControl: false
        });

        // Set InfoWindow
        this.infoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < placeMarkers.length; i++) {
            this.markerName = placeMarkers[i].name;
            this.locationLat = placeMarkers[i].location.lat;
            this.locationLng = placeMarkers[i].location.lng;

            // Google Maps Markers
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.locationLat,
                    lng: this.locationLng
                },
                name: this.markerName,
                lat: this.locationLat,
                lng: this.locationLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateMarkerWithBounce);
        }
    };

    this.initMap();

    // markers - data bind
    this.markersFilter = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            // filter
            if (markerLocation.name.toLowerCase().includes(this.searchOption().toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

function init() {
    ko.applyBindings(new AppViewModel());
}

