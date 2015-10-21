'use strict';

var _          = require('lodash'),
	platform   = require('./platform'),
	GoogleMaps = require('googlemaps'),
	config     = require('./config.json'),
	googleMapsClient, geocodingType;

var _handleException = function (error) {
	console.error(error);
	platform.handleException(error);
	platform.sendResult(null);
};

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	if (geocodingType === 'Forward') {
		if (!_.isString(data.address)) return _handleException(new Error('Invalid address.'));

		var geocodeParams = {
			address: data.address,
			language: 'en'
		};

		googleMapsClient.geocode(geocodeParams, function (error, results) {
			if (error)
				_handleException(error);
			else if (results.status === 'ZERO_RESULTS')
				platform.sendResult(null);
			else if (results.status !== 'OK')
				_handleException(new Error(results.error_message));
			else {
				var result = {
					lat: _.get(results, 'results[0].geometry.location.lat'),
					lng: _.get(results, 'results[0].geometry.location.lng')
				};

				platform.sendResult(JSON.stringify(result));

				platform.log(JSON.stringify({
					title: 'Google Geocoding Service Result',
					input: data.address,
					result: result
				}));
			}
		});
	}
	else {
		if (_.isNaN(data.lat) || !_.isNumber(data.lat) || !_.inRange(data.lat, -90, 90) ||
			_.isNaN(data.lng) || !_.isNumber(data.lng) || !_.inRange(data.lng, -180, 180)) {

			_handleException(new Error('Latitude (lat) and Longitude (lng) are not valid. lat: ' + data.lat + ' lng:' + data.lng));
		}
		else {
			var reverseGeocodeParams = {
				latlng: data.lat + ',' + data.lng,
				language: 'en',
				location_type: 'APPROXIMATE'
			};

			googleMapsClient.reverseGeocode(reverseGeocodeParams, function (error, results) {
				if (error)
					_handleException(error);
				else if (results.status === 'ZERO_RESULTS')
					platform.sendResult(null);
				else if (results.status !== 'OK')
					_handleException(new Error(results.error_message));
				else {
					platform.sendResult(JSON.stringify({
						address: _.get(results, 'results[0].formatted_address')
					}));

					platform.log(JSON.stringify({
						title: 'Google Geocoding Service Result',
						input: {
							lat: data.lat,
							lng: data.lng
						},
						result: _.get(results, 'results[0].formatted_address')
					}));
				}
			});
		}
	}
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	platform.notifyClose(); // No resources to clean up. Just notify the platform.
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	var googleMapsClientConfig = {
		stagger_time: 1000, // for elevationPath
		encode_polylines: false,
		secure: true // use https
	};

	if (options.clientid) {
		googleMapsClientConfig.google_client_id = options.client_id;
		googleMapsClientConfig.google_private_key = options.key;
	}
	else
		googleMapsClientConfig.key = options.key;

	geocodingType = options.geocoding_type || config.geocoding_type.default;

	googleMapsClient = new GoogleMaps(googleMapsClientConfig);

	platform.log('Google Geocoding Service Initialized.');
	platform.notifyReady();
});