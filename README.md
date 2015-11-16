# Google Geocoding Service

[![Build Status](https://travis-ci.org/Reekoh/google-geocoding-service.svg)](https://travis-ci.org/Reekoh/google-geocoding-service)
![Dependencies](https://img.shields.io/david/Reekoh/google-geocoding-service.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/google-geocoding-service.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Google Geocoding API Service Plugin for the Reekoh IoT platform. Integrates a Reekoh instance to Google's Geocoding API to do reverse and forward geocoding.

Uses [node-googlemaps](https://github.com/moshen/node-googlemaps) library.

## Forward Geocoding

__Input Data__

* address (String) - The address in String format.

__Output Data__

The latitude and longitude coordinate pair that corresponds to the given address. Sample below. 

```javascript
{
	lat: 51.52595849999999,
	lng: -0.0803709
}
```

## Reverse Geocoding

__Input Data__

* lat (Number) - Latitude
* lng (Number) - Longitude

__Output Data__

The address that corresponds to the given latitude and longitude coordinate pair. Sample below.

```javascript
{
	address: '#10 Jupiter St., Bel-Air, Makati, Metro Manila, Philippines'
}
```