'use strict';

var platform   = require('./platform'),
	googlemaps = require('googlemaps'),
	googleAPI, isreverse;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {

	if (isreverse) {
		if (data.lat === 'undefined' || data.lon === 'undefined') {
			console.error(new Error('Latitude(data.lat)/Longitude(data.long) missing in data parameter'));
			platform.handleException(new Error('Latitude(data.lat)/Longitude(data.long) missing in data parameter'));
			platform.sendResult(null);
		} else {
			var lat = data.lat,
				lon = data.lon;

			var reverseGeocodeParams = {
				'latlng':        lat + ',' + lon,
				'language':      'en',
				'location_type': 'APPROXIMATE'
			};

			googleAPI.reverseGeocode(reverseGeocodeParams, function(error, result){
				if (error || (result.status !== 'OK' && result.status !== 'ZERO_RESULTS')) {
					console.error(error);
					platform.handleException(error);
				} else  {
					platform.sendResult(result); //array of results including the status of the request
				}
			});

		}

	} else {

		var address = data;

		var geocodeParams = {
			'address':    address,
			'language':   'en'
		};

		googleAPI.geocode(geocodeParams, function(error, result){
			if (error || (result.status !== 'OK' && result.status !== 'ZERO_RESULTS')) {
				console.error(error);
				platform.handleException(error);
			} else  {
				platform.sendResult(result); //array of results including the status of the request
			}
		});
	}


});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {


	var config = {
		stagger_time:       1000, // for elevationPath
		encode_polylines:   false,
		secure:             true // use https
	};

	if (options.forwork) {
		config.google_client_id   = options.clientid;
		config.google_private_key = options.privatekey;
	}else
		config.key = options.apikey;

	if (options.proxy)
		config.proxy = options.proxy;

	isreverse = options.isreverse;

	googleAPI = new googlemaps(config);

	platform.log('Google Geocode Service Initialized.');
	platform.notifyReady();

});