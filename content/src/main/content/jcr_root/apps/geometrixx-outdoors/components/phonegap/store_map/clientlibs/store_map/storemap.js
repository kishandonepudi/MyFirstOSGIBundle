/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

var CQStoreMap = function(options) {

    // Extend the default settings
    var settings = jQuery.extend({
        rootElementId: "map",
        canvasClass: "mapCanvas",
        originAddress: "343 Preston St. Ottawa, ON",
        destinationAddress: "111 Beech Street, Ottawa, ON",
        originLatLng: new google.maps.LatLng(45.401716, -75.710149),
        sensor: true
    }, options);

    var $rootElement = jQuery("#" + settings.rootElementId);

    // Error message
    var LOCATION_OFF_ERROR = "Please enable location services and try again."

    // Initialize the PhoneGap store map component
    this.initializeStoreMapComponent = function() {
        // Handle location related errors
        var error = function(error) {
            if (PositionError.POSITION_UNAVAILABLE == error.code || PositionError.PERMISSION_DENIED == error.code) {
                $rootElement.find("." + settings.canvasClass).html( LOCATION_OFF_ERROR );
            }
            else {
                alert('Location error code: ' + error.code + '\n' +
                    'message: ' + error.message);
            }
        };

        // Use PhoneGap device integration to query our user's location
        // On success, fetch directions and display map
        navigator.geolocation.getCurrentPosition(extractLocation, error);
    };

    // The position parameter is a Cordorva object: http://docs.phonegap.com/en/1.6.1/cordova_geolocation_geolocation.md.html#Position 
    var extractLocation = function(position) {
        settings.originAddress = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        settings.originLatLng = settings.originAddress;

        fetchDirections();
    };

    // Fetch directions from Google
    var fetchDirections = function() {

        // Locate the map canvas
        var mapCanvasElement = $rootElement.find("." + settings.canvasClass)[0];
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();

        var mapOptions = {
            zoom:7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: settings.originLatLng
        };

        map = new google.maps.Map(mapCanvasElement, mapOptions);
        directionsDisplay.setMap(map);

        var request = {
            origin: settings.originAddress,
            destination: settings.destinationAddress,
            provideRouteAlternatives: false,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
        }

        directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
            }
        });
    };
}